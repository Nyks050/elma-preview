(()=>{
  const DATA_URL='assets/amasya-transit-data.json?v=20260922-map1';
  const STYLE_URL='elmago-night-map.json?v=20260923-1';
  const PANEL='.eg-panel[data-panel="transport-routes"]';
  const ACCENT='#D8FF53';
  let data,id,direction='outbound',map,libPromise,stopsVisible=true,pin,renderId=0;
  const $=selector=>document.querySelector(selector);
  const root=()=>$('#elmaRoutes');
  const current=()=>data?.lines.find(item=>item.id===id);
  const rad=n=>n*Math.PI/180;
  const label=item=>item.id==='4-alt'?'4 Alt':item.id==='4-ust'?'4 Üst':String(item.number);
  function distance(points){
    let total=0;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],dy=rad(b[0]-a[0]),dx=rad(b[1]-a[1]);
      const h=Math.sin(dy/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dx/2)**2;
      total+=12742*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
    }
    return total.toFixed(1).replace('.',',')+' km';
  }
  function segments(line){
    const stop=line.stops[line.returnStartIndex];
    const pivot=line.route.findIndex(p=>p[0]===stop?.lat&&p[1]===stop?.lng);
    if(pivot<0)return {outbound:line.route,return:line.route};
    return {outbound:line.route.slice(0,pivot+1),return:line.route.slice(pivot)};
  }
  const points=()=>segments(current())[direction];
  const other=()=>segments(current())[direction==='outbound'?'return':'outbound'];
  const marks=()=>current().stops.filter(stop=>stop.direction===direction);
  const lineFeature=coords=>({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:coords.map(p=>[p[1],p[0]])}});
  const collection=features=>({type:'FeatureCollection',features});
  function styles(){
    if($('#elmaRoutesStyle'))return;
    const style=document.createElement('style');style.id='elmaRoutesStyle';
    style.textContent=`
      ${PANEL}{padding:0 0 calc(74px + env(safe-area-inset-bottom))!important;background:#0B1114;color:#F4F7F2;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}
      ${PANEL}>.eg-service-back{display:none!important}
      .rx{position:relative;max-width:720px;height:calc(100dvh - 74px - env(safe-area-inset-bottom));min-height:620px;margin:auto;overflow:hidden;background:#0B1114;color:#F4F7F2}
      .rx *{box-sizing:border-box}.rx button,.rx input{font:inherit}.rx button{cursor:pointer}
      .rx-map{position:absolute;inset:0;background:#0B1114}
      .rx .maplibregl-control-container{font-family:Inter,-apple-system,sans-serif}
      .rx .maplibregl-ctrl-attrib{background:#0B1114dd!important;color:#C7D4D0!important;font-size:9px!important}
      .rx .maplibregl-ctrl-attrib a{color:#D8FF53!important}
      .rx-map-error{position:absolute;inset:0;display:grid;place-items:center;color:#F4F7F2;font-size:13px}
      .rx-top{position:absolute;z-index:5;top:0;right:0;left:0;padding:calc(env(safe-area-inset-top) + 14px) 17px 12px;background:linear-gradient(#0B1114 0%,#0B1114ee 66%,#0B111400 100%)}
      .rx-heading{display:flex;align-items:center;gap:12px}
      .rx-back{width:38px;height:38px;display:grid;place-items:center;flex:none;border:1px solid #708083;border-radius:12px;background:#172226;color:#F4F7F2;font-size:27px!important;line-height:1}
      .rx-brand{min-width:0}.rx-brand small{display:block;color:#A7B8B5;font-size:9px;font-weight:800;letter-spacing:2px}.rx-brand h1{margin:3px 0 0;color:#F4F7F2;font-size:23px;line-height:1;letter-spacing:-.7px}
      .rx-tools{display:flex;gap:7px;margin-left:auto}.rx-icon{width:39px;height:39px;display:grid;place-items:center;border:1px solid #708083;border-radius:12px;background:#172226;color:#F4F7F2;font-size:18px!important}
      .rx-icon[aria-pressed="false"]{color:#728185}
      .rx-lines{display:flex;gap:7px;overflow:auto;margin:17px -17px 0;padding:0 17px 5px;scrollbar-width:none}.rx-lines::-webkit-scrollbar{display:none}
      .rx-line{min-width:45px;height:39px;flex:none;padding:0 12px;border:1px solid #53656A;border-radius:12px;background:#152126;color:#C4D2CF;font-size:12px!important;font-weight:800!important;white-space:nowrap}
      .rx-line[aria-pressed="true"]{border-color:#D8FF53;background:#D8FF53;color:#0B1114}
      .rx-sheet{position:absolute;z-index:5;right:13px;bottom:18px;left:13px;padding:17px 18px 16px;border:1px solid #405256;border-radius:25px;background:#101A1ECC;box-shadow:0 17px 45px #0009;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
      .rx-sheet-top{display:flex;align-items:center;gap:12px}
      .rx-number{width:51px;height:51px;flex:none;display:grid;place-items:center;border-radius:16px;background:#D8FF53;color:#0B1114;font-size:23px;font-weight:900;letter-spacing:-.8px}
      .rx-summary{min-width:0}.rx-summary b{display:block;color:#F4F7F2;font-size:16px;letter-spacing:-.3px}.rx-summary span{display:block;margin-top:5px;color:#A6B8B5;font-size:11px;font-weight:650}
      .rx-sheet-fit{width:38px;height:38px;display:grid;place-items:center;margin-left:auto;border:1px solid #687A7D;border-radius:12px;background:#17272B;color:#D8FF53;font-size:18px!important}
      .rx-divider{height:1px;margin:16px 0;background:#3A4C50}
      .rx-direction{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;border:1px solid #405357;border-radius:14px;background:#0B1417}
      .rx-direction button{height:39px;border:0;border-radius:10px;background:transparent;color:#9DADAA;font-size:12px!important;font-weight:800!important}
      .rx-direction button[aria-pressed="true"]{background:#D8FF53;color:#0B1114}
      .rx-progress{display:flex;align-items:center;gap:12px;margin-top:16px}
      .rx-progress input{width:100%;height:26px;margin:0;appearance:none;background:transparent;touch-action:none}
      .rx-progress input::-webkit-slider-runnable-track{height:4px;border-radius:4px;background:linear-gradient(90deg,#D8FF53 var(--progress,0%),#53666B var(--progress,0%))}
      .rx-progress input::-moz-range-track{height:4px;border-radius:4px;background:#53666B}
      .rx-progress input::-webkit-slider-thumb{width:18px;height:18px;margin-top:-7px;appearance:none;border:4px solid #0B1114;border-radius:50%;background:#D8FF53;box-shadow:0 0 0 2px #D8FF53}
      .rx-progress input::-moz-range-thumb{width:12px;height:12px;border:3px solid #0B1114;border-radius:50%;background:#D8FF53}
      .rx-progress-edge{flex:none;color:#D8FF53;font-size:10px;font-weight:800}
      .rx-progress-name{min-height:18px;overflow:hidden;margin:4px 0 0;color:#C6D4D1;font-size:11px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}
      .rx-pin{width:22px;height:22px;display:grid;place-items:center;border:3px solid #0B1114;border-radius:50%;background:#D8FF53;box-shadow:0 0 0 3px #D8FF53}
      @media(max-width:360px){.rx-top{padding-right:11px;padding-left:11px}.rx-lines{margin-right:-11px;margin-left:-11px;padding-right:11px;padding-left:11px}.rx-sheet{right:8px;left:8px;padding:14px}.rx-brand h1{font-size:21px}}
    `;
    document.head.appendChild(style);
  }
  function library(){
    if(window.maplibregl)return Promise.resolve(window.maplibregl);
    if(libPromise)return libPromise;
    libPromise=new Promise((resolve,reject)=>{
      if(!$('#rxMapCSS')){
        const css=document.createElement('link');css.id='rxMapCSS';css.rel='stylesheet';
        css.href='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.css';document.head.appendChild(css);
      }
      const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.js';
      script.onload=()=>window.maplibregl?resolve(window.maplibregl):reject(new Error('MapLibre'));
      script.onerror=()=>reject(new Error('MapLibre'));
      document.head.appendChild(script);
    }).catch(error=>{libPromise=null;throw error});
    return libPromise;
  }
  function fit(){
    if(!map||!current())return;
    const coords=points(),lng=coords.map(p=>p[1]),lat=coords.map(p=>p[0]);
    if(!coords.length)return;
    map.fitBounds([[Math.min(...lng),Math.min(...lat)],[Math.max(...lng),Math.max(...lat)]],
      {padding:{top:160,right:30,bottom:290,left:30},maxZoom:15,duration:700});
  }
  function nearest(point){
    let best='',min=Infinity;
    for(const stop of marks()){
      const delta=(stop.lat-point[0])**2+(stop.lng-point[1])**2;
      if(delta<min){min=delta;best=stop.name}
    }
    return best;
  }
  function progress(value,fly=false){
    if(!data)return;
    const coords=points(),index=Math.round((coords.length-1)*Number(value)/100),point=coords[index];
    if(!point)return;
    const slider=root().querySelector('.rx-range');
    slider.style.setProperty('--progress',value+'%');
    root().querySelector('.rx-progress-name').textContent=nearest(point);
    if(!map||!map.isStyleLoaded())return;
    const coord=[point[1],point[0]];
    const feature=collection([{type:'Feature',properties:{},geometry:{type:'Point',coordinates:coord}}]);
    if(map.getSource('rx-progress'))map.getSource('rx-progress').setData(feature);
    if(fly)map.easeTo({center:coord,zoom:Math.max(map.getZoom(),14.5),duration:400});
  }
  function render(){
    if(!data||!root())return;
    const item=current(),coords=points();
    root().querySelector('.rx-number').textContent=label(item);
    root().querySelector('.rx-summary b').textContent=item.id.startsWith('4-')?'4 Numaralı Hat · '+item.variant:item.number+' Numaralı Hat';
    root().querySelector('.rx-summary span').textContent=distance(coords);
    root().querySelectorAll('[data-line]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.line===id)));
    root().querySelectorAll('[data-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.direction===direction)));
    root().querySelector('.rx-range').value='0';
    progress(0);draw();
  }
  async function draw(){
    const element=root()?.querySelector('.rx-map'),panel=root()?.closest('.eg-panel');
    if(!element||!data||!panel?.classList.contains('active'))return;
    const token=++renderId;
    try{
      const GL=await library();
      if(token!==renderId||!panel.classList.contains('active'))return;
      if(!map){
        map=new GL.Map({container:element,style:STYLE_URL,center:[35.83,40.65],zoom:12,
          attributionControl:true,dragRotate:false,pitchWithRotate:false});
        map.touchZoomRotate.disableRotation();
        map.on('load',()=>{if(data&&panel.classList.contains('active'))draw()});
        map.on('error',event=>console.warn('Harita:',event.error));
        return;
      }
      if(!map.isStyleLoaded())return;
      const geo=collection([lineFeature(points())]),ghost=collection([lineFeature(other())]);
      const markData=collection(marks().map((stop,index)=>({
        type:'Feature',properties:{end:index===0||index===marks().length-1},
        geometry:{type:'Point',coordinates:[stop.lng,stop.lat]}
      })));
      if(map.getSource('rx-line'))map.getSource('rx-line').setData(geo);
      else{
        map.addSource('rx-line',{type:'geojson',data:geo});
        map.addSource('rx-other',{type:'geojson',data:ghost});
        map.addSource('rx-stops',{type:'geojson',data:markData});
        map.addSource('rx-progress',{type:'geojson',data:collection([])});
        map.addLayer({id:'rx-ghost',type:'line',source:'rx-other',layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':'#658085','line-width':2,'line-dasharray':[2,3]}});
        map.addLayer({id:'rx-halo',type:'line',source:'rx-line',layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':'#0B1114','line-width':11}});
        map.addLayer({id:'rx-core',type:'line',source:'rx-line',layout:{'line-cap':'round','line-join':'round'},
          paint:{'line-color':ACCENT,'line-width':5}});
        map.addLayer({id:'rx-stops',type:'circle',source:'rx-stops',
          paint:{'circle-radius':['case',['get','end'],7,3],
            'circle-color':['case',['get','end'],ACCENT,'#0B1114'],
            'circle-stroke-color':ACCENT,'circle-stroke-width':2}});
        map.addLayer({id:'rx-progress-point',type:'circle',source:'rx-progress',
          paint:{'circle-radius':10,'circle-color':ACCENT,
            'circle-stroke-color':'#0B1114','circle-stroke-width':3}});
      }
      map.getSource('rx-other').setData(ghost);
      map.getSource('rx-stops').setData(markData);
      map.setLayoutProperty('rx-stops','visibility',stopsVisible?'visible':'none');
      map.resize();fit();progress(root().querySelector('.rx-range').value);
    }catch(error){
      console.warn('Güzergâh haritası yüklenemedi:',error);
      if(!map)element.innerHTML='<div class="rx-map-error">Harita yüklenemedi</div>';
    }
  }
  function mount(){
    const panel=$(PANEL);if(!panel||root())return;
    styles();
    const screen=document.createElement('div');screen.id='elmaRoutes';screen.className='rx';
    screen.innerHTML=`<div class="rx-map" aria-label="OpenStreetMap güzergâh haritası"></div><header class="rx-top"><div class="rx-heading"><button class="rx-back" type="button" aria-label="Ulaşıma dön">‹</button><div class="rx-brand"><small>ELMA GO / ULAŞIM</small><h1>Güzergâh</h1></div><div class="rx-tools"><button class="rx-icon rx-fit" type="button" aria-label="Rotaya odaklan">⌖</button><button class="rx-icon rx-stops-toggle" type="button" aria-label="Durakları göster veya gizle" aria-pressed="true">◉</button></div></div><nav class="rx-lines" aria-label="Hat seçimi"></nav></header><section class="rx-sheet"><div class="rx-sheet-top"><div class="rx-number"></div><div class="rx-summary"><b></b><span></span></div><button class="rx-sheet-fit" type="button" aria-label="Rotanın tamamını göster">⤢</button></div><div class="rx-divider"></div><div class="rx-direction" role="group" aria-label="Yön seçimi"><button type="button" data-direction="outbound" aria-pressed="true">Gidiş ↗</button><button type="button" data-direction="return" aria-pressed="false">Dönüş ↙</button></div><div class="rx-progress"><span class="rx-progress-edge">A</span><input class="rx-range" type="range" min="0" max="100" value="0" aria-label="Güzergâh boyunca ilerle"><span class="rx-progress-edge">B</span></div><div class="rx-progress-name"></div></section>`;
    panel.appendChild(screen);
    screen.querySelector('.rx-back').onclick=()=>panel.querySelector('.eg-service-back')?.click();
    screen.querySelectorAll('.rx-fit,.rx-sheet-fit').forEach(button=>button.onclick=fit);
    screen.querySelector('.rx-stops-toggle').onclick=event=>{
      stopsVisible=!stopsVisible;event.currentTarget.setAttribute('aria-pressed',String(stopsVisible));
      if(map?.getLayer('rx-stops'))map.setLayoutProperty('rx-stops','visibility',stopsVisible?'visible':'none');
    };
    screen.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>{direction=button.dataset.direction;render()});
    screen.querySelector('.rx-lines').onclick=event=>{
      const button=event.target.closest('[data-line]');if(button){id=button.dataset.line;render()}
    };
    screen.querySelector('.rx-range').addEventListener('input',event=>progress(event.target.value,true));
    new MutationObserver(()=>{if(panel.classList.contains('active')){map?.resize();draw()}}).observe(panel,{attributes:true,attributeFilter:['class']});
    fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error(response.status);return response.json()}).then(result=>{
      if(!result.lines?.length)throw new Error('Hat bulunamadı');
      result.lines=(result.lines||[]).filter(item=>item.id!=='11');data=result;id=result.lines[0]?.id||'';
      screen.querySelector('.rx-lines').innerHTML=result.lines.map(item=>`<button class="rx-line" type="button" data-line="${item.id}" aria-pressed="false">${label(item)}</button>`).join('');
      render();
    }).catch(error=>console.warn('Güzergâh verisi:',error));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  window.addEventListener('elma-home-widgets-ready',mount);
})();
