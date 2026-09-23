(()=>{
  const DATA_URL='assets/amasya-transit-data.json?v=20260922-map1';
  const LEAFLET_CSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const panelSelector='.eg-panel[data-panel="transport-routes"]';
  let data,selectedId,direction='outbound',map,routeLayer,stopLayer,selectedMarker,loadingMap;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const label=line=>line.id==='4-alt'?'4 Alt':line.id==='4-ust'?'4 Üst':line.number+' Numaralı Hat';
  const activeLine=()=>data?.lines.find(line=>line.id===selectedId);
  const stopsFor=line=>line.stops.filter(stop=>stop.direction===direction);
  function styles(){
    if(document.getElementById('elmaRoutesStyle'))return;
    const style=document.createElement('style');style.id='elmaRoutesStyle';
    style.textContent=`
      ${panelSelector}{padding-bottom:calc(96px + env(safe-area-inset-bottom));color:#17191d;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}
      ${panelSelector}>.eg-service-back{display:none!important}
      .er-shell{max-width:720px;margin:auto;padding:calc(env(safe-area-inset-top) + 16px) 16px 24px}
      .er-heading{display:flex;align-items:center;gap:13px;margin-bottom:18px}
      .er-back{width:39px;height:39px;flex:none;border:1px solid #e3e5e8;border-radius:13px;background:#fff;color:#202329;font-size:26px;line-height:1;cursor:pointer}
      .er-heading p{margin:0 0 3px;color:#81868e;font-size:10px;font-weight:800;letter-spacing:1.3px}
      .er-heading h1{margin:0;font-size:27px;letter-spacing:-1.1px;line-height:1.1}
      .er-intro{margin:-7px 0 17px;color:#747983;font-size:12px;line-height:1.5}
      .er-line-picker{display:flex;gap:8px;overflow-x:auto;margin:0 -16px 16px;padding:0 16px 4px;scrollbar-width:none}
      .er-line-picker::-webkit-scrollbar{display:none}
      .er-line{display:flex;align-items:center;gap:9px;flex:none;min-height:43px;padding:5px 13px 5px 6px;border:1px solid #e3e5e8;border-radius:14px;background:#fff;color:#4c525a;font-size:12px;font-weight:750;cursor:pointer}
      .er-line b{min-width:31px;height:31px;display:grid;place-items:center;border-radius:10px;background:#f0f1f3;color:#202329;font-size:13px}
      .er-line[aria-pressed="true"]{border-color:#17191d;background:#17191d;color:#fff}
      .er-line[aria-pressed="true"] b{background:#fff;color:#17191d}
      .er-card{overflow:hidden;border:1px solid #e4e6e8;border-radius:22px;background:#fff;box-shadow:0 10px 32px #1d24300c}
      .er-card-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 17px}
      .er-card-top h2{margin:0;font-size:17px;letter-spacing:-.5px}.er-card-top p{margin:4px 0 0;color:#81868e;font-size:11px}
      .er-legend{display:flex;align-items:center;gap:6px;flex:none;color:#737982;font-size:10px;font-weight:750}.er-legend i{width:16px;height:4px;border-radius:4px;background:#202329}
      .er-map{height:min(46vh,390px);min-height:300px;background:#edf0ed}.er-map .leaflet-control-attribution{font-size:9px}
      .er-map-message{height:100%;display:grid;place-items:center;padding:22px;color:#626973;font-size:12px;text-align:center}
      .er-map-tools{display:flex;justify-content:flex-end;padding:9px 13px;border-top:1px solid #e9eaec}
      .er-map-tools button{padding:7px 11px;border:0;border-radius:9px;background:#f2f3f5;color:#333840;font-size:11px;font-weight:750;cursor:pointer}
      .er-stop-dot{width:12px;height:12px;border:2.5px solid #fff;border-radius:50%;background:#202329;box-shadow:0 0 0 2px #202329,0 2px 6px #0005}
      .er-stop-dot.selected{width:17px;height:17px;background:#fff;box-shadow:0 0 0 4px #202329,0 2px 8px #0006}
      .er-section{margin-top:21px}.er-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.er-section-head h2{margin:0;font-size:19px;letter-spacing:-.5px}.er-section-head span{color:#858a93;font-size:11px;font-weight:700}
      .er-directions{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:14px;padding:4px;border-radius:14px;background:#eff0f2}
      .er-directions button{height:39px;border:0;border-radius:11px;background:transparent;color:#747983;font-size:12px;font-weight:800;cursor:pointer}
      .er-directions button[aria-pressed="true"]{background:#17191d;color:#fff;box-shadow:0 2px 8px #1a1e2430}
      .er-stops{margin:0;padding:0;list-style:none;border:1px solid #e4e6e8;border-radius:19px;background:#fff;overflow:hidden}
      .er-stops li+li{border-top:1px solid #f0f1f2}
      .er-stop{width:100%;display:flex;align-items:center;gap:13px;min-height:58px;padding:10px 15px;border:0;background:transparent;color:#202329;text-align:left;cursor:pointer}
      .er-stop[aria-current="true"]{background:#f0f1f3}
      .er-stop-index{width:27px;height:27px;flex:none;display:grid;place-items:center;border-radius:50%;background:#eef0f2;color:#5d636d;font-size:10px;font-weight:800}
      .er-stop[aria-current="true"] .er-stop-index{background:#17191d;color:#fff}
      .er-stop-name{font-size:12px;font-weight:750}.er-stop-sub{display:block;margin-top:3px;color:#8a8f97;font-size:10px;font-weight:600}
      .er-status{padding:32px 20px;border:1px solid #e4e6e8;border-radius:18px;background:#fff;color:#636973;font-size:13px;text-align:center}
      @media(min-width:720px){.er-shell{padding-top:32px}.er-map{height:390px}}
    `;
    document.head.appendChild(style);
  }
  function loadLeaflet(){
    if(window.L)return Promise.resolve(window.L);
    if(loadingMap)return loadingMap;
    loadingMap=new Promise((resolve,reject)=>{
      if(!document.querySelector('link[data-elma-route-leaflet]')){
        const css=document.createElement('link');css.rel='stylesheet';css.href=LEAFLET_CSS;css.dataset.elmaRouteLeaflet='1';document.head.appendChild(css);
      }
      const existing=document.querySelector('script[data-elma-route-leaflet]');
      const script=existing||document.createElement('script');
      script.addEventListener('load',()=>window.L?resolve(window.L):reject(new Error('Leaflet yüklenemedi')),{once:true});
      script.addEventListener('error',()=>reject(new Error('Harita kütüphanesi yüklenemedi')),{once:true});
      if(!existing){script.src=LEAFLET_JS;script.dataset.elmaRouteLeaflet='1';document.head.appendChild(script)}
    }).catch(error=>{loadingMap=null;throw error});
    return loadingMap;
  }
  function splitRoute(line){
    const turning=line.stops[line.returnStartIndex];
    if(!turning)return line.route;
    const index=line.route.findIndex(point=>point[0]===turning.lat&&point[1]===turning.lng);
    if(index<0)return line.route;
    return direction==='outbound'?line.route.slice(0,index+1):line.route.slice(index);
  }
  function render(){
    const root=document.getElementById('elmaRoutes');if(!root||!data)return;
    const line=activeLine(),stops=stopsFor(line);
    root.querySelector('.er-line-picker').innerHTML=data.lines.map(item=>`<button class="er-line" type="button" data-line="${esc(item.id)}" aria-pressed="${item.id===selectedId}"><b>${esc(item.number)}</b>${item.variant?esc(item.variant)+' ':''}Hat</button>`).join('');
    root.querySelector('.er-card-top h2').textContent=label(line);
    root.querySelector('.er-card-top p').textContent=`${line.stops.length} durak · ${line.frequency||'Tarife belirtilmedi'}`;
    root.querySelector('.er-section-head span').textContent=stops.length+' durak';
    root.querySelectorAll('[data-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.direction===direction)));
    root.querySelector('.er-stops').innerHTML=stops.map((stop,index)=>`<li><button class="er-stop" type="button" data-stop="${index}" aria-current="false"><span class="er-stop-index">${index+1}</span><span><span class="er-stop-name">${esc(stop.name)}</span><small class="er-stop-sub">${direction==='outbound'?'Gidiş':'Dönüş'} · Durak ${esc(stop.number)}</small></span></button></li>`).join('');
    drawMap();
  }
  async function drawMap(){
    const root=document.getElementById('elmaRoutes'),element=root?.querySelector('.er-map');if(!element||!data||!root.closest('.eg-panel')?.classList.contains('active'))return;
    try{
      const L=await loadLeaflet();
      if(!element.isConnected||!root.closest('.eg-panel')?.classList.contains('active'))return;
      if(!map){
        element.replaceChildren();
        map=L.map(element,{zoomControl:false,scrollWheelZoom:false,preferCanvas:true});
        L.tileLayer(window.ELMA_OSM_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> katkıda bulunanlar'}).addTo(map);
        L.control.zoom({position:'bottomright'}).addTo(map);
      }
      routeLayer?.remove();stopLayer?.remove();routeLayer=L.layerGroup().addTo(map);stopLayer=L.layerGroup().addTo(map);selectedMarker=null;
      const line=activeLine(),route=splitRoute(line),stops=stopsFor(line);
      if(route.length){
        L.polyline(route,{color:'#fff',weight:9,opacity:.9,lineCap:'round',lineJoin:'round',interactive:false}).addTo(routeLayer);
        L.polyline(route,{color:'#202329',weight:5,opacity:1,lineCap:'round',lineJoin:'round',interactive:false}).addTo(routeLayer);
      }
      stops.forEach((stop,index)=>{
        const marker=L.marker([stop.lat,stop.lng],{icon:L.divIcon({className:'',html:'<div class="er-stop-dot"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(stopLayer);
        marker.bindTooltip(esc(stop.name),{direction:'top'});
        marker.on('click',()=>selectStop(index));
      });
      const bounds=route.length?L.latLngBounds(route):L.latLngBounds(stops.map(stop=>[stop.lat,stop.lng]));
      if(bounds.isValid())map.fitBounds(bounds,{padding:[30,30],maxZoom:15});
      setTimeout(()=>map?.invalidateSize(),80);
    }catch(error){console.warn('Güzergâh haritası açılamadı:',error);element.innerHTML='<div class="er-map-message">OpenStreetMap haritası yüklenemedi. Bağlantını kontrol edip yeniden dene.</div>'}
  }
  function selectStop(index){
    const root=document.getElementById('elmaRoutes'),line=activeLine(),stop=stopsFor(line)[index];if(!stop)return;
    root.querySelectorAll('.er-stop').forEach(button=>button.setAttribute('aria-current',String(Number(button.dataset.stop)===index)));
    root.querySelector(`.er-stop[data-stop="${index}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'});
    if(map&&window.L){
      selectedMarker?.remove();
      selectedMarker=window.L.marker([stop.lat,stop.lng],{icon:window.L.divIcon({className:'',html:'<div class="er-stop-dot selected"></div>',iconSize:[22,22],iconAnchor:[11,11]})}).addTo(stopLayer);
      selectedMarker.bindTooltip(esc(stop.name),{permanent:true,direction:'top'});
      map.flyTo([stop.lat,stop.lng],Math.max(map.getZoom(),16),{duration:.5});
    }
  }
  function mount(){
    const panel=document.querySelector(panelSelector);if(!panel||document.getElementById('elmaRoutes'))return;
    styles();
    const root=document.createElement('div');root.id='elmaRoutes';root.className='er-shell';
    root.innerHTML=`<header class="er-heading"><button class="er-back" type="button" aria-label="Ulaşıma dön">‹</button><div><p>AMASYA ULAŞIM</p><h1>Güzergâhlar</h1></div></header><p class="er-intro">Hat seç, güzergâhı haritada incele ve duraklara dokun.</p><nav class="er-line-picker" aria-label="Hat seçimi"></nav><div class="er-card"><div class="er-card-top"><div><h2>Hatlar</h2><p>Güzergâh yükleniyor</p></div><span class="er-legend"><i></i> Rota</span></div><div class="er-map" aria-label="OpenStreetMap güzergâh haritası"><div class="er-map-message">Harita yükleniyor…</div></div><div class="er-map-tools"><button type="button" data-fit-route>Rotayı göster</button></div></div><section class="er-section"><div class="er-section-head"><h2>Duraklar</h2><span></span></div><div class="er-directions" role="group" aria-label="Yön seçimi"><button type="button" data-direction="outbound" aria-pressed="true">Gidiş</button><button type="button" data-direction="return" aria-pressed="false">Dönüş</button></div><ol class="er-stops"></ol></section>`;
    panel.appendChild(root);
    new MutationObserver(()=>{if(panel.classList.contains('active')&&data){drawMap();setTimeout(()=>map?.invalidateSize(),120)}}).observe(panel,{attributes:true,attributeFilter:['class']});
    root.addEventListener('click',event=>{
      if(event.target.closest('.er-back')){panel.querySelector('.eg-service-back')?.click();return}
      const lineButton=event.target.closest('[data-line]');if(lineButton){selectedId=lineButton.dataset.line;render();return}
      const directionButton=event.target.closest('[data-direction]');if(directionButton){direction=directionButton.dataset.direction;render();return}
      const stopButton=event.target.closest('[data-stop]');if(stopButton){selectStop(Number(stopButton.dataset.stop));return}
      if(event.target.closest('[data-fit-route]')){const route=splitRoute(activeLine());if(map&&route.length)map.fitBounds(route,{padding:[30,30],maxZoom:15})}
    });
    fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error('Veri: '+response.status);return response.json()}).then(result=>{
      if(!Array.isArray(result.lines)||!result.lines.length)throw new Error('Hat bulunamadı');
      data=result;selectedId=result.lines[0].id;render();
    }).catch(error=>{console.warn('Güzergâh verisi yüklenemedi:',error);root.querySelector('.er-line-picker').innerHTML='<div class="er-status">Güzergâh verileri yüklenemedi. Sayfayı yenileyip tekrar dene.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
  window.addEventListener('elma-home-widgets-ready',mount);
})();
