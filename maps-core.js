(()=>{
  const DEFAULT_CENTER={lat:40.65,lng:35.83};
  let map,origin,destination,originMarker,destinationMarker,directionsRenderer,fallbackRouteLine,routeBaseLine,routeAnimationFrame,step=0,timers={},manualOriginEditing=false;
  let geocoder,placesLibrary;
  const $=selector=>document.querySelector(selector);

  function loadGoogleMaps(){
    if(window.google?.maps)return Promise.resolve(window.google.maps);
    if(window.__elmaGoogleMapsPromise)return window.__elmaGoogleMapsPromise;
    window.__elmaGoogleMapsPromise=new Promise((resolve,reject)=>{
      const key=window.GOOGLE_MAPS_API_KEY;
      if(!key){reject(new Error('Google Maps API anahtarı bulunamadı'));return}
      const callback='__elmaGoogleMapsReady';
      window[callback]=()=>{delete window[callback];resolve(window.google.maps)};
      const script=document.createElement('script');
      script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&libraries=places&language=tr&region=TR&v=weekly&loading=async&callback='+callback;
      script.async=true;
      script.onerror=()=>reject(new Error('Google Maps yüklenemedi'));
      document.head.appendChild(script);
    });
    return window.__elmaGoogleMapsPromise;
  }

  async function googleGeocodeSearch(query){
    const request={
      address:query,
      componentRestrictions:{country:'TR'},
      region:'TR'
    };
    const bounds=map?.getBounds?.();
    if(bounds)request.bounds=bounds;
    const results=await new Promise((resolve,reject)=>geocoder.geocode(
      request,
      (items,status)=>status==='OK'?resolve((items||[]).slice(0,6)):reject(new Error(status))
    ));
    return results.map(item=>({
      label:item.formatted_address,
      point:{lat:item.geometry.location.lat(),lon:item.geometry.location.lng(),name:item.formatted_address},
      source:'google'
    }));
  }

  async function fallbackSearch(query){
    try{
      const response=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=tr&addressdetails=1&limit=6&q='+encodeURIComponent(query),{headers:{'Accept-Language':'tr'}});
      const items=await response.json();
      return items.map(item=>({
        label:item.display_name,
        point:{lat:+item.lat,lon:+item.lon,name:item.display_name},
        source:'fallback'
      }));
    }catch(error){
      console.warn('Yedek adres araması başarısız:',error);
      return[];
    }
  }

  async function search(query){
    if(!query||query.trim().length<2)return[];
    if(placesLibrary?.AutocompleteSuggestion){
      try{
        const request={
          input:query,
          includedRegionCodes:['tr'],
          language:'tr',
          region:'tr'
        };
        const center=map?.getCenter?.();
        if(center)request.locationBias={center:{lat:center.lat(),lng:center.lng()},radius:50000};
        const response=await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        const suggestions=(response.suggestions||[]).slice(0,6).map(suggestion=>{
          const prediction=suggestion.placePrediction;
          const label=prediction?.text?.toString?.()||prediction?.mainText?.toString?.()||query;
          return {label,prediction,source:'google'};
        });
        if(suggestions.length)return suggestions;
      }catch(error){
        console.warn('Google Places araması kullanılamıyor, Google Geocoder deneniyor:',error);
      }
    }
    try{
      const googleResults=await googleGeocodeSearch(query);
      if(googleResults.length)return googleResults;
    }catch(error){
      console.warn('Google Geocoder araması kullanılamıyor:',error);
    }
    return fallbackSearch(query);
  }

  async function resolveSearchItem(item){
    if(item.point)return item.point;
    const place=item.prediction.toPlace();
    await place.fetchFields({fields:['displayName','formattedAddress','location']});
    if(!place.location)throw new Error('Konum bulunamadı');
    return {
      lat:place.location.lat(),
      lon:place.location.lng(),
      name:place.formattedAddress||place.displayName||item.label
    };
  }

  async function reverse(lon,lat){
    try{
      const result=await new Promise((resolve,reject)=>geocoder.geocode(
        {location:{lat,lng:lon}},
        (items,status)=>status==='OK'&&items?.[0]?resolve(items[0]):reject(new Error(status))
      ));
      return result.formatted_address||lat.toFixed(5)+', '+lon.toFixed(5);
    }catch(error){
      try{
        const response=await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon)+'&zoom=18&addressdetails=1',{headers:{'Accept-Language':'tr'}});
        const result=await response.json();
        return result.display_name||lat.toFixed(5)+', '+lon.toFixed(5);
      }catch(fallbackError){
        return lat.toFixed(5)+', '+lon.toFixed(5);
      }
    }
  }

  function marker(kind,point){
    const previous=kind==='origin'?originMarker:destinationMarker;
    previous?.setMap(null);
    const isOrigin=kind==='origin';
    const next=new google.maps.Marker({
      map,
      position:{lat:point.lat,lng:point.lon},
      title:isOrigin?'Başlangıç':'Varış',
      icon:{
        path:google.maps.SymbolPath.CIRCLE,
        scale:8,
        fillColor:isOrigin?'#09090a':'#ffffff',
        fillOpacity:1,
        strokeColor:isOrigin?'#ffffff':'#09090a',
        strokeWeight:4
      },
      zIndex:isOrigin?20:21
    });
    if(isOrigin)originMarker=next;else destinationMarker=next;
  }

  function flyTo(point,zoom=16){
    map.panTo({lat:point.lat,lng:point.lon});
    map.setZoom(zoom);
  }

  function mode(next){
    step=next;
    document.querySelectorAll('.elma-row').forEach(row=>row.classList.remove('active'));
    $(next===0?'.elma-row-origin':'.elma-row-destination')?.classList.add('active');
    const picked=$('#elmaPicked');
    if(picked)picked.textContent=next===0?'Haritada başlangıç konumuna dokun':'Haritada gitmek istediğin yere dokun';
  }

  function clearRoute(){
    if(routeAnimationFrame)cancelAnimationFrame(routeAnimationFrame);
    routeAnimationFrame=null;
    directionsRenderer?.setMap(null);
    directionsRenderer=null;
    fallbackRouteLine?.setMap(null);
    fallbackRouteLine=null;
    routeBaseLine?.setMap(null);
    routeBaseLine=null;
  }

  function animateRoute(path,duration=1900){
    if(!path?.length)return Promise.resolve();
    if(routeAnimationFrame)cancelAnimationFrame(routeAnimationFrame);
    fallbackRouteLine?.setMap(null);
    routeBaseLine?.setMap(null);
    routeBaseLine=new google.maps.Polyline({
      map,path,strokeColor:'#c7c7ca',strokeWeight:5,strokeOpacity:.48,
      clickable:false,zIndex:3
    });
    fallbackRouteLine=new google.maps.Polyline({
      map,path:[path[0]],strokeColor:'#747478',strokeWeight:6,strokeOpacity:.96,
      clickable:false,zIndex:4
    });
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      fallbackRouteLine.setPath(path);
      return Promise.resolve();
    }
    return new Promise(resolve=>{
      const started=performance.now();
      const draw=now=>{
        const raw=Math.min(1,(now-started)/duration);
        const progress=1-Math.pow(1-raw,3);
        const last=Math.max(1,Math.floor(progress*(path.length-1)));
        fallbackRouteLine.setPath(path.slice(0,last+1));
        if(raw<1)routeAnimationFrame=requestAnimationFrame(draw);
        else{fallbackRouteLine.setPath(path);routeAnimationFrame=null;resolve()}
      };
      routeAnimationFrame=requestAnimationFrame(draw);
    });
  }

  function dragSheet(){
    const sheet=$('.elma-sheet'),grab=$('.elma-grab'),restore=$('.elma-restore');
    if(!sheet||!grab||!restore)return;
    let startY=0,deltaY=0,dragging=false;
    const closeSheet=()=>{
      sheet.classList.add('dismissed');
      restore.classList.add('show');
      grab.setAttribute('aria-expanded','false');
      restore.setAttribute('aria-expanded','false');
    };
    const openSheet=()=>{
      restore.classList.remove('show');
      sheet.classList.remove('dismissed');
      grab.setAttribute('aria-expanded','true');
      restore.setAttribute('aria-expanded','true');
    };
    const resetDrag=()=>{dragging=false;sheet.style.transform='';deltaY=0};
    grab.onpointerdown=event=>{dragging=true;startY=event.clientY;deltaY=0;grab.setPointerCapture?.(event.pointerId)};
    grab.onpointermove=event=>{if(!dragging)return;deltaY=Math.max(0,event.clientY-startY);sheet.style.transform='translateY('+deltaY+'px)'};
    grab.onpointerup=()=>{if(!dragging)return;const shouldClose=deltaY>90||deltaY<8;resetDrag();if(shouldClose)closeSheet()};
    grab.onpointercancel=resetDrag;
    grab.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();closeSheet()}};
    restore.onclick=openSheet;
  }

  function setup(){
    document.querySelector('.hero')?.setAttribute('style','display:none!important');
    document.querySelector('.top')?.setAttribute('style','display:none!important');
    const style=document.createElement('style');
    style.id='elmaFullscreenMapStyle';
    style.textContent=`html,body,.app{margin:0!important;width:100%!important;min-height:100%!important;max-width:none!important}.app{padding:0!important}.mapwrap{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;min-height:100vh!important;margin:0!important;border:0!important;border-radius:0!important;background:#f4f4f4!important;overflow:hidden!important}.mapwrap #map{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background:#f4f4f4!important}.gm-style{font-family:"Inter","Helvetica Neue",Arial,sans-serif}.gm-style-mtc,.gm-fullscreen-control,.gm-svpc,.gmnoprint.gm-bundled-control{display:none!important}.eg-bottom{display:none!important}.elma-home-screen,.elma-search-screen,.elma-event-screen{font-family:"Inter","Helvetica Neue",Arial,sans-serif;color:#09090a;background:#fff;-webkit-font-smoothing:antialiased}.elma-home-screen{position:absolute;z-index:810;inset:0;padding:calc(118px + env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) calc(112px + env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));overflow:auto}.elma-home-inner{width:100%;max-width:480px;margin:0 auto}.elma-quick-search{width:100%;height:66px;border:1px solid #d7d7d9;border-radius:36px;background:#fff;display:flex;align-items:center;gap:13px;padding:7px 8px 7px 20px;box-shadow:0 5px 13px rgba(0,0,0,.10);color:#09090a;text-align:left}.elma-quick-search:active{transform:scale(.992)}.elma-search-svg{width:27px;height:27px;flex:0 0 27px;fill:none;stroke:currentColor;stroke-width:2.25;stroke-linecap:round}.elma-quick-label{min-width:0;flex:1;font-size:20px;font-weight:570;letter-spacing:-.35px}.elma-later{height:50px;flex:0 0 auto;border:0;border-radius:28px;background:#f2f2f3;color:#09090a;display:flex;align-items:center;gap:8px;padding:0 17px;font-size:15px;font-weight:720;white-space:nowrap}.elma-later svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8}.elma-airport-card{width:100%;height:84px;margin-top:17px;border:1px solid #dedee0;border-radius:21px;background:#fff;display:grid;grid-template-columns:50px minmax(0,1fr) 20px;align-items:center;gap:11px;padding:10px 16px 10px 12px;color:#09090a;text-align:left}.elma-airport-icon{width:48px;height:48px;border-radius:15px;background:#f3f3f4;display:grid;place-items:center}.elma-airport-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.elma-airport-copy{min-width:0}.elma-airport-copy b,.elma-airport-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.elma-airport-copy b{font-size:16px;line-height:21px;font-weight:820}.elma-airport-copy small{font-size:13px;line-height:18px;color:#737373;margin-top:2px}.elma-airport-arrow{font-size:28px;color:#a1a1a5;font-weight:350}.elma-search-screen{position:fixed;z-index:860;inset:0;display:none;overflow:auto;padding:calc(18px + env(safe-area-inset-top)) max(19px,env(safe-area-inset-right)) 34px max(19px,env(safe-area-inset-left))}.elma-search-screen.show{display:block}.elma-search-inner{width:100%;max-width:520px;margin:0 auto}.elma-search-head{height:48px;display:grid;grid-template-columns:48px 1fr 48px;align-items:center}.elma-back{width:44px;height:44px;border:0;background:transparent;color:#09090a;display:grid;place-items:center;padding:0}.elma-back svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:2.15;stroke-linecap:round;stroke-linejoin:round}.elma-search-title{margin:0;text-align:center;font-size:27px;line-height:34px;font-weight:850;letter-spacing:-.8px;white-space:nowrap}.elma-search-body{margin-top:118px}.elma-route-wrap{display:flex;align-items:center;gap:13px}.elma-route-fields{position:relative;flex:1;min-width:0;border:3px solid #09090a;border-radius:22px;background:#fff;overflow:hidden}.elma-route-row{height:58px;display:flex;align-items:center;gap:15px;padding:0 16px;position:relative}.elma-route-row+.elma-route-row:before{content:"";position:absolute;left:58px;right:0;top:0;height:1px;background:#dedee0}.elma-route-point{position:relative;width:24px;height:24px;flex:0 0 24px;display:grid;place-items:center;z-index:2;background:#09090a}.elma-route-origin{border-radius:50%}.elma-route-origin:before{content:"";width:7px;height:7px;border-radius:50%;background:#fff}.elma-route-origin:after{content:"";position:absolute;left:10px;top:22px;width:3px;height:51px;background:#09090a;z-index:-1}.elma-route-destination{border-radius:5px}.elma-route-destination:before{content:"";width:7px;height:7px;border-radius:1px;background:#fff}.elma-route-row input{min-width:0;width:100%;height:100%;border:0;outline:0;background:transparent;color:#09090a;font-size:19px;font-weight:500;letter-spacing:-.3px;padding:0}.elma-route-row input::placeholder{color:#858589;opacity:1}.elma-route-row input[readonly]{color:#242426}.elma-add{width:52px;height:52px;flex:0 0 52px;border:0;border-radius:50%;background:#f0f0f1;color:#09090a;font:350 36px/1 "Inter",sans-serif;padding:0 0 5px}.elma-flow-results{margin-top:16px}.elma-flow-result{width:100%;min-height:70px;border:0;border-bottom:1px solid #ececee;background:#fff;color:#09090a;display:grid;grid-template-columns:48px minmax(0,1fr) 18px;align-items:center;gap:12px;padding:7px 2px;text-align:left}.elma-flow-result:last-child{border-bottom:0}.elma-flow-result:active{background:#fafafa}.elma-flow-icon{position:relative;width:44px;height:44px;border-radius:50%;background:#f3f3f4;display:grid;place-items:center}.elma-flow-icon svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.elma-flow-copy{min-width:0}.elma-flow-copy b,.elma-flow-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.elma-flow-copy b{font-size:17px;line-height:22px;font-weight:760;letter-spacing:-.25px}.elma-flow-copy small{font-size:14px;line-height:19px;color:#717174;margin-top:1px}.elma-flow-arrow{font-size:25px;color:#aaa}.elma-main-nav{position:fixed;z-index:850;left:18px;right:18px;bottom:calc(10px + env(safe-area-inset-bottom));height:78px;max-width:470px;margin:0 auto;padding:6px;border:1px solid #dedee0;border-radius:42px;background:#fff;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;box-shadow:0 4px 14px rgba(0,0,0,.10);font-family:"Inter","Helvetica Neue",Arial,sans-serif}.elma-main-tab{min-width:0;border:0;border-radius:32px;background:transparent;color:#69696d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:3px 1px;font-size:11px;font-weight:600;line-height:1.05}.elma-main-tab svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.elma-main-tab.active{background:#f2f2f3;color:#09090a;font-weight:800}.elma-event-screen{position:fixed;z-index:840;inset:0;display:none;padding:calc(88px + env(safe-area-inset-top)) 24px calc(110px + env(safe-area-inset-bottom));text-align:center}.elma-event-screen.show{display:block}.elma-event-screen h2{font-size:29px;margin:0 0 10px}.elma-event-screen p{color:#777}.elma-map-pick-note{position:absolute;z-index:820;left:50%;top:calc(18px + env(safe-area-inset-top));transform:translateX(-50%);display:none;padding:11px 16px;border-radius:22px;background:#fff;color:#09090a;box-shadow:0 5px 18px rgba(0,0,0,.18);font:750 13px/1 "Inter",sans-serif;white-space:nowrap}.elma-map-pick-note.show{display:block}@media(max-width:360px){.elma-home-screen{padding-left:14px;padding-right:14px}.elma-quick-label{font-size:18px}.elma-later{padding:0 13px;font-size:14px}.elma-search-title{font-size:24px}.elma-search-body{margin-top:90px}.elma-route-row input{font-size:17px}}
/* Sade, simetrik yolculuk akışı */
.mapwrap #map{opacity:0;transform:scale(1.012);transition:opacity .34s ease,transform .44s cubic-bezier(.22,.8,.25,1)}
.mapwrap.elma-map-open #map{opacity:1;transform:scale(1)}
body.elma-white-flow #elmaHomeWidgets,body.elma-white-flow .hero,body.elma-white-flow .top{display:none!important}
.elma-home-screen{padding:calc(14px + env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) calc(104px + env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));opacity:1;visibility:visible;transform:none;transition:opacity .24s ease,transform .3s cubic-bezier(.22,.8,.25,1),visibility 0s}
.elma-home-screen.hide{opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-7px);transition:opacity .2s ease,transform .27s ease,visibility 0s .27s}
.elma-home-inner{max-width:390px}.elma-quick-search{height:54px;border-radius:28px;gap:11px;padding:0 18px;box-shadow:0 3px 11px rgba(0,0,0,.08);transition:transform .18s ease,box-shadow .18s ease}
.elma-search-svg{width:23px;height:23px;flex-basis:23px}.elma-quick-label{font-size:18px;font-weight:590}
.elma-search-screen{display:block;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(9px);transition:opacity .23s ease,transform .32s cubic-bezier(.22,.8,.25,1),visibility 0s .32s;padding-top:calc(10px + env(safe-area-inset-top))}
.elma-search-screen.show{display:block;opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity .24s ease,transform .32s cubic-bezier(.22,.8,.25,1),visibility 0s}
.elma-search-head{height:42px;grid-template-columns:42px 1fr 42px}.elma-back{width:40px;height:40px}.elma-back svg{width:25px;height:25px}
.elma-search-title{font-size:20px;line-height:25px;letter-spacing:-.45px}.elma-search-body{margin-top:22px}
.elma-route-wrap{gap:10px}.elma-route-wrap:before{content:"";width:48px;flex:0 0 48px}.elma-route-fields{border-width:2px;border-radius:18px}
.elma-route-row{height:52px;gap:12px;padding:0 13px}.elma-route-row input{font-size:17px}.elma-route-row+.elma-route-row:before{left:50px}.elma-route-origin:after{height:45px}
.elma-add{width:48px;height:48px;flex-basis:48px;font-size:32px}.elma-flow-results{margin-top:12px;animation:elmaResultsIn .24s ease both}.elma-flow-result{min-height:64px}
@keyframes elmaResultsIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(max-width:390px){.elma-home-screen{padding-left:14px;padding-right:14px}.elma-home-inner{max-width:350px}.elma-route-wrap:before{width:42px;flex-basis:42px}.elma-add{width:42px;height:42px;flex-basis:42px}.elma-search-title{font-size:19px}.elma-search-body{margin-top:18px}}
/* Premium, tam simetrik ana ekran ve planlama formu */
.elma-home-screen{padding-top:calc(10px + env(safe-area-inset-top))}
.elma-home-inner{max-width:390px;display:flex;flex-direction:column;align-items:center}
.elma-home-brand{width:100%;display:flex;flex-direction:column;align-items:center}
.elma-home-brand img{width:46px;height:46px;display:block;object-fit:contain;border-radius:14px;filter:drop-shadow(0 5px 12px rgba(0,0,0,.09))}
.elma-home-location{max-width:100%;height:25px;margin-top:7px;display:flex;align-items:center;justify-content:center;gap:5px;color:#69696d;font-size:13px;font-weight:650;letter-spacing:-.15px}
.elma-home-location svg{width:15px;height:15px;flex:0 0 15px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.elma-home-location span{max-width:310px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.elma-quick-search{margin-top:14px;width:min(100%,370px);height:52px;border-color:#dedee1;border-radius:26px;padding:0 17px;background:rgba(255,255,255,.96);box-shadow:0 7px 22px rgba(20,20,24,.075),0 1px 2px rgba(0,0,0,.04)}
.elma-search-inner{max-width:560px}.elma-search-body{margin-top:18px}.elma-route-wrap{display:block;width:100%}.elma-route-wrap:before{display:none!important}
.elma-route-fields{width:100%;border:1.8px solid #111114;border-radius:20px;box-shadow:0 8px 26px rgba(20,20,24,.07),0 1px 2px rgba(0,0,0,.04)}
.elma-route-row{height:54px;padding-left:15px;padding-right:15px}.elma-route-row input{font-size:17px}.elma-flow-results{width:100%;margin-left:auto;margin-right:auto}
@media(max-width:390px){.elma-home-brand img{width:42px;height:42px}.elma-quick-search{width:calc(100% - 8px);margin-top:12px}.elma-search-body{margin-top:15px}}

/* Düzeltilmiş Elma Go yazı logosu ve başlık konumu */
.elma-home-brand img,.elma-home-location{display:none!important}
.elma-wordmark{display:flex;align-items:baseline;justify-content:center;gap:4px;color:#09090a;font-size:28px;line-height:36px;font-weight:850;letter-spacing:-1.25px}
.elma-wordmark b{font:inherit;font-weight:850;color:#22bfc3}
.elma-quick-search{margin-top:16px}
.elma-location-title{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;line-height:22px;font-weight:720;letter-spacing:-.25px;color:#55575b}
@media(max-width:390px){.elma-wordmark{font-size:26px}.elma-location-title{font-size:14px}}

/* Gerçek ElmaGo ana yazı logosu */
.elma-wordmark{display:none!important}
.elma-home-wordmark{display:block;width:126px;height:42px;object-fit:contain;border-radius:0;filter:none}
.elma-search-title{font-size:20px;line-height:25px;font-weight:850;letter-spacing:-.55px;color:#09090a}
@media(max-width:390px){.elma-home-wordmark{width:116px;height:39px}.elma-search-title{font-size:19px}}

/* Ana logo görünürlüğü ve alt gezinme güvenliği */
.elma-home-wordmark{display:block!important;width:126px!important;height:42px!important;object-fit:contain!important;opacity:1!important;visibility:visible!important}

.elma-home-brand .elma-home-wordmark{display:block!important;width:126px!important;height:42px!important;opacity:1!important;visibility:visible!important}

/* Planlama başlığı Go işareti */
.elma-go-icon{width:38px;height:38px;display:grid;place-items:center;justify-self:end}
.elma-go-icon svg{width:34px;height:34px;display:block}.elma-go-icon rect{fill:#09090a}
.elma-go-trail{fill:none;stroke:#27c4c7;stroke-width:2;stroke-linecap:round}
.elma-go-arrow{fill:#fff}
@media(max-width:390px){.elma-go-icon{width:36px;height:36px}.elma-go-icon svg{width:32px;height:32px}}

/* Yeni ElmaGo logosundaki gerçek Go parçası */
.elma-go-icon{display:none!important}
.elma-go-logo-crop{position:relative;justify-self:end;display:block;width:40px;height:34px;overflow:hidden;background:#fff}
.elma-go-logo-crop img{position:absolute;display:block!important;max-width:none!important;width:86px!important;height:29px!important;object-fit:fill!important;left:-42px;top:2px;border-radius:0!important;filter:none!important}
@media(max-width:390px){.elma-go-logo-crop{width:37px;height:32px}.elma-go-logo-crop img{width:80px!important;height:27px!important;left:-39px;top:2px}}

/* Kompakt Nereden / Nereye alanı */
.elma-search-body{margin-top:14px}
.elma-route-fields{border-width:1.6px;border-radius:16px;box-shadow:0 5px 18px rgba(20,20,24,.055),0 1px 2px rgba(0,0,0,.035)}
.elma-route-row{height:45px;gap:10px;padding-left:12px;padding-right:12px}
.elma-route-row input{font-size:15px;line-height:20px;font-weight:500;letter-spacing:-.2px}
.elma-route-point{width:20px;height:20px;flex-basis:20px}
.elma-route-origin:before,.elma-route-destination:before{width:6px;height:6px}
.elma-route-origin:after{left:8.5px;top:18px;width:2.5px;height:39px}
.elma-route-row+.elma-route-row:before{left:42px}
@media(max-width:390px){.elma-search-body{margin-top:12px}.elma-route-row{height:43px}.elma-route-row input{font-size:14.5px}.elma-route-origin:after{height:37px}}

/* Tam Go + ok kırpımı */
.elma-go-logo-crop{width:47px!important;height:31px!important;background:#fff!important}
.elma-go-logo-crop img{width:86px!important;height:29px!important;left:-39px!important;top:1px!important}
@media(max-width:390px){.elma-go-logo-crop{width:44px!important;height:29px!important}.elma-go-logo-crop img{width:80px!important;height:27px!important;left:-36px!important;top:1px!important}}

/* Kompakt ve orantılı adres sonuçları */
.elma-flow-results{margin-top:8px}
.elma-flow-result{min-height:54px;grid-template-columns:38px minmax(0,1fr) 14px;gap:9px;padding:5px 2px}
.elma-flow-icon{width:36px;height:36px}
.elma-flow-icon svg{width:19px;height:19px;stroke-width:1.7}
.elma-flow-copy b{font-size:15px;line-height:19px;font-weight:730;letter-spacing:-.2px}
.elma-flow-copy small{font-size:12.5px;line-height:16px;margin-top:0}
.elma-flow-arrow{font-size:20px}
@media(max-width:390px){.elma-flow-result{min-height:51px;grid-template-columns:35px minmax(0,1fr) 13px;gap:8px}.elma-flow-icon{width:33px;height:33px}.elma-flow-icon svg{width:18px;height:18px}.elma-flow-copy b{font-size:14.5px}.elma-flow-copy small{font-size:12px}}

/* Alt menü planlama ekranında da erişilebilir */
.elma-main-nav{z-index:880}
.elma-search-screen{padding-bottom:calc(108px + env(safe-area-inset-bottom))}
.elma-flow-results{padding-bottom:8px}

/* Başlık logosunu kesin kaldır, sonuçları gerçekten kompaktlaştır */
.elma-go-icon,.elma-go-logo-crop{display:none!important;width:0!important;height:0!important;overflow:hidden!important}
.elma-flow-results{margin-top:6px!important}
.elma-flow-result{min-height:45px!important;grid-template-columns:30px minmax(0,1fr) 11px!important;gap:7px!important;padding:3px 1px!important}
.elma-flow-icon{width:28px!important;height:28px!important}
.elma-flow-icon svg{width:15px!important;height:15px!important;stroke-width:1.65!important}
.elma-flow-copy b{font-size:13.5px!important;line-height:17px!important;font-weight:720!important;letter-spacing:-.15px!important}
.elma-flow-copy small{font-size:11.5px!important;line-height:14px!important;margin-top:0!important}
.elma-flow-arrow{font-size:17px!important}
@media(max-width:390px){.elma-flow-result{min-height:43px!important;grid-template-columns:28px minmax(0,1fr) 10px!important;gap:6px!important}.elma-flow-icon{width:26px!important;height:26px!important}.elma-flow-copy b{font-size:13px!important}.elma-flow-copy small{font-size:11px!important}}

`;
    document.head.appendChild(style);

    const wrapper=$('.mapwrap');
    const home=document.createElement('section');
    home.id='elmaHomeScreen';
    home.className='elma-home-screen';
    home.innerHTML=`<div class="elma-home-inner"><div class="elma-home-brand"><img class="elma-home-wordmark" src="assets/elmago-logo.png?v=20260831-black" alt="ElmaGo"></div><button class="elma-quick-search" id="elmaQuickSearch" type="button" aria-label="Nereye gitmek istiyorsunuz?"><svg class="elma-search-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><span class="elma-quick-label">Nereye?</span></button></div>`;
    wrapper.appendChild(home);

    const searchScreen=document.createElement('section');
    searchScreen.id='elmaSearchScreen';
    searchScreen.className='elma-search-screen';
    searchScreen.innerHTML=`<div class="elma-search-inner"><header class="elma-search-head"><button class="elma-back" id="elmaSearchBack" type="button" aria-label="Geri"><svg viewBox="0 0 32 32"><path d="M27 16H5M13 8l-8 8 8 8"/></svg></button><h1 class="elma-search-title">Yolculuğunuzu planlayın</h1><span aria-hidden="true"></span></header><div class="elma-search-body"><div class="elma-route-wrap"><div class="elma-route-fields"><label class="elma-route-row"><span class="elma-route-point elma-route-origin" aria-hidden="true"></span><input id="elmaFrom" value="Konumunuz alınıyor…" aria-label="Başlangıç konumu" placeholder="Nereden?" autocomplete="off"></label><label class="elma-route-row"><span class="elma-route-point elma-route-destination" aria-hidden="true"></span><input id="elmaTo" aria-label="Nereye" placeholder="Nereye?" autocomplete="off"></label></div></div><div class="elma-flow-results" id="elmaFlowResults"></div></div></div>`;
    wrapper.appendChild(searchScreen);
    document.querySelectorAll('.elma-go-icon,.elma-go-logo-crop').forEach(element=>element.remove());

    const pickNote=document.createElement('div');
    pickNote.id='elmaMapPickNote';
    pickNote.className='elma-map-pick-note';
    pickNote.textContent='Varış noktasını haritadan seçin';
    wrapper.appendChild(pickNote);

    const eventScreen=document.createElement('section');
    eventScreen.id='elmaEventScreen';
    eventScreen.className='elma-event-screen';
    eventScreen.innerHTML='<h2>Etkinlik</h2><p>Yakındaki etkinlikler yakında burada.</p>';
    document.body.appendChild(eventScreen);

    const nav=document.createElement('nav');
    nav.id='elmaMainNav';
    nav.className='elma-main-nav';
    nav.setAttribute('aria-label','Ana menü');
    nav.innerHTML=`<button class="elma-main-tab active" data-elma-tab="home" type="button"><svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z"/></svg><span>Ana Sayfa</span></button><button class="elma-main-tab" data-elma-tab="services" type="button"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="4" height="4" rx=".5"/><rect x="10" y="4" width="4" height="4" rx=".5"/><rect x="16" y="4" width="4" height="4" rx=".5"/><rect x="4" y="10" width="4" height="4" rx=".5"/><rect x="10" y="10" width="4" height="4" rx=".5"/><rect x="16" y="10" width="4" height="4" rx=".5"/><rect x="4" y="16" width="4" height="4" rx=".5"/><rect x="10" y="16" width="4" height="4" rx=".5"/><rect x="16" y="16" width="4" height="4" rx=".5"/></svg><span>Hizmetler</span></button><button class="elma-main-tab" data-elma-tab="event" type="button"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-3-6 3z"/><path d="M9 8h6M9 12h6"/></svg><span>Etkinlik</span></button><button class="elma-main-tab" data-elma-tab="account" type="button"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg><span>Hesap</span></button>`;
    document.body.appendChild(nav);

    const resultIcons={
      clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
      globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
      pin:'<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="2"/><path d="M12 17v4"/></svg>',
      star:'<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.7 6.3.8-4.6 4.4 1.2 6.1-5.6-3-5.6 3 1.2-6.1L3 9.5l6.3-.8z"/></svg>',
      search:'<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>'
    };

    function setNavActive(name){
      nav.querySelectorAll('.elma-main-tab').forEach(button=>button.classList.toggle('active',button.dataset.elmaTab===name));
    }
    function hideWhiteScreens(){
      home.classList.add('hide');
      searchScreen.classList.remove('show');
      eventScreen.classList.remove('show');
      pickNote.classList.remove('show');
    }
    function showHome(){
      document.querySelector('.eg-tab[data-tab="home"]')?.click();
      document.body.classList.add('elma-white-flow');
      wrapper.style.display='block';
      wrapper.classList.remove('elma-map-open');
      eventScreen.classList.remove('show');
      searchScreen.classList.remove('show');
      pickNote.classList.remove('show');
      home.classList.remove('hide');
      nav.style.display='grid';
      setNavActive('home');

    }
    function showMap(){
      wrapper.style.display='block';
      document.body.classList.remove('elma-white-flow');
      hideWhiteScreens();
      nav.style.display='grid';
      setNavActive('home');
      wrapper.classList.remove('elma-map-open');
      document.getElementById('elmaFlowBootGuard')?.remove();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        wrapper.classList.add('elma-map-open');
        google.maps.event.trigger(map,'resize');
      }));
    }
    async function ensureOrigin(){
      if(origin){
        if(!manualOriginEditing)$('#elmaFrom').value=origin.name||'Mevcut konumum';
        return origin;
      }
      if(window.requestLocation)await window.requestLocation();
      if(!manualOriginEditing)$('#elmaFrom').value=origin?.name||'Amasya Merkez';
      return origin;
    }
    function resultButton(title,subtitle,kind,onClick,arrow=false){
      const button=document.createElement('button');
      button.className='elma-flow-result';
      button.type='button';
      button.innerHTML='<span class="elma-flow-icon">'+(resultIcons[kind]||resultIcons.search)+'</span><span class="elma-flow-copy"><b></b><small></small></span><span class="elma-flow-arrow">'+(arrow?'›':'')+'</span>';
      button.querySelector('b').textContent=title;
      const small=button.querySelector('small');
      small.textContent=subtitle||'';
      if(!subtitle)small.style.display='none';
      if(onClick)button.onclick=onClick;
      return button;
    }
    async function chooseOriginPoint(point){
      manualOriginEditing=true;
      clearRoute();
      origin=point;
      marker('origin',origin);
      $('#elmaFrom').value=point.name;
      $('#elmaFlowResults').innerHTML='';
      step=1;
      $('#elmaTo').focus();
    }
    async function choosePoint(point){
      await ensureOrigin();
      if(!origin)return;
      clearRoute();
      destination=point;
      marker('origin',origin);
      marker('destination',destination);
      $('#elmaTo').value=point.name;
      step=2;
      showMap();
      await window.showRoute();
    }
    async function chooseQuery(query){
      $('#elmaTo').value=query;
      const items=await search(query);
      if(!items.length)return;
      const point=await resolveSearchItem(items[0]);
      await choosePoint(point);
    }
    function renderDefaults(){
      $('#elmaFlowResults').innerHTML='';
    }
    function renderSearchResults(items,target='destination'){
      const results=$('#elmaFlowResults');
      results.innerHTML='';
      items.forEach(item=>{
        const parts=item.label.split(',');
        const title=parts.shift()||item.label;
        const subtitle=parts.join(',').trim();
        results.appendChild(resultButton(title,subtitle,'search',async()=>{
          try{
            const point=await resolveSearchItem(item);
            if(target==='origin')await chooseOriginPoint(point);else await choosePoint(point);
          }catch(error){console.error(error)}
        },true));
      });
    }
    function openSearch(){
      document.body.classList.add('elma-white-flow');
      wrapper.classList.remove('elma-map-open');
      home.classList.add('hide');
      eventScreen.classList.remove('show');
      searchScreen.classList.add('show');
      nav.style.display='grid';
      setNavActive('home');
      renderDefaults();
      $('#elmaTo').value='';
      $('#elmaTo').focus();
      ensureOrigin();
    }

    $('#elmaQuickSearch').onclick=openSearch;
    $('#elmaQuickSearch').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openSearch()}};
    $('#elmaSearchBack').onclick=showHome;
    $('#elmaFrom').oninput=()=>{
      manualOriginEditing=true;
      clearTimeout(timers.elmaFrom);
      const query=$('#elmaFrom').value.trim();
      if(query.length<2){renderDefaults();return}
      timers.elmaFrom=setTimeout(async()=>renderSearchResults(await search(query),'origin'),250);
    };
    $('#elmaFrom').onfocus=()=>{manualOriginEditing=true};
    $('#elmaTo').oninput=()=>{
      clearTimeout(timers.elmaTo);
      const query=$('#elmaTo').value.trim();
      if(query.length<2){renderDefaults();return}
      timers.elmaTo=setTimeout(async()=>renderSearchResults(await search(query)),250);
    };

    function openLegacyTab(name,attempt=0){
      const target=document.querySelector('.eg-tab[data-tab="'+name+'"]');
      if(target){target.click();return}
      if(attempt<12)setTimeout(()=>openLegacyTab(name,attempt+1),120);
    }
    nav.querySelectorAll('.elma-main-tab').forEach(button=>button.onclick=()=>{
      const name=button.dataset.elmaTab;
      if(name==='home'){showHome();return}
      document.body.classList.remove('elma-white-flow');
      hideWhiteScreens();
      setNavActive(name);
      wrapper.style.display='block';
      if(name==='event'){eventScreen.classList.add('show');return}
      openLegacyTab(name);
    });

    window.elmaShowHome=showHome;
    window.elmaOpenSearch=openSearch;
    window.elmaShowMapView=showMap;
    renderDefaults();
    showHome();
  }

  async function pickPoint(lat,lon){
    clearRoute();
    const point={lat,lon,name:await reverse(lon,lat)};
    if(step===0){
      origin=point;
      marker('origin',point);
      if($('#elmaFrom'))$('#elmaFrom').value=point.name;
      step=1;
    }else{
      destination=point;
      marker('destination',point);
      if($('#elmaTo'))$('#elmaTo').value=point.name;
      $('#elmaMapPickNote')?.classList.remove('show');
      step=2;
      window.elmaShowMapView?.();
      if(origin)await window.showRoute?.();
    }
  }

  async function init(){
    const old=$('#map');
    if(!old)return;
    const fresh=document.createElement('div');
    fresh.id='map';
    old.replaceWith(fresh);
    setup();
    await loadGoogleMaps();
    geocoder=new google.maps.Geocoder();
    try{placesLibrary=await google.maps.importLibrary('places')}catch(error){console.warn('Google Places kullanılamıyor, Geocoding ile devam ediliyor.',error)}

    map=new google.maps.Map(fresh,{
      center:DEFAULT_CENTER,
      zoom:14,
      mapTypeControl:false,
      streetViewControl:false,
      fullscreenControl:false,
      zoomControl:false,
      clickableIcons:false,
      gestureHandling:'greedy',
      backgroundColor:'#f7f7f8'
    });
    map.addListener('click',event=>pickPoint(event.latLng.lat(),event.latLng.lng()));

    window.requestLocation=()=>new Promise(resolve=>{
      const applyOrigin=async(lon,lat,fallbackName)=>{
        clearRoute();
        origin={lon,lat};
        origin.name=await reverse(lon,lat)||fallbackName;
        marker('origin',origin);
        if(!manualOriginEditing&&$('#elmaFrom'))$('#elmaFrom').value=origin.name;
        resolve(origin);
      };
      const fallback=()=>applyOrigin(DEFAULT_CENTER.lng,DEFAULT_CENTER.lat,'Amasya Merkez');
      if(!navigator.geolocation){fallback();return}
      navigator.geolocation.getCurrentPosition(position=>{
        window.elmaUserPosition=position;
        applyOrigin(position.coords.longitude,position.coords.latitude,'Mevcut konumum');
      },fallback,{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
    });

    window.showRoute=async()=>{
      if(!origin||!destination)return alert('Başlangıç ve varış seç.');
      try{
        clearRoute();
        const service=new google.maps.DirectionsService();
        const result=await service.route({
          origin:{lat:origin.lat,lng:origin.lon},
          destination:{lat:destination.lat,lng:destination.lon},
          travelMode:google.maps.TravelMode.DRIVING,
          region:'TR',
          language:'tr'
        });
        directionsRenderer=new google.maps.DirectionsRenderer({
          map,
          directions:result,
          suppressMarkers:true,
          preserveViewport:false,
          polylineOptions:{strokeOpacity:0,strokeWeight:0}
        });
        const animatedPath=result.routes?.[0]?.overview_path||[];
        await animateRoute(animatedPath);
        step=1;
      }catch(error){
        console.warn('Google rota servisi kullanılamıyor, yedek rota açılıyor:',error);
        try{
          const url='https://router.project-osrm.org/route/v1/driving/'+origin.lon+','+origin.lat+';'+destination.lon+','+destination.lat+'?overview=full&geometries=geojson';
          const response=await fetch(url);
          const data=await response.json();
          if(!data.routes?.[0])throw new Error('Yedek rota bulunamadı');
          directionsRenderer?.setMap(null);
          directionsRenderer=null;
          const path=data.routes[0].geometry.coordinates.map(coordinate=>({lat:coordinate[1],lng:coordinate[0]}));
          const bounds=new google.maps.LatLngBounds();
          path.forEach(point=>bounds.extend(point));
          map.fitBounds(bounds,48);
          await animateRoute(path);
          step=1;
        }catch(fallbackError){
          console.error('Yedek rota hatası:',fallbackError);
          alert('Rota şu anda gösterilemiyor. Biraz sonra tekrar dene.');
        }
      }
    };
  }

  init().catch(error=>{
    console.error(error);
    const mapElement=$('#map');
    if(mapElement)mapElement.innerHTML='<div style="display:grid;place-items:center;height:100%;padding:24px;text-align:center;color:#171717;background:#f7f7f8">Google Maps yüklenemedi.<br>API anahtarı ve etkin API ayarlarını kontrol et.</div>';
  });
})();

