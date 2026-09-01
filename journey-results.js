(()=>{
  if(window.__elmaJourneyResultsMounted)return;
  window.__elmaJourneyResultsMounted=true;
  let overlays=[],sheet=null,current=null,activeRun=0;
  const $=selector=>document.querySelector(selector);
  const pt=value=>Array.isArray(value)?{lat:value[0],lng:value[1]}:{lat:value.lat,lng:value.lon??value.lng};
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  const fmtTime=date=>new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(date);
  const fmtMeters=value=>value<1000?Math.max(10,Math.round(value/10)*10)+' m':(value/1000).toFixed(1).replace('.',',')+' km';
  function mapsUrl(origin,destination,mode){const from=pt(origin),to=pt(destination),travel=mode==='WALKING'?'walking':mode==='TRANSIT'?'transit':'driving';return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from.lat+','+from.lng)+'&destination='+encodeURIComponent(to.lat+','+to.lng)+'&travelmode='+travel}
  function distance(a,b){const r=Math.PI/180,p1=a.lat*r,p2=b.lat*r,dp=(b.lat-a.lat)*r,dl=(b.lng-a.lng)*r,h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 12742000*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))}
  function clearOverlays(){overlays.forEach(item=>item.setMap(null));overlays=[]}
  function addLine(map,path,kind='solid'){
    if(!path?.length)return;
    const options=kind==='walk'?{strokeOpacity:0,strokeWeight:0,icons:[{icon:{path:'M 0,-1 0,1',strokeColor:'#050505',strokeOpacity:1,strokeWeight:4,scale:2.1},offset:'0',repeat:'13px'}]}:{strokeColor:'#050505',strokeOpacity:1,strokeWeight:6};
    const line=new google.maps.Polyline({map,path,clickable:false,zIndex:5,...options});overlays.push(line);
  }
  function detailedPath(route){return route?.legs?.flatMap(leg=>leg.steps?.flatMap(step=>step.path||[])||[])||route?.overview_path||[]}
  async function osmRoute(from,to,mode){
    const start=pt(from),end=pt(to),service=mode==='WALKING'?'routed-foot':'routed-car';
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
      const url=`https://routing.openstreetmap.de/${service}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
      const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('OSM '+response.status);
      const data=await response.json(),route=data.routes?.[0],coordinates=route?.geometry?.coordinates;if(!route||!coordinates?.length)return null;
      return {mode,path:coordinates.map(value=>({lat:value[1],lng:value[0]})),meters:route.distance||0,seconds:route.duration||0,summary:route.legs?.[0]?.steps?.map(step=>step.name).filter(Boolean).slice(0,2).join(', ')||'OpenStreetMap rotası',source:'osm'};
    }catch(error){console.warn(mode+' OSM rotası alınamadı:',error);return null}finally{clearTimeout(timer)}
  }
  async function googleRoute(from,to,mode){
    try{
      const result=await new google.maps.DirectionsService().route({origin:pt(from),destination:pt(to),travelMode:google.maps.TravelMode[mode],region:'TR',language:'tr'});
      const route=result.routes?.[0],leg=route?.legs?.[0];if(!route||!leg)return null;
      return {mode,path:detailedPath(route),meters:leg.distance?.value||0,seconds:leg.duration?.value||0,summary:route.summary||'',leg,source:'google'};
    }catch(error){console.warn(mode+' Google rotası alınamadı, OSM deneniyor:',error);return osmRoute(from,to,mode)}
  }
  function bestTransit(origin,destination,stops){
    let best=null;
    for(let board=0;board<stops.length-1;board++)for(let alight=board+1;alight<stops.length;alight++){
      const access=distance(pt(origin),pt(stops[board])),exit=distance(pt(stops[alight]),pt(destination)),score=access+exit;
      if(!best||score<best.score)best={board,alight,access,exit,score};
    }
    return best;
  }
  function closestIndex(route,stop,start=0){let best=start,min=Infinity;for(let i=start;i<route.length;i++){const d=distance(pt(route[i]),pt(stop));if(d<min){min=d;best=i}}return best}
  async function lineData(){for(let attempt=0;attempt<30;attempt++){if(window.ELMA_LINE_1_ROUTE)return window.ELMA_LINE_1_ROUTE;await new Promise(resolve=>setTimeout(resolve,50))}return null}
  async function transitRoute(origin,destination){
    const data=await lineData();if(!data)return null;
    const trip=bestTransit(origin,destination,data.stops);if(!trip||trip.access>3000||trip.exit>3000)return null;
    const boardPoint=pt(data.stops[trip.board]),alightPoint=pt(data.stops[trip.alight]);
    const [access,exit]=await Promise.all([googleRoute(origin,boardPoint,'WALKING'),googleRoute(alightPoint,destination,'WALKING')]);
    if(!access||!exit)return null;
    const fromIndex=closestIndex(data.route,data.stops[trip.board]),toIndex=closestIndex(data.route,data.stops[trip.alight],fromIndex);
    const busPath=data.route.slice(fromIndex,toIndex+1).map(pt),stops=trip.alight-trip.board,busSeconds=Math.max(180,stops*105);
    return {mode:'TRANSIT',...trip,accessRoute:access,exitRoute:exit,busPath,stops,seconds:access.seconds+busSeconds+exit.seconds,meters:access.meters+exit.meters,busSeconds};
  }
  function fit(map,paths){const bounds=new google.maps.LatLngBounds();paths.flat().forEach(point=>bounds.extend(point));if(!bounds.isEmpty())map.fitBounds(bounds,{top:70,right:35,bottom:Math.min(innerHeight*.62,520),left:35})}
  function draw(mode){
    if(!current)return;clearOverlays();const {map,drive,walk,transit}=current;
    if(mode==='TRANSIT'&&transit){addLine(map,transit.accessRoute.path,'walk');addLine(map,transit.busPath);addLine(map,transit.exitRoute.path,'walk');fit(map,[transit.accessRoute.path,transit.busPath,transit.exitRoute.path])}
    else{const route=mode==='WALKING'?walk:drive;if(route){addLine(map,route.path,mode==='WALKING'?'walk':'solid');fit(map,[route.path])}}
    sheet?.querySelectorAll('[data-result-mode]').forEach(button=>button.classList.toggle('active',button.dataset.resultMode===mode));
    sheet?.querySelectorAll('.jr-section').forEach(section=>section.hidden=section.dataset.section!==mode);
    const title=sheet?.querySelector('#jrTitle');if(title)title.textContent=mode==='TRANSIT'?'Toplu taşıma':mode==='WALKING'?'Yürüme':'Araba';
  }
  function mins(route){return route?Math.max(1,Math.round(route.seconds/60))+' dk.':'—'}
  function interval(start,seconds){const end=new Date(start.getTime()+seconds*1000);return fmtTime(start)+' – '+fmtTime(end)}
  function styles(){
    if($('#elmaJourneyResultsStyle'))return;const style=document.createElement('style');style.id='elmaJourneyResultsStyle';style.textContent=`.jr-sheet{position:fixed;z-index:910;left:0;right:0;bottom:0;max-width:560px;height:min(72dvh,680px);margin:auto;border-radius:34px 34px 0 0;background:#fff;color:#09090a;box-shadow:0 -12px 44px #0003;font-family:Inter,-apple-system,sans-serif;overflow:hidden;display:flex;flex-direction:column}.jr-grab{width:54px;height:6px;border-radius:99px;background:#c8c8cb;margin:12px auto 4px}.jr-head{display:flex;align-items:center;padding:9px 22px 13px}.jr-head h2{flex:1;margin:0;font-size:25px;letter-spacing:-.7px}.jr-circle{width:43px;height:43px;border:0;border-radius:50%;background:#f1f1f2;margin-left:8px;color:#09090a;display:grid;place-items:center;font-size:20px}.jr-modes{height:83px;display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #dedee0}.jr-mode{position:relative;border:0;background:#fff;color:#6b6b70;display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;font-weight:760}.jr-mode b{font-size:17px}.jr-mode.active{color:#008b99}.jr-mode.active:after{content:'';position:absolute;left:18%;right:18%;bottom:0;height:4px;border-radius:5px 5px 0 0;background:#008b99}.jr-filters{display:flex;align-items:center;gap:7px;padding:10px 13px;overflow-x:auto;border-bottom:1px solid #ececee;scrollbar-width:none}.jr-filter{height:42px;flex:0 0 auto;border:0;border-radius:14px;background:#f0f0f1;color:#202024;padding:0 14px;font-size:11px;font-weight:740;display:inline-flex;align-items:center}.jr-filter.active{background:#dde2e3}.jr-content{overflow:auto;-webkit-overflow-scrolling:touch}.jr-card{width:100%;border:0;border-bottom:10px solid #f0f1f2;background:#fff;color:#09090a;text-align:left;padding:18px 22px}.jr-card.active{background:#fafcfc}.jr-card-top{display:flex;align-items:flex-start;justify-content:space-between}.jr-card-time{font-size:28px;font-weight:520;letter-spacing:-1px}.jr-card-cost{color:#77787c;font-size:13px}.jr-range{margin-top:4px;font-size:14px}.jr-steps{display:flex;align-items:center;gap:7px;margin-top:11px;flex-wrap:wrap}.jr-step{display:inline-flex;align-items:center;gap:4px;border-radius:7px;background:#f0f0f1;padding:5px 7px;font-size:11px;font-weight:730}.jr-line{background:#09090a;color:#fff;font-size:12px}.jr-muted{margin-top:9px;color:#6c6d72;font-size:12px;line-height:1.4}.jr-empty{padding:25px 22px;color:#77787c}.jr-empty b{display:block;color:#202024;font-size:15px;margin-bottom:13px}.jr-map-link{display:inline-flex;align-items:center;min-height:40px;border-radius:13px;background:#09090a;color:#fff!important;text-decoration:none;padding:0 14px;font-size:12px;font-weight:780}.jr-attribution{padding:10px 22px 24px;color:#818187;font-size:9px}.jr-attribution a{color:inherit}.jr-direct-title{margin:0 0 13px;color:#55565a;font-size:17px}.jr-details{font-size:14px;line-height:1.55}.jr-details b{font-size:27px;font-weight:520}.jr-time-input{position:absolute;opacity:0;pointer-events:none}@media(max-width:390px){.jr-sheet{height:min(74dvh,650px);border-radius:28px 28px 0 0}.jr-head{padding-left:18px;padding-right:18px}.jr-head h2{font-size:23px}.jr-circle{width:39px;height:39px}.jr-card{padding:16px 18px}.jr-modes{height:76px}}`;document.head.appendChild(style)
  }
  function showLoading(){
    styles();sheet?.remove();sheet=document.createElement('section');sheet.id='elmaJourneyResults';sheet.className='jr-sheet';
    sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-live','polite');
    sheet.innerHTML=`<div class="jr-grab"></div><header class="jr-head"><h2>Rotalar hazırlanıyor</h2><button class="jr-circle" id="jrLoadingClose" type="button" aria-label="Kapat">×</button></header><div style="display:grid;place-items:center;flex:1;padding:30px;text-align:center"><div><div style="width:42px;height:42px;margin:0 auto 15px;border:4px solid #e3e3e5;border-top-color:#09090a;border-radius:50%;animation:jrSpin .8s linear infinite"></div><b style="font-size:16px">En uygun yollar hesaplanıyor…</b><div style="margin-top:7px;color:#77787c;font-size:11px">Araba, toplu taşıma ve yürüme seçenekleri karşılaştırılıyor.</div></div></div>`;
    document.body.appendChild(sheet);const nav=$('#elmaMainNav');if(nav)nav.style.display='none';$('#jrLoadingClose').onclick=()=>window.elmaClearJourneyResults();
    if(!$('#jrLoadingAnimation')){const animation=document.createElement('style');animation.id='jrLoadingAnimation';animation.textContent='@keyframes jrSpin{to{transform:rotate(360deg)}}';document.head.appendChild(animation)}
  }
  function makeSheet(origin,destination,drive,walk,transit,preferred){
    styles();sheet?.remove();sheet=document.createElement('section');sheet.id='elmaJourneyResults';sheet.className='jr-sheet';
    const now=new Date(),transitRange=transit?interval(now,transit.seconds):'',driveRange=drive?interval(now,drive.seconds):'',walkRange=walk?interval(now,walk.seconds):'';
    const links={TRANSIT:mapsUrl(origin,destination,'TRANSIT'),DRIVING:mapsUrl(origin,destination,'DRIVING'),WALKING:mapsUrl(origin,destination,'WALKING')};
    const empty=(message,mode)=>`<div class="jr-empty"><b>${message}</b><a class="jr-map-link" href="${links[mode]}" target="_blank" rel="noopener">Google Maps'te aç ↗</a></div>`;
    const usesOsm=[drive,walk,transit?.accessRoute,transit?.exitRoute].some(route=>route?.source==='osm');
    const attribution=usesOsm?`<footer class="jr-attribution">Rota verisi: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap katkıcıları</a></footer>`:'';
    sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
    sheet.innerHTML=`<div class="jr-grab"></div><header class="jr-head"><h2 id="jrTitle">Toplu taşıma</h2><button class="jr-circle" id="jrSettings" type="button" aria-label="Filtreler">☷</button><button class="jr-circle" id="jrShare" type="button" aria-label="Paylaş">↗</button><button class="jr-circle" id="jrClose" type="button" aria-label="Kapat">×</button></header><nav class="jr-modes"><button class="jr-mode" type="button" data-result-mode="DRIVING" aria-label="Araba, ${mins(drive)}"><b>🚗</b><span>${mins(drive)}</span></button><button class="jr-mode" type="button" data-result-mode="TRANSIT" aria-label="Toplu taşıma, ${mins(transit)}"><b>🚌</b><span>${mins(transit)}</span></button><button class="jr-mode" type="button" data-result-mode="WALKING" aria-label="Yürüme, ${mins(walk)}"><b>🚶</b><span>${mins(walk)}</span></button></nav><div class="jr-filters"><button class="jr-filter" id="jrRefresh" type="button" aria-label="Rotaları yenile">↻</button><button class="jr-filter" id="jrDeparture" type="button" aria-label="Kalkış saatini değiştir">Kalkış: ${fmtTime(now)} ▾</button><input class="jr-time-input" id="jrTime" type="time"><span class="jr-filter active">✓ Otobüs</span><span class="jr-filter active">✓ En az yürüme</span></div><main class="jr-content"><section class="jr-section" data-section="TRANSIT">${transit?`<button class="jr-card active" type="button" data-route-card="TRANSIT"><div class="jr-card-top"><span class="jr-card-time">${mins(transit)}</span><span class="jr-card-cost">Ücret bilgisi yakında</span></div><div class="jr-range" data-duration-seconds="${transit.seconds}">${transitRange}</div><div class="jr-steps"><span class="jr-step">🚶 ${Math.max(1,Math.round(transit.accessRoute.seconds/60))} dk.</span><span>›</span><span class="jr-step jr-line">🚌 1 Nolu Hat</span><span>›</span><span class="jr-step">🚶 ${Math.max(1,Math.round(transit.exitRoute.seconds/60))} dk.</span></div><div class="jr-muted">${transit.board+1}. durakta bin • ${transit.stops} durak git • ${transit.alight+1}. durakta in</div></button>`:empty('Bu yolculuk için 1 nolu hattın gidiş yönü uygun değil.','TRANSIT')}</section><section class="jr-section" data-section="DRIVING" hidden>${drive?`<button class="jr-card active" type="button" data-route-card="DRIVING"><h3 class="jr-direct-title">Araba</h3><div class="jr-card-top"><span class="jr-card-time">${mins(drive)}</span><span class="jr-card-cost">${fmtMeters(drive.meters)}</span></div><div class="jr-range" data-duration-seconds="${drive.seconds}">${driveRange}</div><div class="jr-muted">${escapeHtml(drive.summary||'Yol ağı rotası')} üzerinden</div></button>`:empty('Araba rotası şu anda hesaplanamadı.','DRIVING')}</section><section class="jr-section" data-section="WALKING" hidden>${walk?`<button class="jr-card active" type="button" data-route-card="WALKING"><h3 class="jr-direct-title">Yaya</h3><div class="jr-card-top"><span class="jr-card-time">${mins(walk)}</span><span class="jr-card-cost">${fmtMeters(walk.meters)}</span></div><div class="jr-range" data-duration-seconds="${walk.seconds}">${walkRange}</div><div class="jr-muted">Yaya yolları ve dönüşler takip edilir; rota düz çizgi değildir.</div></button>`:empty('Yürüme rotası şu anda hesaplanamadı.','WALKING')}</section>${attribution}</main>`;
    document.body.appendChild(sheet);const mainNav=$('#elmaMainNav');if(mainNav)mainNav.style.display='none';
    sheet.querySelectorAll('[data-result-mode]').forEach(button=>button.onclick=()=>draw(button.dataset.resultMode));
    sheet.querySelectorAll('[data-route-card]').forEach(button=>button.onclick=()=>draw(button.dataset.routeCard));
    $('#jrClose').onclick=()=>{window.elmaClearJourneyResults();window.elmaOpenSearch?.()};
    $('#jrShare').onclick=async()=>{const text='ElmaGo yolculuğu: '+(destination.name||'hedef')+' • '+mins(preferred==='WALKING'?walk:preferred==='DRIVING'?drive:transit),url=links[preferred]||links.TRANSIT;if(navigator.share)try{await navigator.share({title:'ElmaGo yolculuğu',text,url})}catch(e){}else try{await navigator.clipboard.writeText(text+' '+url);alert('Yolculuk bilgisi kopyalandı.')}catch(e){}};
    $('#jrSettings').onclick=()=>sheet.querySelector('.jr-filters').scrollIntoView({behavior:'smooth'});
    $('#jrRefresh').onclick=()=>window.elmaShowJourneyResults(origin,destination,current.map,preferred);
    const time=$('#jrTime');time.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');$('#jrDeparture').onclick=()=>{time.style.pointerEvents='auto';time.showPicker?.();time.click()};time.onchange=()=>{const [hours,minutes]=time.value.split(':').map(Number),departure=new Date();departure.setHours(hours,minutes,0,0);$('#jrDeparture').textContent='Kalkış: '+time.value+' ▾';sheet.querySelectorAll('.jr-range[data-duration-seconds]').forEach(range=>range.textContent=interval(departure,Number(range.dataset.durationSeconds)));time.style.pointerEvents='none'};
    draw((preferred==='TRANSIT'&&transit)||preferred==='WALKING'&&walk||preferred==='DRIVING'&&drive?preferred:transit?'TRANSIT':drive?'DRIVING':'WALKING');
  }
  window.elmaClearJourneyResults=()=>{activeRun++;clearOverlays();sheet?.remove();sheet=null;current=null;const nav=$('#elmaMainNav');if(nav)nav.style.display='grid'};
  window.elmaShowJourneyResults=async(origin,destination,map,preferred='TRANSIT')=>{
    window.elmaClearJourneyResults();const run=activeRun;showLoading();
    try{
      const [drive,walk,transit]=await Promise.all([googleRoute(origin,destination,'DRIVING'),googleRoute(origin,destination,'WALKING'),transitRoute(origin,destination)]);
      if(run!==activeRun)return true;
      current={origin,destination,map,drive,walk,transit};makeSheet(origin,destination,drive,walk,transit,preferred);return true;
    }catch(error){
      console.error('Yolculuk sonuçları hazırlanamadı:',error);if(run!==activeRun)return true;
      current={origin,destination,map,drive:null,walk:null,transit:null};makeSheet(origin,destination,null,null,null,preferred);return true;
    }
  };
})();
