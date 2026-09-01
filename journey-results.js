(()=>{
  if(window.__elmaJourneyResultsMounted)return;
  window.__elmaJourneyResultsMounted=true;
  let overlays=[],stopOverlays=[],sheet=null,current=null,activeRun=0;
  const $=selector=>document.querySelector(selector);
  const pt=value=>Array.isArray(value)?{lat:value[0],lng:value[1]}:{lat:value.lat,lng:value.lon??value.lng};
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  const fmtTime=date=>new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(date);
  const fmtMeters=value=>value<1000?Math.max(10,Math.round(value/10)*10)+' m':(value/1000).toFixed(1).replace('.',',')+' km';
  function mapsUrl(origin,destination,mode){const from=pt(origin),to=pt(destination),travel=mode==='WALKING'?'walking':mode==='TRANSIT'?'transit':'driving';return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from.lat+','+from.lng)+'&destination='+encodeURIComponent(to.lat+','+to.lng)+'&travelmode='+travel}
  function distance(a,b){const r=Math.PI/180,p1=a.lat*r,p2=b.lat*r,dp=(b.lat-a.lat)*r,dl=(b.lng-a.lng)*r,h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 12742000*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))}
  function clearStopOverlays(){stopOverlays.forEach(item=>item.setMap(null));stopOverlays=[]}
  function clearOverlays(){overlays.forEach(item=>item.setMap(null));overlays=[];clearStopOverlays()}
  function lockTransitMap(locked){
    let shield=document.getElementById('jrTransitMapShield');
    if(locked&&!shield){shield=document.createElement('div');shield.id='jrTransitMapShield';shield.className='jr-map-shield';shield.setAttribute('aria-hidden','true');document.querySelector('.mapwrap')?.appendChild(shield)}
    if(!locked)shield?.remove();
  }
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
    return {mode:'TRANSIT',...trip,accessRoute:access,exitRoute:exit,busPath,stopPoints:data.stops.slice(trip.board,trip.alight+1).map(pt),stops,seconds:access.seconds+busSeconds+exit.seconds,meters:access.meters+exit.meters,busSeconds};
  }
  function addTransitStopMarkers(map,transit,showAll=false){
    clearStopOverlays();if(!transit?.stopPoints?.length)return;
    transit.stopPoints.forEach((position,offset)=>{
      const isBoard=offset===0,isAlight=offset===transit.stopPoints.length-1;if(!showAll&&!isBoard&&!isAlight)return;
      const number=transit.board+offset+1,marker=new google.maps.Marker({map,position,clickable:false,zIndex:20+offset,title:'',label:{text:String(number),color:isBoard?'#fff':'#09090a',fontSize:'9px',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:isBoard||isAlight?12:9,fillColor:isBoard?'#09090a':'#fff',fillOpacity:1,strokeColor:'#09090a',strokeOpacity:1,strokeWeight:2.5}});stopOverlays.push(marker);
    });
  }
  function fit(map,paths){const bounds=new google.maps.LatLngBounds();paths.flat().forEach(point=>bounds.extend(point));if(!bounds.isEmpty())map.fitBounds(bounds,{top:70,right:38,bottom:92,left:38})}
  function draw(mode){
    if(!current)return;clearOverlays();const {map,drive,walk,transit}=current;
    lockTransitMap(mode==='TRANSIT');
    if(mode==='TRANSIT'&&transit){addLine(map,transit.accessRoute.path,'walk');addLine(map,transit.busPath);addLine(map,transit.exitRoute.path,'walk');addTransitStopMarkers(map,transit,false);fit(map,[transit.accessRoute.path,transit.busPath,transit.exitRoute.path])}
    else{const route=mode==='WALKING'?walk:drive;if(route){addLine(map,route.path,mode==='WALKING'?'walk':'solid');fit(map,[route.path])}}
    sheet?.querySelectorAll('.jr-section').forEach(section=>section.hidden=section.dataset.section!==mode);
    const title=sheet?.querySelector('#jrTitle');if(title)title.textContent=mode==='TRANSIT'?'Toplu taşıma':mode==='WALKING'?'Yürüme':'Araba';
  }
  function mins(route){return route?Math.max(1,Math.round(route.seconds/60))+' dk.':'—'}
  function interval(start,seconds){const end=new Date(start.getTime()+seconds*1000);return fmtTime(start)+' – '+fmtTime(end)}
  function styles(){
    if($('#elmaJourneyResultsStyle'))return;const style=document.createElement('style');style.id='elmaJourneyResultsStyle';style.textContent=`.jr-sheet{position:fixed;z-index:910;left:0;right:0;bottom:0;max-width:560px;height:auto;max-height:min(56dvh,560px);margin:auto;border-radius:34px 34px 0 0;background:#fff;color:#09090a;box-shadow:0 -12px 44px #0003;font-family:Inter,-apple-system,sans-serif;overflow:hidden;display:flex;flex-direction:column;transition:transform .28s cubic-bezier(.22,.8,.24,1)}.jr-sheet.collapsed{transform:translateY(calc(100% - 76px))}.jr-grab{width:54px;height:6px;border-radius:99px;background:#bfc0c3;margin:10px auto 3px;cursor:grab;touch-action:none}.jr-head{display:flex;align-items:center;padding:7px 22px 14px}.jr-head h2{flex:1;margin:0;font-size:24px;letter-spacing:-.7px}.jr-circle{width:43px;height:43px;border:0;border-radius:50%;background:#f1f1f2;margin-left:8px;color:#09090a;display:grid;place-items:center;font-size:20px}.jr-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:0 16px 12px;border-bottom:1px solid #ececee}.jr-action{min-width:0;height:48px;border:0;border-radius:15px;background:#f0f0f1;color:#17171a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-decoration:none;font-size:10px;font-weight:760}.jr-action b{font-size:17px;line-height:1}.jr-action.primary{background:#09090a;color:#fff}.jr-stop-list{margin:0 16px 12px;border:1px solid #e0e0e2;border-radius:15px;background:#f7f7f8;padding:10px 12px;font-size:11px;line-height:1.55}.jr-stop-list[hidden]{display:none}.jr-stop-list b{display:block;font-size:12px;margin-bottom:6px}.jr-stop-row{display:grid;grid-template-columns:28px 1fr;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #e5e5e7}.jr-stop-row:first-of-type{border-top:0}.jr-stop-number{width:26px;height:26px;border:2px solid #09090a;border-radius:50%;display:grid;place-items:center;background:#fff;color:#09090a;font-size:9px;font-weight:850}.jr-stop-row.board .jr-stop-number{background:#09090a;color:#fff}.jr-stop-copy strong,.jr-stop-copy small{display:block}.jr-stop-copy strong{font-size:11px}.jr-stop-copy small{color:#77787c;font-size:9px;margin-top:1px}.jr-map-shield{position:absolute;inset:0;z-index:700;background:transparent;pointer-events:auto;touch-action:none;cursor:default}.jr-content{overflow:auto;-webkit-overflow-scrolling:touch}.jr-card{width:100%;border:0;border-bottom:10px solid #f0f1f2;background:#fff;color:#09090a;text-align:left;padding:14px 22px}.jr-card.active{background:#fafcfc}.jr-card-top{display:flex;align-items:flex-start;justify-content:space-between}.jr-card-time{font-size:28px;font-weight:520;letter-spacing:-1px}.jr-card-cost{color:#77787c;font-size:13px}.jr-range{margin-top:4px;font-size:14px}.jr-steps{display:flex;align-items:center;gap:7px;margin-top:11px;flex-wrap:wrap}.jr-step{display:inline-flex;align-items:center;gap:4px;border-radius:7px;background:#f0f0f1;padding:5px 7px;font-size:11px;font-weight:730}.jr-line{background:#09090a;color:#fff;font-size:12px}.jr-step-icon{width:18px;height:18px;display:inline-block;background-repeat:no-repeat;background-position:center;background-size:contain}.jr-step-icon.walk{background-image:url('assets/elma-mode-walk-3d-mono.png?v=20260901-mono2')}.jr-step-icon.bus{background-image:url('assets/elma-mode-bus-3d-mono.png?v=20260901-mono2')}.jr-muted{margin-top:9px;color:#6c6d72;font-size:12px;line-height:1.4}.jr-empty{padding:25px 22px;color:#77787c}.jr-empty b{display:block;color:#202024;font-size:15px;margin-bottom:13px}.jr-map-link{display:inline-flex;align-items:center;min-height:40px;border-radius:13px;background:#09090a;color:#fff!important;text-decoration:none;padding:0 14px;font-size:12px;font-weight:780}.jr-attribution{padding:10px 22px 24px;color:#818187;font-size:9px}.jr-attribution a{color:inherit}.jr-direct-title{margin:0 0 13px;color:#55565a;font-size:17px}.jr-details{font-size:14px;line-height:1.55}.jr-details b{font-size:27px;font-weight:520}@media(max-width:390px){.jr-sheet{max-height:min(58dvh,540px);border-radius:28px 28px 0 0}.jr-head{padding-left:18px;padding-right:18px}.jr-head h2{font-size:23px}.jr-circle{width:39px;height:39px}.jr-card{padding:16px 18px}.jr-modes{height:76px}}`;document.head.appendChild(style)
  }
  function showLoading(preferred='TRANSIT'){
    styles();sheet?.remove();sheet=document.createElement('section');sheet.id='elmaJourneyResults';sheet.className='jr-sheet';
    sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-live','polite');
    const modeName=preferred==='TRANSIT'?'toplu taşıma':preferred==='WALKING'?'yürüme':'araba';
    sheet.innerHTML=`<div class="jr-grab"></div><header class="jr-head"><h2>Rota hazırlanıyor</h2><button class="jr-circle" id="jrLoadingClose" type="button" aria-label="Kapat">×</button></header><div style="display:grid;place-items:center;flex:1;padding:30px;text-align:center"><div><div style="width:42px;height:42px;margin:0 auto 15px;border:4px solid #e3e3e5;border-top-color:#09090a;border-radius:50%;animation:jrSpin .8s linear infinite"></div><b style="font-size:16px">${modeName} rotası hesaplanıyor…</b></div></div>`;
    document.body.appendChild(sheet);const nav=$('#elmaMainNav');if(nav)nav.style.display='none';$('#jrLoadingClose').onclick=()=>window.elmaClearJourneyResults();
    if(!$('#jrLoadingAnimation')){const animation=document.createElement('style');animation.id='jrLoadingAnimation';animation.textContent='@keyframes jrSpin{to{transform:rotate(360deg)}}';document.head.appendChild(animation)}
  }
  function enableSheetDrag(node){
    const grab=node.querySelector('.jr-grab');if(!grab)return;let startY=0,startOffset=0,lastOffset=0,dragging=false;
    const toggle=()=>node.classList.toggle('collapsed');
    grab.onclick=()=>{if(!dragging)toggle();dragging=false};
    grab.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle()}};
    grab.onpointerdown=event=>{startY=event.clientY;startOffset=node.classList.contains('collapsed')?Math.max(0,node.offsetHeight-76):0;lastOffset=startOffset;dragging=false;node.style.transition='none';grab.setPointerCapture?.(event.pointerId)};
    grab.onpointermove=event=>{if(!grab.hasPointerCapture?.(event.pointerId))return;lastOffset=Math.max(0,startOffset+event.clientY-startY);if(Math.abs(event.clientY-startY)>5)dragging=true;node.style.transform=`translateY(${lastOffset}px)`};
    const finish=event=>{if(!grab.hasPointerCapture?.(event.pointerId))return;grab.releasePointerCapture?.(event.pointerId);node.style.transition='';node.style.transform='';node.classList.toggle('collapsed',lastOffset>Math.max(72,node.offsetHeight*.32));setTimeout(()=>dragging=false,0)};
    grab.onpointerup=finish;grab.onpointercancel=finish;
  }
  function makeSheet(origin,destination,drive,walk,transit,preferred){
    styles();sheet?.remove();sheet=document.createElement('section');sheet.id='elmaJourneyResults';sheet.className='jr-sheet';
    const now=new Date(),transitRange=transit?interval(now,transit.seconds):'',driveRange=drive?interval(now,drive.seconds):'',walkRange=walk?interval(now,walk.seconds):'';
    const links={TRANSIT:mapsUrl(origin,destination,'TRANSIT'),DRIVING:mapsUrl(origin,destination,'DRIVING'),WALKING:mapsUrl(origin,destination,'WALKING')};
    const empty=(message,mode)=>`<div class="jr-empty"><b>${message}</b><a class="jr-map-link" href="${links[mode]}" target="_blank" rel="noopener">Google Maps'te aç ↗</a></div>`;
    const usesOsm=[drive,walk,transit?.accessRoute,transit?.exitRoute].some(route=>route?.source==='osm');
    const attribution=usesOsm?`<footer class="jr-attribution">Yaya rota verisi: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap yedek servisi</a></footer>`:`<footer class="jr-attribution">Yaya rota verisi: Google Maps</footer>`;
    const activeLink=links[preferred]||links.TRANSIT;
    const stopsAction=preferred==='TRANSIT'&&transit?`<button class="jr-action" id="jrStopsToggle" type="button"><b>≡</b><span>Duraklar</span></button>`:`<button class="jr-action" type="button" disabled><b>•</b><span>Rota</span></button>`;
    sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
    sheet.innerHTML=`<div class="jr-grab" role="button" tabindex="0" aria-label="Yolculuk özetini küçült veya aç"></div><header class="jr-head"><h2 id="jrTitle">Toplu taşıma</h2></header><div class="jr-actions"><a class="jr-action primary" id="jrNavigate" href="${activeLink}" target="_blank" rel="noopener"><b>↗</b><span>Başlat</span></a>${stopsAction}<button class="jr-action" id="jrShare" type="button"><b>⌁</b><span>Paylaş</span></button><button class="jr-action" id="jrRefresh" type="button"><b>↻</b><span>Yenile</span></button></div>${preferred==='TRANSIT'&&transit?`<div class="jr-stop-list" id="jrStops" hidden><b>1 Nolu Hat • Yolculuktaki duraklar</b>${transit.stopPoints.map((point,index)=>{const number=transit.board+index+1,kind=index===0?'Biniş durağı':index===transit.stopPoints.length-1?'İniş durağı':'Ara durak';return `<div class="jr-stop-row ${index===0?'board':index===transit.stopPoints.length-1?'alight':''}"><span class="jr-stop-number">${number}</span><span class="jr-stop-copy"><strong>${number}. Durak • ${kind}</strong><small>${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}</small></span></div>`}).join('')}</div>`:''}<main class="jr-content"><section class="jr-section" data-section="TRANSIT">${transit?`<button class="jr-card active" type="button" data-route-card="TRANSIT"><div class="jr-card-top"><span class="jr-card-time">${mins(transit)}</span><span class="jr-card-cost">Ücret bilgisi yakında</span></div><div class="jr-range" data-duration-seconds="${transit.seconds}">${transitRange}</div><div class="jr-steps"><span class="jr-step"><i class="jr-step-icon walk"></i>${Math.max(1,Math.round(transit.accessRoute.seconds/60))} dk.</span><span>›</span><span class="jr-step jr-line"><i class="jr-step-icon bus"></i>1 Nolu Hat</span><span>›</span><span class="jr-step"><i class="jr-step-icon walk"></i>${Math.max(1,Math.round(transit.exitRoute.seconds/60))} dk.</span></div><div class="jr-muted">${transit.board+1}. durakta bin • ${transit.stops} durak git • ${transit.alight+1}. durakta in</div></button>`:empty('Bu yolculuk için 1 nolu hattın gidiş yönü uygun değil.','TRANSIT')}</section><section class="jr-section" data-section="DRIVING" hidden>${drive?`<button class="jr-card active" type="button" data-route-card="DRIVING"><div class="jr-card-top"><span class="jr-card-time">${mins(drive)}</span><span class="jr-card-cost">${fmtMeters(drive.meters)}</span></div><div class="jr-range" data-duration-seconds="${drive.seconds}">${driveRange}</div><div class="jr-muted">${escapeHtml(drive.summary||'Yol ağı rotası')} üzerinden</div></button>`:empty('Araba rotası şu anda hesaplanamadı.','DRIVING')}</section><section class="jr-section" data-section="WALKING" hidden>${walk?`<button class="jr-card active" type="button" data-route-card="WALKING"><div class="jr-card-top"><span class="jr-card-time">${mins(walk)}</span><span class="jr-card-cost">${fmtMeters(walk.meters)}</span></div><div class="jr-range" data-duration-seconds="${walk.seconds}">${walkRange}</div><div class="jr-muted">Yaya yolları ve dönüşler takip edilir; rota düz çizgi değildir.</div></button>`:empty('Yürüme rotası şu anda hesaplanamadı.','WALKING')}</section>${attribution}</main>`;
    document.body.appendChild(sheet);const mainNav=$('#elmaMainNav');if(mainNav)mainNav.style.display='none';
    sheet.querySelectorAll('[data-route-card]').forEach(button=>button.onclick=()=>draw(button.dataset.routeCard));
    enableSheetDrag(sheet);
    $('#jrRefresh').onclick=()=>window.elmaShowJourneyResults(origin,destination,current.map,preferred);
    const stopsToggle=$('#jrStopsToggle'),stopsPanel=$('#jrStops');if(stopsToggle&&stopsPanel)stopsToggle.onclick=()=>{stopsPanel.hidden=!stopsPanel.hidden;stopsToggle.classList.toggle('primary',!stopsPanel.hidden);addTransitStopMarkers(current.map,transit,!stopsPanel.hidden)};
    $('#jrShare').onclick=async()=>{const text='ElmaGo yolculuğu: '+(destination.name||'hedef')+' • '+mins(preferred==='WALKING'?walk:preferred==='DRIVING'?drive:transit);if(navigator.share)try{await navigator.share({title:'ElmaGo yolculuğu',text,url:activeLink})}catch(e){}else try{await navigator.clipboard.writeText(text+' '+activeLink);alert('Yolculuk bilgisi kopyalandı.')}catch(e){}};
    draw(preferred);
  }
  window.elmaClearJourneyResults=()=>{activeRun++;clearOverlays();lockTransitMap(false);sheet?.remove();sheet=null;current=null;const nav=$('#elmaMainNav');if(nav)nav.style.display='grid'};
  window.elmaShowJourneyResults=async(origin,destination,map,preferred='TRANSIT')=>{
    document.activeElement?.blur();window.scrollTo(0,0);window.elmaClearJourneyResults();const run=activeRun;showLoading(preferred);
    try{
      let drive=null,walk=null,transit=null;
      if(preferred==='DRIVING')drive=await googleRoute(origin,destination,'DRIVING');
      else if(preferred==='WALKING')walk=await googleRoute(origin,destination,'WALKING');
      else transit=await transitRoute(origin,destination);
      if(run!==activeRun)return true;
      current={origin,destination,map,drive,walk,transit};makeSheet(origin,destination,drive,walk,transit,preferred);return true;
    }catch(error){
      console.error('Yolculuk sonuçları hazırlanamadı:',error);if(run!==activeRun)return true;
      current={origin,destination,map,drive:null,walk:null,transit:null};makeSheet(origin,destination,null,null,null,preferred);return true;
    }
  };
})();