(()=>{
  const line=document.createElement('script');
  line.src='line-1-ui.js?v=20260830-past-contrast';
  line.defer=true;
  line.dataset.elmaLine1Ui='1';
  document.head.appendChild(line);
  const line1Route=document.createElement('script');
  line1Route.src='line-1-route.js?v=20260830-collapsed-route-cards';
  line1Route.defer=true;
  line1Route.dataset.elmaLine1Route='1';
  document.head.appendChild(line1Route);
  const line2=document.createElement('script');
  line2.src='line-2-ui.js?v=20260830-past-contrast';
  line2.defer=true;
  line2.dataset.elmaLine2Ui='1';
  document.head.appendChild(line2);
  const line6=document.createElement('script');
  line6.src='line-6-ui.js?v=20260830-line6';
  line6.defer=true;
  line6.dataset.elmaLine6Ui='1';
  document.head.appendChild(line6);
  const line6Route=document.createElement('script');
  line6Route.src='line-6-route.js?v=20260901-google-23-stops';
  line6Route.defer=true;
  line6Route.dataset.elmaLine6Route='1';
  document.head.appendChild(line6Route);
  const pharmacy=document.createElement('script');
  pharmacy.src='pharmacy-service.js?v=20260830-pharmacy-permission';
  pharmacy.defer=true;
  pharmacy.dataset.elmaPharmacyService='1';
  document.head.appendChild(pharmacy);
  const lostFound=document.createElement('script');
  lostFound.src='lost-found-service.js?v=20260830-lost-found';
  lostFound.defer=true;
  lostFound.dataset.elmaLostFoundService='1';
  document.head.appendChild(lostFound);
  const lostFoundPremium=document.createElement('script');
  lostFoundPremium.src='lost-found-premium.js?v=20260830-lost-found-modern';
  lostFoundPremium.defer=true;
  lostFoundPremium.dataset.elmaLostFoundPremium='1';
  document.head.appendChild(lostFoundPremium);
  const helpCenter=document.createElement('script');
  helpCenter.src='help-center.js?v=20260830-help-back-eye-align';
  helpCenter.defer=true;
  helpCenter.dataset.elmaHelpCenter='1';
  document.head.appendChild(helpCenter);
  const accountProfile=document.createElement('script');
  accountProfile.src='account-profile.js?v=20260830-email-auth';
  accountProfile.type='module';
  accountProfile.fetchPriority='high';
  accountProfile.dataset.elmaAccountProfile='1';
  document.head.appendChild(accountProfile);
  const emailAuth=document.createElement('script');
  emailAuth.src='email-auth.js?v=20260830-email-auth';
  emailAuth.type='module';
  emailAuth.dataset.elmaEmailAuth='1';
  document.head.appendChild(emailAuth);
})();
