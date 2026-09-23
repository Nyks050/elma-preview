(()=>{
  const DATA='assets/amasya-transit-data.json?v=20260922-map1';
  const PANEL='.eg-panel[data-panel="transport-routes"]';
  let data,id,direction='outbound',map,mapPromise,drawId=0;
  const $=s=>document.querySelector(s),root=()=>$('#elmaRoutes');
  const line=()=>data?.lines.find(item=>item.id===id);
  const label=item=>item.id==='4-alt'?'4 Alt':item.id==='4-ust'?'4 Üst':'Hat '+item.number;
  const stops=()=>line().stops.filter(stop=>stop.direction===direction);
  function route(){
    const item=line(),turn=item.stops[item.returnStartIndex];
    const index=item.route.findIndex(point=>point[0]===turn?.lat&&point[1]===turn?.lng);
    return index<0?item.route:direction==='outbound'?item.route.slice(0,index+1):item.route.slice(index);
  }
  function km(points){
    let length=0;const rad=x=>x*Math.PI/180;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],lat=rad(b[0]-a[0]),lon=rad(b[1]-a[1]);
      const h=Math.sin(lat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(lon/2)**2;
      length+=12742*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
    }
    return length.toFixed(1).replace('.',',')+' km';
  }
  function styles(){
    if($('#elmaRoutesStyle'))return;
    const style=document.createElement('style');style.id='elmaRoutesStyle';
    style.textContent=`
      ${PANEL}{padding:0 0 calc(78px + env(safe-area-inset-bottom))!important;background:#fff;color:#000;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}
      ${PANEL}>.eg-service-back{display:none!important}
      .er-screen{max-width:720px;min-height:calc(100dvh - 78px);margin:auto;background:#fff}
      .er-screen *{box-sizing:border-box}.er-screen button,.er-screen select{font:inherit}
      .er-head{height:calc(86px + env(safe-area-inset-top));display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:0 18px 16px;background:#fff}
      .er-head-left{display:flex;align-items:center;gap:12px;min-width:0}
      .er-back{width:38px;height:38px;flex:none;border:1.5px solid #000;border-radius:12px;background:#fff;color:#000;font-size:26px!important;line-height:1;cursor:pointer}
      .er-title{margin:0;font-size:26px;font-weight:820;letter-spacing:-1px;line-height:1}
      .er-select-wrap{position:relative;flex:none}
      .er-select{max-width:135px;height:39px;appearance:none;padding:0 32px 0 13px;border:1.5px solid #000;border-radius:12px;background:#fff;color:#000;font-size:12px!important;font-weight:800!important;cursor:pointer}
      .er-select-wrap:after{content:'⌄';position:absolute;right:12px;top:3px;font-size:24px;pointer-events:none}
      .er-map-area{position:relative;height:clamp(480px,calc(100dvh - 170px - env(safe-area-inset-top)),850px);overflow:hidden;border-top:1px solid #000;background:#fff}
      .er-map{position:absolute;inset:0;background:#fff}
      .er-map .maplibregl-control-container{font-family:Inter,-apple-system,sans-serif}
      .er-map .maplibregl-ctrl-attrib{background:#fff!important;color:#000!important;font-size:9px!important}
      .er-map .maplibregl-ctrl-attrib a{color:#000!important}
      .er-error{height:100%;display:grid;place-items:center;padding:20px;text-align:center;font-size:13px;font-weight:700}
      .er-center{position:absolute;top:18px;right:18px;z-index:700;width:43px;height:43px;border:1.5px solid #000;border-radius:13px;background:#fff;color:#000;font-size:23px!important;cursor:pointer}
      .er-sheet{position:absolute;right:13px;bottom:24px;left:13px;z-index:700;padding:13px;border:1.5px solid #000;border-radius:22px;background:#fff}
      .er-handle{width:34px;height:4px;margin:0 auto 13px;border-radius:4px;background:#000}
      .er-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .er-directions{display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border:1.5px solid #000;border-radius:12px}
      .er-directions button{height:46px;border:0;background:#fff;color:#000;font-size:12px!important;font-weight:800!important;cursor:pointer}
      .er-directions button+button{border-left:1px solid #000}
      .er-directions button[aria-pressed="true"]{background:#000;color:#fff}
      .er-fit{height:49px;border:1.5px solid #000;border-radius:12px;background:#000;color:#fff;font-size:12px!important;font-weight:800!important;cursor:pointer}
      .er-distance{display:flex;justify-content:space-between;align-items:center;margin:11px 4px 0;font-size:11px;font-weight:800}
      .er-distance strong{font-size:17px;letter-spacing:-.5px}
      .er-end{width:18px;height:18px;border:4px solid #000;border-radius:50%;background:#fff;box-shadow:0 0 0 3px #fff}
      .er-end.last{background:#000}
      @media(max-width:370px){.er-title{font-size:22px}.er-select{max-width:110px}.er-actions{gap:5px}.er-directions button,.er-fit{font-size:10px!important}}
      @media(min-width:720px){.er-screen{border-right:1px solid #000;border-left:1px solid #000}.er-map-area{height:720px}}
    `;
    document.head.appendChild(style);
  }
  function loadMap(){
    if(window.maplibregl)return Promise.resolve(window.maplibregl);
    if(mapPromise)return mapPromise;
    mapPromise=new Promise((resolve,reject)=>{
      if(!$('#elmaRoutesMapCSS')){
        const css=document.createElement('link');css.id='elmaRoutesMapCSS';css.rel='stylesheet';
        css.href='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.css';document.head.appendChild(css);
      }
      const script=document.createElement('script');
      script.src='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.js';
      script.onload=()=>window.maplibregl?resolve(window.maplibregl):reject(new Error('MapLibre'));
      script.onerror=()=>reject(new Error('MapLibre'));
      document.head.appendChild(script);
    }).catch(error=>{mapPromise=null;throw error});
    return mapPromise;
  }
  function fit(){
    if(!map||!line())return;
    const points=route();
    if(!points.length)return;
    const xs=points.map(point=>point[1]),ys=points.map(point=>point[0]);
    map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],
      {padding:{top:55,right:28,bottom:190,left:28},maxZoom:15,duration:550});
  }
  async function draw(){
    const element=root()?.querySelector('.er-map'),panel=root()?.closest('.eg-panel');
    if(!element||!data||!panel?.classList.contains('active'))return;
    const token=++drawId;
    try{
      const GL=await loadMap();
      if(token!==drawId||!element.isConnected||!panel.classList.contains('active'))return;
      if(!map){
        map=new GL.Map({container:element,style:'elmago-bw-map.json?v=20260923-1',
          center:[35.83,40.65],zoom:12,attributionControl:true,dragRotate:false,pitchWithRotate:false});
        map.touchZoomRotate.disableRotation();
        map.on('load',()=>{if(data&&panel.classList.contains('active'))draw()});
        map.on('error',event=>console.warn('Harita döşemesi:',event.error));
        return;
      }
      if(!map.isStyleLoaded())return;
      const points=route(),marks=stops();
      const geometry={type:'Feature',geometry:{type:'LineString',coordinates:points.map(p=>[p[1],p[0]])},properties:{}};
      const stopFeatures=marks.map((stop,index)=>({
        type:'Feature',geometry:{type:'Point',coordinates:[stop.lng,stop.lat]},
        properties:{terminal:index===0||index===marks.length-1,show:index===0||index===marks.length-1||index%5===0}
      })).filter(feature=>feature.properties.show);
      const routeData={type:'FeatureCollection',features:[geometry]};
      const stopData={type:'FeatureCollection',features:stopFeatures};
      if(map.getSource('elma-route'))map.getSource('elma-route').setData(routeData);
      else{
        map.addSource('elma-route',{type:'geojson',data:routeData});
        map.addLayer({id:'elma-route-halo',type:'line',source:'elma-route',
          layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':'#fff','line-width':11}});
        map.addLayer({id:'elma-route-core',type:'line',source:'elma-route',
          layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':'#000','line-width':5.5}});
      }
      if(map.getSource('elma-stops'))map.getSource('elma-stops').setData(stopData);
      else{
        map.addSource('elma-stops',{type:'geojson',data:stopData});
        map.addLayer({id:'elma-stop-halo',type:'circle',source:'elma-stops',
          paint:{'circle-radius':['case',['get','terminal'],8,3.5],
            'circle-color':'#fff','circle-stroke-color':'#000',
            'circle-stroke-width':['case',['get','terminal'],3,1.5]}});
      }
      map.resize();fit();
    }catch(error){
      console.warn('Güzergâh haritası yüklenemedi:',error);
      if(element&&!map)element.innerHTML='<div class="er-error">Harita yüklenemedi</div>';
    }
  }
  function render(){
    if(!data||!root())return;
    root().querySelector('.er-select').value=id;
    root().querySelectorAll('[data-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.direction===direction)));
    root().querySelector('.er-distance strong').textContent=km(route());
    draw();
  }
  function mount(){
    const panel=$(PANEL);if(!panel||root())return;
    styles();
    const screen=document.createElement('div');screen.id='elmaRoutes';screen.className='er-screen';
    screen.innerHTML=`<header class="er-head"><div class="er-head-left"><button class="er-back" type="button" aria-label="Ulaşıma dön">‹</button><h1 class="er-title">Güzergâh</h1></div><label class="er-select-wrap"><select class="er-select" aria-label="Hat seçimi"></select></label></header><div class="er-map-area"><div class="er-map" aria-label="OpenStreetMap güzergâh haritası"></div><button class="er-center" type="button" aria-label="Rotaya odaklan">⌖</button><div class="er-sheet"><div class="er-handle"></div><div class="er-actions"><div class="er-directions" role="group" aria-label="Yön seçimi"><button type="button" data-direction="outbound" aria-pressed="true">Gidiş</button><button type="button" data-direction="return" aria-pressed="false">Dönüş</button></div><button class="er-fit" type="button">Rotayı göster ↗</button></div><div class="er-distance"><span>ROTA UZUNLUĞU</span><strong>—</strong></div></div></div>`;
    panel.appendChild(screen);
    screen.querySelector('.er-back').onclick=()=>panel.querySelector('.eg-service-back')?.click();
    screen.querySelector('.er-select').onchange=event=>{id=event.target.value;render()};
    screen.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{direction=button.dataset.direction;render()});
    screen.querySelector('.er-fit').onclick=fit;screen.querySelector('.er-center').onclick=fit;
    new MutationObserver(()=>{if(panel.classList.contains('active')){map?.resize();draw()}}).observe(panel,{attributes:true,attributeFilter:['class']});
    fetch(DATA).then(response=>{if(!response.ok)throw new Error(response.status);return response.json()}).then(result=>{
      if(!Array.isArray(result.lines)||!result.lines.length)throw new Error('Hat bulunamadı');
      data=result;id=result.lines[0].id;
      screen.querySelector('.er-select').innerHTML=result.lines.map(item=>'<option value="'+item.id+'">'+label(item)+'</option>').join('');
      render();
    }).catch(error=>{console.warn('Güzergâh verisi yüklenemedi:',error);screen.querySelector('.er-distance strong').textContent='—'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
  window.addEventListener('elma-home-widgets-ready',mount);
})();
