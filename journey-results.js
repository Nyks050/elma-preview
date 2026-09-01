(()=>{
  if(window.__elmaJourneyResultsMounted)return;
  window.__elmaJourneyResultsMounted=true;
  let overlays=[],stopOverlays=[],sheet=null,current=null,activeRun=0,routeAnimation=0;
  const $=selector=>document.querySelector(selector);
  const pt=value=>Array.isArray(value)?{lat:value[0],lng:value[1]}:{lat:value.lat,lng:value.lon??value.lng};
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  const fmtTime=date=>new Intl.DateTimeFormat('tr-TR',{hour:'2-digit',minute:'2-digit'}).format(date);
  const fmtMeters=value=>value<1000?Math.max(10,Math.round(value/10)*10)+' m':(value/1000).toFixed(1).replace('.',',')+' km';
  function mapsUrl(origin,destination,mode){const from=pt(origin),to=pt(destination),travel=mode==='WALKING'?'walking':mode==='TRANSIT'?'transit':'driving';return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from.lat+','+from.lng)+'&destination='+encodeURIComponent(to.lat+','+to.lng)+'&travelmode='+travel}
  function distance(a,b){const r=Math.PI/180,p1=a.lat*r,p2=b.lat*r,dp=(b.lat-a.lat)*r,dl=(b.lng-a.lng)*r,h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 12742000*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))}
  function clearStopOverlays(){stopOverlays.forEach(item=>item.setMap(null));stopOverlays=[]}
  function clearOverlays(){if(routeAnimation)cancelAnimationFrame(routeAnimation);routeAnimation=0;overlays.forEach(item=>item.setMap(null));overlays=[];clearStopOverlays()}
  function lockTransitMap(locked){
    const wrapper=document.querySelector('.mapwrap');if(!wrapper)return;
    wrapper.classList.toggle('jr-map-click-locked',locked);
    if(!wrapper.dataset.jrClickBlocker){
      const block=event=>{if(wrapper.classList.contains('jr-map-click-locked')){event.preventDefault();event.stopPropagation()}};
      wrapper.addEventListener('click',block,true);wrapper.addEventListener('dblclick',block,true);wrapper.addEventListener('contextmenu',block,true);wrapper.dataset.jrClickBlocker='1';
    }
    current?.map?.setOptions?.({clickableIcons:!locked,gestureHandling:'greedy'});
  }
  function addLine(map,path,kind='solid'){
    if(!path?.length)return;
    const options=kind==='walk'?{strokeOpacity:0,strokeWeight:0,icons:[{icon:{path:'M 0,-1 0,1',strokeColor:'#050505',strokeOpacity:1,strokeWeight:4,scale:2.1},offset:'0',repeat:'13px'}]}:{strokeColor:'#050505',strokeOpacity:1,strokeWeight:6};
    const line=new google.maps.Polyline({map,path,clickable:false,zIndex:5,...options});overlays.push(line);
  }
  function lineOptions(kind){return kind==='walk'?{strokeOpacity:0,strokeWeight:0,icons:[{icon:{path:'M 0,-1 0,1',strokeColor:'#050505',strokeOpacity:1,strokeWeight:4,scale:2.1},offset:'0',repeat:'13px'}]}:{strokeColor:'#050505',strokeOpacity:1,strokeWeight:6}}
  function animateLines(map,segments){
    if(routeAnimation)cancelAnimationFrame(routeAnimation);routeAnimation=0;
    const prepared=segments.filter(item=>item.path?.length>1).map(item=>{const lengths=[0];for(let i=1;i<item.path.length;i++)lengths.push(lengths[i-1]+distance(pt(item.path[i-1]),pt(item.path[i])));const line=new google.maps.Polyline({map,path:[],clickable:false,zIndex:5,...lineOptions(item.kind)});overlays.push(line);return {...item,lengths,total:lengths.at(-1),line}});
    const total=prepared.reduce((sum,item)=>sum+item.total,0)||1,start=performance.now(),duration=Math.min(5200,Math.max(2600,total/7));
    const frame=now=>{const target=Math.min(1,(now-start)/duration)*total;let passed=0;for(const item of prepared){const local=Math.max(0,Math.min(item.total,target-passed));passed+=item.total;if(local<=0){item.line.setPath([]);continue}if(local>=item.total){item.line.setPath(item.path);continue}let index=1;while(index<item.lengths.length&&item.lengths[index]<local)index++;const before=item.path[index-1],after=item.path[index],span=item.lengths[index]-item.lengths[index-1]||1,ratio=(local-item.lengths[index-1])/span;item.line.setPath([...item.path.slice(0,index),{lat:before.lat+(after.lat-before.lat)*ratio,lng:before.lng+(after.lng-before.lng)*ratio}])}if(target<total)routeAnimation=requestAnimationFrame(frame);else routeAnimation=0};
    routeAnimation=requestAnimationFrame(frame);
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
    let best=null,prefix=[0];
    for(let index=1;index<stops.length;index++)prefix.push(prefix[index-1]+distance(pt(stops[index-1]),pt(stops[index])));
    for(let board=0;board<stops.length-1;board++)for(let alight=board+1;alight<stops.length;alight++){
      const access=distance(pt(origin),pt(stops[board])),exit=distance(pt(stops[alight]),pt(destination)),busMeters=prefix[alight]-prefix[board],estimatedSeconds=access/1.22+busMeters/8.4+exit/1.22,score=access+exit;
      if(!best||estimatedSeconds<best.estimatedSeconds)best={board,alight,access,exit,busMeters,estimatedSeconds,score};
    }
    return best;
  }
  async function lineData(){
    for(let attempt=0;attempt<40;attempt++){
      if(window.ELMA_LINE_1_ROUTE&&window.ELMA_LINE_6_ROUTE)return window.ELMA_TRANSIT_LINES||[];
      await new Promise(resolve=>setTimeout(resolve,50));
    }
    return window.ELMA_TRANSIT_LINES||[];
  }
  async function transitBusRoute(positions){
    const path=[];let seconds=0,meters=0;
    for(let start=0;start<positions.length-1;start+=7){
      const segment=positions.slice(start,Math.min(start+8,positions.length));
      const result=await new google.maps.DirectionsService().route({origin:pt(segment[0]),destination:pt(segment.at(-1)),waypoints:segment.slice(1,-1).map(stop=>({location:pt(stop),stopover:true})),optimizeWaypoints:false,travelMode:google.maps.TravelMode.DRIVING,region:'TR',language:'tr'});
      const route=result.routes?.[0];if(!route)throw new Error('Otobüs yol parçası oluşturulamadı');
      const segmentPath=detailedPath(route);if(path.length&&segmentPath.length)segmentPath.shift();path.push(...segmentPath);
      route.legs?.forEach(leg=>{seconds+=leg.duration?.value||0;meters+=leg.distance?.value||0});
    }
    return{path,seconds,meters};
  }
  async function transitRoute(origin,destination){
    const lines=await lineData();if(!lines.length)return null;
    let selected=null;
    for(const line of lines){const trip=bestTransit(origin,destination,line.stops);if(trip&&(!selected||trip.estimatedSeconds<selected.estimatedSeconds))selected={...trip,lineData:line}}
    if(!selected||selected.access>3000||selected.exit>3000)return null;
    const trip=selected,data=selected.lineData;
    const directMeters=distance(pt(origin),pt(destination)),maxStopWalk=Math.min(850,Math.max(450,directMeters*.38));
    if(trip.access>maxStopWalk||trip.exit>maxStopWalk||trip.score>Math.min(1450,directMeters*.62))return null;
    const boardPoint=pt(data.stops[trip.board]),alightPoint=pt(data.stops[trip.alight]);
    const [access,exit]=await Promise.all([googleRoute(origin,boardPoint,'WALKING'),googleRoute(alightPoint,destination,'WALKING')]);
    if(!access||!exit)return null;
    const stopSlice=data.stops.slice(trip.board,trip.alight+1),bus=await transitBusRoute(stopSlice),busPath=bus.path,stops=trip.alight-trip.board,busSeconds=Math.max(180,bus.seconds||stops*105),seconds=access.seconds+busSeconds+exit.seconds;
    if(stops<2||seconds>=directMeters/1.22*1.08)return null;
    return {mode:'TRANSIT',...trip,line:data.line,lineName:data.name,direction:data.direction,accessRoute:access,exitRoute:exit,busPath,stopPoints:stopSlice.map(pt),stops,seconds,meters:access.meters+bus.meters+exit.meters,busSeconds};
  }
  function addTransitStopMarkers(map,transit,showAll=false){
    clearStopOverlays();if(!transit?.stopPoints?.length)return;
    transit.stopPoints.forEach((position,offset)=>{
      const isBoard=offset===0,isAlight=offset===transit.stopPoints.length-1;if(!showAll&&!isBoard&&!isAlight)return;
      const number=transit.board+offset+1,marker=new google.maps.Marker({map,position,clickable:false,zIndex:20+offset,title:'',label:{text:String(number),color:isBoard?'#fff':'#09090a',fontSize:'9px',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:isBoard||isAlight?12:9,fillColor:isBoard?'#09090a':'#fff',fillOpacity:1,strokeColor:'#09090a',strokeOpacity:1,strokeWeight:2.5}});stopOverlays.push(marker);
    });
  }
  function fit(map,paths,maxZoom=14){const bounds=new google.maps.LatLngBounds();paths.flat().forEach(point=>bounds.extend(point));if(!bounds.isEmpty()){google.maps.event.addListenerOnce(map,'idle',()=>{if((map.getZoom?.()||0)>maxZoom)map.setZoom(maxZoom)});map.fitBounds(bounds,{top:64,right:44,bottom:82,left:44})}}
  function draw(mode){
    if(!current)return;clearOverlays();const {map,drive,walk,transit}=current;
    lockTransitMap(mode==='TRANSIT');
    if(mode==='TRANSIT'&&transit){fit(map,[transit.accessRoute.path,transit.busPath,transit.exitRoute.path],13);animateLines(map,[{path:transit.accessRoute.path,kind:'walk'},{path:transit.busPath,kind:'solid'},{path:transit.exitRoute.path,kind:'walk'}]);addTransitStopMarkers(map,transit,false)}
    else{const route=mode==='WALKING'?walk:drive;if(route){fit(map,[route.path],14);animateLines(map,[{path:route.path,kind:mode==='WALKING'?'walk':'solid'}])}}
    sheet?.querySelectorAll('.jr-section').forEach(section=>section.hidden=section.dataset.section!==mode);
    const title=sheet?.querySelector('#jrTitle');if(title)title.textContent=mode==='TRANSIT'?'Toplu taşıma':mode==='WALKING'?'Yürüme':'Araba';
  }
  function mins(route){return route?Math.max(1,Math.round(route.seconds/60))+' dk.':'—'}
  function interval(start,seconds){const end=new Date(start.getTime()+seconds*1000);return fmtTime(start)+' – '+fmtTime(end)}
  function styles(){
    if($('#elmaJourneyResultsStyle'))return;const style=document.createElement('style');style.id='elmaJourneyResultsStyle';style.textContent=`.jr-sheet{position:fixed;z-index:910;left:0;right:0;bottom:0;max-width:560px;height:auto;max-height:min(48dvh,480px);margin:auto;border-radius:34px 34px 0 0;background:#fff;color:#09090a;box-shadow:0 -12px 44px #0003;font-family:Inter,-apple-system,sans-serif;overflow:hidden;display:flex;flex-direction:column;transition:transform .28s cubic-bezier(.22,.8,.24,1)}.jr-sheet.collapsed{transform:translateY(calc(100% - 24px))}.jr-grab{position:relative;width:88px;height:24px;flex:0 0 24px;margin:0 auto;cursor:grab;touch-action:none;background:transparent}.jr-grab:after{content:'';position:absolute;left:17px;top:9px;width:54px;height:6px;border-radius:99px;background:#bfc0c3}.jr-head{display:flex;align-items:center;padding:7px 22px 14px}.jr-head h2{flex:1;margin:0;font-size:24px;letter-spacing:-.7px}.jr-circle{width:43px;height:43px;border:0;border-radius:50%;background:#f1f1f2;margin-left:8px;color:#09090a;display:grid;place-items:center;font-size:20px}.jr-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:0 16px 12px;border-bottom:1px solid #ececee}.jr-action{min-width:0;height:48px;border:0;border-radius:15px;background:#f0f0f1;color:#17171a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-decoration:none;font-size:10px;font-weight:760}.jr-action b{font-size:17px;line-height:1}.jr-action.primary{background:#09090a;color:#fff}.jr-stop-list{max-height:190px;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;margin:0 16px 12px;border:1px solid #e0e0e2;border-radius:15px;background:#f7f7f8;padding:10px 12px;font-size:11px;line-height:1.55;scrollbar-width:thin}.jr-stop-list[hidden]{display:none}.jr-stop-list b{display:block;font-size:12px;margin-bottom:6px}.jr-stop-row{display:grid;grid-template-columns:28px 1fr;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #e5e5e7}.jr-stop-row:first-of-type{border-top:0}.jr-stop-number{width:26px;height:26px;border:2px solid #09090a;border-radius:50%;display:grid;place-items:center;background:#fff;color:#09090a;font-size:9px;font-weight:850}.jr-stop-row.board .jr-stop-number{background:#09090a;color:#fff}.jr-stop-copy strong,.jr-stop-copy small{display:block}.jr-stop-copy strong{font-size:11px}.jr-stop-copy small{color:#77787c;font-size:9px;margin-top:1px}.jr-content{overflow:auto;-webkit-overflow-scrolling:touch}.jr-card{width:100%;border:0;border-bottom:10px solid #f0f1f2;background:#fff;color:#09090a;text-align:left;padding:14px 22px}.jr-card.active{background:#fafcfc}.jr-card-top{display:flex;align-items:flex-start;justify-content:space-between}.jr-card-time{font-size:28px;font-weight:520;letter-spacing:-1px}.jr-card-cost{color:#77787c;font-size:13px}.jr-range{margin-top:4px;font-size:14px}.jr-steps{display:flex;align-items:center;gap:7px;margin-top:11px;flex-wrap:wrap}.jr-step{display:inline-flex;align-items:center;gap:4px;border-radius:7px;background:#f0f0f1;padding:5px 7px;font-size:11px;font-weight:730}.jr-line{background:#09090a;color:#fff;font-size:12px}.jr-step-icon{width:18px;height:18px;display:inline-block;background-repeat:no-repeat;background-position:center;background-size:contain}.jr-step-icon.walk{background-image:url('assets/elma-mode-walk-3d-mono.png?v=20260901-mono2')}.jr-step-icon.bus{background-image:url('assets/elma-mode-bus-3d-mono.png?v=20260901-mono2')}.jr-muted{margin-top:9px;color:#6c6d72;font-size:12px;line-height:1.4}.jr-empty{padding:25px 22px;color:#77787c}.jr-empty b{display:block;color:#202024;font-size:15px;margin-bottom:13px}.jr-transit-unavailable{text-align:center;padding:24px 24px 28px}.jr-transit-unavailable b{margin:14px 0 6px;font-size:16px}.jr-transit-unavailable small{display:block;color:#77787c;font-size:11px;line-height:1.5}.jr-unavailable-line{display:block;width:100%;height:5px;border-radius:99px;background:repeating-linear-gradient(90deg,#09090a 0 13px,transparent 13px 22px)}.jr-map-link{display:inline-flex;align-items:center;min-height:40px;border-radius:13px;background:#09090a;color:#fff!important;text-decoration:none;padding:0 14px;font-size:12px;font-weight:780}.jr-attribution{padding:10px 22px 24px;color:#818187;font-size:9px}.jr-attribution a{color:inherit}.jr-direct-title{margin:0 0 13px;color:#55565a;font-size:17px}.jr-details{font-size:14px;line-height:1.55}.jr-details b{font-size:27px;font-weight:520}@media(max-width:390px){.jr-sheet{max-height:min(50dvh,480px);border-radius:28px 28px 0 0}.jr-head{padding-left:18px;padding-right:18px}.jr-head h2{font-size:23px}.jr-circle{width:39px;height:39px}.jr-card{padding:16px 18px}.jr-modes{height:76px}}`;document.head.appendChild(style)
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
    grab.onpointerdown=event=>{startY=event.clientY;startOffset=node.classList.contains('collapsed')?Math.max(0,node.offsetHeight-24):0;lastOffset=startOffset;dragging=false;node.style.transition='none';grab.setPointerCapture?.(event.pointerId)};
    grab.onpointermove=event=>{if(!grab.hasPointerCapture?.(event.pointerId))return;lastOffset=Math.max(0,startOffset+event.clientY-startY);if(Math.abs(event.clientY-startY)>5)dragging=true;node.style.transform=`translateY(${lastOffset}px)`};
    const finish=event=>{if(!grab.hasPointerCapture?.(event.pointerId))return;grab.releasePointerCapture?.(event.pointerId);node.style.transition='';node.style.transform='';node.classList.toggle('collapsed',lastOffset>Math.max(72,node.offsetHeight*.32));setTimeout(()=>dragging=false,0)};
    grab.onpointerup=finish;grab.onpointercancel=finish;
  }
  function makeSheet(origin,destination,drive,walk,transit,preferred){
    styles();sheet?.remove();sheet=document.createElement('section');sheet.id='elmaJourneyResults';sheet.className='jr-sheet';
    const now=new Date(),transitRange=transit?interval(now,transit.seconds):'',driveRange=drive?interval(now,drive.seconds):'',walkRange=walk?interval(now,walk.seconds):'';
    const links={TRANSIT:mapsUrl(origin,destination,'TRANSIT'),DRIVING:mapsUrl(origin,destination,'DRIVING'),WALKING:mapsUrl(origin,destination,'WALKING')};
    const empty=(message,mode)=>mode==='TRANSIT'?`<div class="jr-empty jr-transit-unavailable"><span class="jr-unavailable-line" aria-hidden="true"></span><b>Bu bölgede toplu taşıma mevcut değil</b><small>1 veya 6 Nolu Hat durakları yürüyüş mesafesinin dışında ya da yolculuğu gereksiz yere uzatıyor.</small></div>`:`<div class="jr-empty"><b>${message}</b><a class="jr-map-link" href="${links[mode]}" target="_blank" rel="noopener">Google Maps'te aç ↗</a></div>`;
    const attribution='';
    const activeLink=links[preferred]||links.TRANSIT;
    const stopsAction=preferred==='TRANSIT'&&transit?`<button class="jr-action" id="jrStopsToggle" type="button"><b>≡</b><span>Duraklar</span></button>`:`<button class="jr-action" type="button" disabled><b>•</b><span>Rota</span></button>`;
    sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
    sheet.innerHTML=`<div class="jr-grab" role="button" tabindex="0" aria-label="Yolculuk özetini küçült veya aç"></div><header class="jr-head"><h2 id="jrTitle">Toplu taşıma</h2><button class="jr-circle" id="jrClose" type="button" aria-label="Ulaşım şeklini yeniden seç">×</button></header><div class="jr-actions">${stopsAction}<button class="jr-action" id="jrShare" type="button"><b>⌁</b><span>Paylaş</span></button><button class="jr-action" id="jrRefresh" type="button"><b>↻</b><span>Yenile</span></button></div>${preferred==='TRANSIT'&&transit?`<div class="jr-stop-list" id="jrStops" hidden><b>${escapeHtml(transit.lineName)} • ${escapeHtml(transit.direction)} • Yolculuktaki duraklar</b>${transit.stopPoints.map((point,index)=>{const number=transit.board+index+1,kind=index===0?'Biniş durağı':index===transit.stopPoints.length-1?'İniş durağı':'Ara durak';return `<div class="jr-stop-row ${index===0?'board':index===transit.stopPoints.length-1?'alight':''}"><span class="jr-stop-number">${number}</span><span class="jr-stop-copy"><strong>${number}. Durak • ${kind}</strong><small>${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}</small></span></div>`}).join('')}</div>`:''}<main class="jr-content"><section class="jr-section" data-section="TRANSIT">${transit?`<button class="jr-card active" type="button" data-route-card="TRANSIT"><div class="jr-card-top"><span class="jr-card-time">${mins(transit)}</span><span class="jr-card-cost">Ücret bilgisi yakında</span></div><div class="jr-range" data-duration-seconds="${transit.seconds}">${transitRange}</div><div class="jr-steps"><span class="jr-step"><i class="jr-step-icon walk"></i>${Math.max(1,Math.round(transit.accessRoute.seconds/60))} dk.</span><span>›</span><span class="jr-step jr-line"><i class="jr-step-icon bus"></i>${escapeHtml(transit.lineName)}</span><span>›</span><span class="jr-step"><i class="jr-step-icon walk"></i>${Math.max(1,Math.round(transit.exitRoute.seconds/60))} dk.</span></div><div class="jr-muted">${transit.board+1}. durakta bin • ${transit.stops} durak git • ${transit.alight+1}. durakta in • ${escapeHtml(transit.direction)}</div></button>`:empty('Bu yolculuk için uygun bir otobüs yönü bulunamadı.','TRANSIT')}</section><section class="jr-section" data-section="DRIVING" hidden>${drive?`<button class="jr-card active" type="button" data-route-card="DRIVING"><div class="jr-card-top"><span class="jr-card-time">${mins(drive)}</span><span class="jr-card-cost">${fmtMeters(drive.meters)}</span></div><div class="jr-range" data-duration-seconds="${drive.seconds}">${driveRange}</div><div class="jr-muted">${escapeHtml(drive.summary||'Yol ağı rotası')} üzerinden</div></button>`:empty('Araba rotası şu anda hesaplanamadı.','DRIVING')}</section><section class="jr-section" data-section="WALKING" hidden>${walk?`<button class="jr-card active" type="button" data-route-card="WALKING"><div class="jr-card-top"><span class="jr-card-time">${mins(walk)}</span><span class="jr-card-cost">${fmtMeters(walk.meters)}</span></div><div class="jr-range" data-duration-seconds="${walk.seconds}">${walkRange}</div><div class="jr-muted">Yaya yolları ve dönüşler takip edilir; rota düz çizgi değildir.</div></button>`:empty('Yürüme rotası şu anda hesaplanamadı.','WALKING')}</section>${attribution}</main>`;
    document.body.appendChild(sheet);const mainNav=$('#elmaMainNav');if(mainNav)mainNav.style.display='none';
    sheet.querySelectorAll('[data-route-card]').forEach(button=>button.onclick=()=>draw(button.dataset.routeCard));
    enableSheetDrag(sheet);
    $('#jrClose').onclick=()=>{window.elmaClearJourneyResults();window.elmaOpenSearch?.()};
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
