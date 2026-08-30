(()=>{
  const DEFAULT_CENTER=[40.65,35.83];
  let map,origin,destination,originMarker,destinationMarker,routeLine,step=0,timers={};
  const $=selector=>document.querySelector(selector);

  async function search(query){
    if(!query||query.trim().length<2)return[];
    try{
      const response=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=tr&addressdetails=1&limit=6&q='+encodeURIComponent(query),{headers:{'Accept-Language':'tr'}});
      return await response.json();
    }catch(e){return[]}
  }

  async function reverse(lon,lat){
    try{
      const response=await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon)+'&zoom=18&addressdetails=1',{headers:{'Accept-Language':'tr'}});
      const result=await response.json();
      return result.display_name||lat.toFixed(5)+', '+lon.toFixed(5);
    }catch(e){return lat.toFixed(5)+', '+lon.toFixed(5)}
  }

  function marker(kind,point){
    const previous=kind==='origin'?originMarker:destinationMarker;
    previous?.remove();
    const isOrigin=kind==='origin';
    const next=L.circleMarker([point.lat,point.lon],{
      radius:9,
      color:isOrigin?'#ffffff':'#09090a',
      weight:4,
      fillColor:isOrigin?'#09090a':'#ffffff',
      fillOpacity:1,
      opacity:1
    }).addTo(map);
    if(isOrigin)originMarker=next;else destinationMarker=next;
  }

  function flyTo(point,zoom=16){
    map.setView([point.lat,point.lon],zoom,{animate:false});
  }

  function mode(next){
    step=next;
    document.querySelectorAll('.elma-row').forEach(row=>row.classList.remove('active'));
    $(next===0?'.elma-row-origin':'.elma-row-destination')?.classList.add('active');
    const picked=$('#elmaPicked');
    if(picked)picked.textContent=next===0?'Haritada başlangıç konumuna dokun':'Haritada gitmek istediğin yere dokun';
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
    style.textContent=`html,body,.app{margin:0!important;width:100%!important;min-height:100%!important;max-width:none!important}.app{padding:0!important}.mapwrap{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;min-height:100vh!important;margin:0!important;border:0!important;border-radius:0!important;background:#f7f7f8!important;overflow:hidden!important}.mapwrap #map{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;background:#f7f7f8!important}.leaflet-container{background:#f7f7f8!important;font-family:"Inter","Helvetica Neue",Arial,sans-serif}.leaflet-control-zoom{display:none}.leaflet-bottom{bottom:calc(82px + env(safe-area-inset-bottom))}.leaflet-control-attribution{border-radius:8px 0 0 0!important;background:#ffffffe8!important;color:#444!important;font-size:9px!important;padding:2px 5px!important}.leaflet-control-attribution a{color:#09090a!important}.elma-sheet{position:absolute;z-index:811;left:8px;right:8px;bottom:calc(92px + env(safe-area-inset-bottom));border:1px solid #d4d4d8;border-radius:25px;background:#fffffff7;padding:9px 12px 13px;box-shadow:0 18px 55px #7775}.elma-sheet.dismissed{transform:translateY(calc(100% + 150px));opacity:0;pointer-events:none}.elma-grab{width:72px;height:22px;margin:-5px auto 3px;position:relative;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}.elma-grab:after{content:"";position:absolute;left:17px;right:17px;top:9px;height:4px;border-radius:9px;background:#8a8d92;transition:background .15s ease,transform .15s ease}.elma-grab:active:after{background:#09090a;transform:scaleX(.9)}.elma-grab:focus-visible{outline:2px solid #09090a;outline-offset:1px;border-radius:11px}.elma-restore{position:absolute;z-index:812;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);display:none;align-items:center;justify-content:center;gap:9px;width:auto;min-width:158px;height:42px;padding:0 15px;border:1px solid #d4d4d8;border-radius:999px;background:#fffffff5;color:#09090a;box-shadow:0 10px 30px #7774;font:800 12px/1 "Inter","Helvetica Neue",Arial,sans-serif;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);touch-action:manipulation;-webkit-tap-highlight-color:transparent}.elma-restore.show{display:flex}.elma-restore:active{transform:translateX(-50%) scale(.97)}.elma-restore:focus-visible{outline:2px solid #09090a;outline-offset:2px}.elma-restore-grip{width:27px;height:4px;border-radius:99px;background:#777b82;position:relative}.elma-restore-grip:after{content:"";position:absolute;left:10px;top:-5px;width:6px;height:6px;border-left:1.7px solid #61646a;border-top:1.7px solid #61646a;transform:rotate(45deg)}.elma-title{font-weight:800;font-size:18px;margin:0 2px 9px}.elma-fields{border:1px solid #d8d8dc;border-radius:17px;background:#fff}.elma-row{height:50px;display:flex;align-items:center;gap:10px;padding:0 12px;position:relative}.elma-row+.elma-row{border-top:1px solid #dedee1}.elma-row input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#09090a;font-size:14px}.elma-my{border:0;background:#e4e4e7;color:#09090a;border-radius:10px;padding:8px}.elma-results{position:absolute;z-index:820;left:0;right:0;top:52px;display:none;max-height:185px;overflow:auto;background:#fff}.elma-results.show{display:block}.elma-result{width:100%;border:0;border-bottom:1px solid #dedee1;background:#fff;color:#09090a;text-align:left;padding:10px}.elma-result b,.elma-result small{display:block}.elma-picked{height:28px;color:#62656a;font-size:11px;padding-top:7px}.elma-go{width:100%;height:46px;border:0;border-radius:15px;background:#09090a;color:#fff;font-weight:850}`;
    document.head.appendChild(style);
    const wrapper=$('.mapwrap'),ui=document.createElement('div');
    ui.innerHTML=`<button class="elma-restore" type="button" aria-label="Yolculuk panelini aç" aria-expanded="false"><span class="elma-restore-grip" aria-hidden="true"></span><span>Yolculuğu planla</span></button><section class="elma-sheet"><div class="elma-grab" role="button" tabindex="0" aria-label="Yolculuk panelini aşağı indir" aria-expanded="true"></div><div class="elma-title">Yolculuğunu planla</div><div class="elma-fields"><div class="elma-row elma-row-origin"><input id="elmaFrom" placeholder="Başlangıç konumu"><button class="elma-my" id="elmaMy">Konumum</button><div class="elma-results" id="elmaFromResults"></div></div><div class="elma-row elma-row-destination"><input id="elmaTo" placeholder="Nereye gidiyorsun?"><div class="elma-results" id="elmaToResults"></div></div></div><div class="elma-picked" id="elmaPicked">Haritada başlangıç konumuna dokun</div><button class="elma-go" id="elmaGo">Rotayı göster</button></section>`;
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
            button.innerHTML='<b></b><small></small>';
            button.querySelector('b').textContent=item.name||item.display_name.split(',')[0];
            button.querySelector('small').textContent=item.display_name;
            button.onclick=()=>{
              const point={lon:+item.lon,lat:+item.lat,name:item.display_name};
              if(isOrigin)origin=point;else destination=point;
              marker(isOrigin?'origin':'destination',point);
              input.value=item.display_name;
              results.classList.remove('show');
              flyTo(point,16);
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
    if(!window.L)throw new Error('Leaflet yüklenemedi');

    map=L.map('map',{zoomControl:false,attributionControl:true,preferCanvas:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,inertia:true,inertiaDeceleration:4000}).setView(DEFAULT_CENTER,14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      updateWhenIdle:true,
      updateWhenZooming:false,
      keepBuffer:1,
      detectRetina:false,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar'
    }).addTo(map);

    map.on('click',event=>pickPoint(event.latlng.lat,event.latlng.lng));

    window.requestLocation=()=>navigator.geolocation?.getCurrentPosition(async position=>{
      window.elmaUserPosition=position;
      origin={lon:position.coords.longitude,lat:position.coords.latitude};
      origin.name=await reverse(origin.lon,origin.lat);
      marker('origin',origin);
      $('#elmaFrom').value=origin.name;
      flyTo(origin,17);
      mode(1);
    });

    window.showRoute=async()=>{
      if(!origin||!destination)return alert('Başlangıç ve varış seç.');
      const url='https://router.project-osrm.org/route/v1/driving/'+origin.lon+','+origin.lat+';'+destination.lon+','+destination.lat+'?overview=full&geometries=geojson';
      const response=await fetch(url);
      const data=await response.json();
      if(!data.routes?.[0])return alert('Rota bulunamadı');
      const points=data.routes[0].geometry.coordinates.map(coordinate=>[coordinate[1],coordinate[0]]);
      routeLine?.remove();
      routeLine=L.polyline(points,{color:'#050506',weight:6,opacity:.92,lineCap:'round',lineJoin:'round'}).addTo(map);
      map.fitBounds(routeLine.getBounds(),{padding:[34,34],animate:false});
    };

    requestAnimationFrame(()=>map.invalidateSize());
  }

  init().catch(console.error);
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
  line1Route.src='line-1-route.js?v=20260830-line1-stops';
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
  line6Route.src='line-6-route.js?v=20260830-line6-outbound-only';
  line6Route.defer=true;
  line6Route.dataset.elmaLine6Route='1';
  document.head.appendChild(line6Route);
  const pharmacy=document.createElement('script');
  pharmacy.src='pharmacy-service.js?v=20260830-pharmacy-permission';
  pharmacy.defer=true;
  pharmacy.dataset.elmaPharmacyService='1';
  document.head.appendChild(pharmacy);
})();
