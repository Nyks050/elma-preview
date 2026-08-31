(()=>{
  const DEFAULT_CENTER={lat:40.65,lng:35.83};
  let map,origin,destination,originMarker,destinationMarker,directionsRenderer,fallbackRouteLine,step=0,timers={};
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
    directionsRenderer?.setMap(null);
    directionsRenderer=null;
    fallbackRouteLine?.setMap(null);
    fallbackRouteLine=null;
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
    style.textContent=`html,body,.app{margin:0!important;width:100%!important;min-height:100%!important;max-width:none!important}.app{padding:0!important}.mapwrap{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;min-height:100vh!important;margin:0!important;border:0!important;border-radius:0!important;background:#f7f7f8!important;overflow:hidden!important}.mapwrap #map{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background:#f7f7f8!important}.gm-style{font-family:"Inter","Helvetica Neue",Arial,sans-serif}.gm-style-mtc,.gm-fullscreen-control,.gm-svpc,.gmnoprint.gm-bundled-control{display:none!important}.elma-sheet{position:absolute;z-index:811;left:8px;right:8px;bottom:calc(116px + env(safe-area-inset-bottom));border:1px solid #d4d4d8;border-radius:25px;background:#fffffff7;padding:9px 12px 13px;box-shadow:0 12px 34px #7774}.elma-sheet.dismissed{transform:translateY(calc(100% + 150px));opacity:0;pointer-events:none}.elma-grab{width:72px;height:22px;margin:-5px auto 3px;position:relative;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}.elma-grab:after{content:"";position:absolute;left:17px;right:17px;top:9px;height:4px;border-radius:9px;background:#8a8d92;transition:background .15s ease,transform .15s ease}.elma-grab:active:after{background:#09090a;transform:scaleX(.9)}.elma-grab:focus-visible{outline:2px solid #09090a;outline-offset:1px;border-radius:11px}.elma-restore{position:absolute;z-index:812;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);display:none;align-items:center;justify-content:center;gap:9px;width:auto;min-width:158px;height:42px;padding:0 15px;border:1px solid #d4d4d8;border-radius:999px;background:#fffffff5;color:#09090a;box-shadow:0 10px 30px #7774;font:800 12px/1 "Inter","Helvetica Neue",Arial,sans-serif;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);touch-action:manipulation;-webkit-tap-highlight-color:transparent}.elma-restore.show{display:flex}.elma-restore:active{transform:translateX(-50%) scale(.97)}.elma-restore:focus-visible{outline:2px solid #09090a;outline-offset:2px}.elma-restore-grip{width:27px;height:4px;border-radius:99px;background:#777b82;position:relative}.elma-restore-grip:after{content:"";position:absolute;left:10px;top:-5px;width:6px;height:6px;border-left:1.7px solid #61646a;border-top:1.7px solid #61646a;transform:rotate(45deg)}.elma-title{font-weight:800;font-size:18px;margin:0 2px 9px}.elma-fields{border:1px solid #d8d8dc;border-radius:17px;background:#fff}.elma-row{height:58px;display:flex;align-items:center;gap:10px;padding:0 12px;position:relative}.elma-row+.elma-row{border-top:1px solid #dedee1}.elma-fieldtext{min-width:0;flex:1;display:flex;flex-direction:column;justify-content:center;gap:2px}.elma-fieldtext small{display:block;color:#71717a;font-size:10px;font-weight:750;line-height:1}.elma-row input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#09090a;font-size:14px;line-height:18px;padding:0}.elma-my{border:0;background:#e4e4e7;color:#09090a;border-radius:10px;padding:8px}.elma-results{position:absolute;z-index:820;left:4px;right:4px;top:56px;display:none;max-height:158px;overflow:auto;background:#fff;border:1px solid #d8d8dc;border-radius:14px;box-shadow:0 12px 28px rgba(0,0,0,.16);overscroll-behavior:contain;-webkit-overflow-scrolling:touch}.elma-results.show{display:block}.elma-result{width:100%;height:48px;border:0;border-bottom:1px solid #ececef;background:#fff;color:#09090a;text-align:left;padding:7px 10px;overflow:hidden}.elma-result:last-child{border-bottom:0}.elma-result:active{background:#f4f4f5}.elma-result b,.elma-result small{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.elma-result b{font-size:12.5px;font-weight:780;line-height:16px}.elma-result small{color:#71717a;font-size:10px;line-height:14px;margin-top:1px}.elma-picked{height:28px;color:#62656a;font-size:11px;padding-top:7px}.elma-go{width:100%;height:46px;border:0;border-radius:15px;background:#09090a;color:#fff;font-weight:850}`;
    document.head.appendChild(style);
    const wrapper=$('.mapwrap'),ui=document.createElement('div');
    ui.innerHTML=`<button class="elma-restore" type="button" aria-label="Yolculuk panelini aç" aria-expanded="false"><span class="elma-restore-grip" aria-hidden="true"></span><span>Yolculuğu planla</span></button><section class="elma-sheet"><div class="elma-grab" role="button" tabindex="0" aria-label="Yolculuk panelini aşağı indir" aria-expanded="true"></div><div class="elma-title">Yolculuğunu planla</div><div class="elma-fields"><div class="elma-row elma-row-origin"><div class="elma-fieldtext"><small>Nereden</small><input id="elmaFrom" placeholder="Başlangıç konumu seç" autocomplete="off"></div><button class="elma-my" id="elmaMy">Konumum</button><div class="elma-results" id="elmaFromResults"></div></div><div class="elma-row elma-row-destination"><div class="elma-fieldtext"><small>Nereye</small><input id="elmaTo" placeholder="Varış noktası seç" autocomplete="off"></div><div class="elma-results" id="elmaToResults"></div></div></div><div class="elma-picked" id="elmaPicked">Haritada başlangıç konumuna dokun</div><button class="elma-go" id="elmaGo">Rotayı göster</button></section>`;
    wrapper.appendChild(ui);

    function bind(inputId,resultId,isOrigin){
      const input=$('#'+inputId),results=$('#'+resultId);
      input.onfocus=()=>mode(isOrigin?0:1);
      input.oninput=()=>{
        clearTimeout(timers[inputId]);
        const query=input.value.trim();
        if(query.length<2){results.classList.remove('show');return}
        timers[inputId]=setTimeout(async()=>{
          const items=await search(query);
          results.innerHTML='';
          items.forEach(item=>{
            const button=document.createElement('button');
            button.className='elma-result';
            button.type='button';
            button.innerHTML='<b></b><small></small>';
            const parts=item.label.split(',');
            button.querySelector('b').textContent=parts.shift()||item.label;
            button.querySelector('small').textContent=parts.join(',').trim()||item.label;
            button.onclick=async()=>{
              try{
                const point=await resolveSearchItem(item);
                clearRoute();
                if(isOrigin)origin=point;else destination=point;
                marker(isOrigin?'origin':'destination',point);
                input.value=point.name;
                results.classList.remove('show');
                flyTo(point,16);
                if(isOrigin)mode(1);else step=2;
              }catch(error){
                console.error(error);
                alert('Bu konum açılamadı. Başka bir sonuç seç.');
              }
            };
            results.appendChild(button);
          });
          results.classList.toggle('show',items.length>0);
        },250);
      };
    }

    bind('elmaFrom','elmaFromResults',true);
    bind('elmaTo','elmaToResults',false);
    $('#elmaMy').onclick=()=>window.requestLocation();
    $('#elmaGo').onclick=()=>window.showRoute();
    dragSheet();
  }

  async function pickPoint(lat,lon){
    clearRoute();
    const point={lat,lon,name:await reverse(lon,lat)};
    if(step===0){
      origin=point;
      marker('origin',point);
      $('#elmaFrom').value=point.name;
      mode(1);
    }else{
      destination=point;
      marker('destination',point);
      $('#elmaTo').value=point.name;
      step=2;
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

    window.requestLocation=()=>navigator.geolocation?.getCurrentPosition(async position=>{
      window.elmaUserPosition=position;
      clearRoute();
      origin={lon:position.coords.longitude,lat:position.coords.latitude};
      origin.name=await reverse(origin.lon,origin.lat);
      marker('origin',origin);
      $('#elmaFrom').value=origin.name;
      flyTo(origin,17);
      mode(1);
    },()=>alert('Konum izni verilmedi. Başlangıç noktasını haritadan seçebilirsin.'),{enableHighAccuracy:true,timeout:10000});

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
          polylineOptions:{strokeColor:'#050506',strokeWeight:6,strokeOpacity:.92}
        });
        mode(0);
      }catch(error){
        console.warn('Google rota servisi kullanılamıyor, yedek rota açılıyor:',error);
        try{
          const url='https://router.project-osrm.org/route/v1/driving/'+origin.lon+','+origin.lat+';'+destination.lon+','+destination.lat+'?overview=full&geometries=geojson';
          const response=await fetch(url);
          const data=await response.json();
          if(!data.routes?.[0])throw new Error('Yedek rota bulunamadı');
          directionsRenderer?.setMap(null);
          fallbackRouteLine?.setMap(null);
          const path=data.routes[0].geometry.coordinates.map(coordinate=>({lat:coordinate[1],lng:coordinate[0]}));
          fallbackRouteLine=new google.maps.Polyline({
            map,
            path,
            strokeColor:'#050506',
            strokeWeight:6,
            strokeOpacity:.92
          });
          const bounds=new google.maps.LatLngBounds();
          path.forEach(point=>bounds.extend(point));
          map.fitBounds(bounds,48);
          mode(0);
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
  const widgets=document.createElement('script');
  widgets.src='home-widgets.js?v=20260830-remove-stops-service';
  widgets.defer=true;
  document.head.appendChild(widgets);
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
  line6Route.src='line-6-route.js?v=20260830-collapsed-route-cards';
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
  accountProfile.dataset.elmaAccountProfile='1';
  document.head.appendChild(accountProfile);
  const emailAuth=document.createElement('script');
  emailAuth.src='email-auth.js?v=20260830-email-auth';
  emailAuth.type='module';
  emailAuth.dataset.elmaEmailAuth='1';
  document.head.appendChild(emailAuth);
})();
