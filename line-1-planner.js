(()=>{
  if(window.__elmaLine1PlannerMounted)return;
  window.__elmaLine1PlannerMounted=true;

  const fallbackStops=[[40.6686539,35.8371237],[40.6686671,35.8381533],[40.6682327,35.842059],[40.6678584,35.8450148],[40.6675328,35.8479626],[40.6663284,35.849293],[40.6657343,35.8473993],[40.6645421,35.8445079],[40.6636428,35.8432634],[40.6624994,35.8421771],[40.6612437,35.8411844],[40.6591601,35.8395778],[40.6574652,35.8382206],[40.6558653,35.8370258],[40.6539811,35.836256],[40.6523328,35.8353521],[40.6513743,35.8331741],[40.6504688,35.8300239],[40.6498635,35.8270959],[40.649781,35.8247406],[40.6499052,35.8222918],[40.6499683,35.8196096],[40.6491258,35.8167074],[40.6474489,35.8136175],[40.645021,35.8110077],[40.6427233,35.8079312],[40.6393305,35.8082263],[40.6206543,35.8188991],[40.6176941,35.814688],[40.6132941,35.8128561],[40.6082607,35.8120729],[40.601895,35.8096267],[40.5959719,35.8044012],[40.5637318,35.7900134],[40.564987,35.7927386]];
  let overlays=[];

  function addStyles(){
    if(document.getElementById('elmaLine1PlannerStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLine1PlannerStyle';
    style.textContent=`.elma-trip-sheet{position:fixed;z-index:875;left:12px;right:12px;bottom:calc(96px + env(safe-area-inset-bottom));max-width:496px;margin:auto;border:1px solid #d9d9dc;border-radius:26px;background:#fff;color:#09090a;box-shadow:0 16px 44px #0003;padding:17px;font-family:Inter,-apple-system,sans-serif}.elma-trip-head{display:flex;align-items:flex-start;gap:12px}.elma-trip-badge{width:45px;height:45px;flex:0 0 45px;border-radius:14px;background:#09090a;color:#fff;display:grid;place-items:center;font-size:21px;font-weight:900}.elma-trip-title{min-width:0;flex:1}.elma-trip-title b{display:block;font-size:17px;line-height:22px}.elma-trip-title small{display:block;margin-top:2px;color:#67676c;font-size:11px}.elma-trip-close{width:34px;height:34px;border:0;border-radius:50%;background:#f0f0f2;color:#09090a;font-size:20px}.elma-trip-steps{margin-top:14px;border-top:1px solid #ececee}.elma-trip-step{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;padding:10px 2px;border-bottom:1px solid #eeeeef}.elma-trip-step:last-child{border-bottom:0}.elma-trip-dot{width:25px;height:25px;border-radius:50%;background:#f0f0f2;display:grid;place-items:center;font-size:12px;font-weight:850}.elma-trip-step.bus .elma-trip-dot{background:#09090a;color:#fff}.elma-trip-step b{display:block;font-size:12px;line-height:16px}.elma-trip-step small{display:block;margin-top:1px;color:#737378;font-size:10px;line-height:14px}.elma-trip-warning{padding:3px 1px 0;color:#777a80;font-size:9px;line-height:13px}.elma-trip-sheet.unavailable .elma-trip-badge{background:#dadadd;color:#555}.elma-trip-sheet.unavailable .elma-trip-steps{display:none}@media(max-width:390px){.elma-trip-sheet{left:9px;right:9px;bottom:calc(91px + env(safe-area-inset-bottom));padding:14px;border-radius:22px}.elma-trip-step{padding:8px 1px}}`;
    document.head.appendChild(style);
  }

  function distance(a,b){
    const rad=Math.PI/180,lat1=a.lat*rad,lat2=b.lat*rad,dLat=(b.lat-a.lat)*rad,dLon=(b.lng-a.lng)*rad;
    const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
  }
  const point=value=>({lat:value[0],lng:value[1]});
  const meters=value=>value<1000?Math.max(10,Math.round(value/10)*10)+' m':(value/1000).toFixed(1).replace('.',',')+' km';

  function bestJourney(origin,destination,stops){
    let best=null;
    for(let board=0;board<stops.length-1;board++)for(let alight=board+1;alight<stops.length;alight++){
      const walkStart=distance({lat:origin.lat,lng:origin.lon},point(stops[board]));
      const walkEnd=distance(point(stops[alight]),{lat:destination.lat,lng:destination.lon});
      const score=walkStart+walkEnd;
      if(!best||score<best.score)best={board,alight,walkStart,walkEnd,score};
    }
    return best;
  }

  function closestRouteIndex(route,stop,start=0){
    let best=start,bestDistance=Infinity;
    for(let index=start;index<route.length;index++){
      const current=distance(point(route[index]),point(stop));
      if(current<bestDistance){bestDistance=current;best=index}
    }
    return best;
  }

  function addPolyline(map,path,options){
    const line=new google.maps.Polyline({map,path,clickable:false,...options});
    overlays.push(line);
    return line;
  }

  async function walkingPath(from,to){
    try{
      const result=await new google.maps.DirectionsService().route({origin:from,destination:to,travelMode:google.maps.TravelMode.WALKING,region:'TR',language:'tr'});
      const leg=result.routes?.[0]?.legs?.[0];
      return {path:result.routes?.[0]?.overview_path||[from,to],meters:leg?.distance?.value,duration:leg?.duration?.value};
    }catch(error){return {path:[from,to]}}
  }

  function removeSheet(){document.getElementById('elmaLine1Trip')?.remove()}
  window.elmaClearLine1Plan=()=>{overlays.forEach(item=>item.setMap(null));overlays=[];removeSheet()};

  function showUnavailable(message){
    addStyles();removeSheet();
    const sheet=document.createElement('section');
    sheet.id='elmaLine1Trip';sheet.className='elma-trip-sheet unavailable';
    sheet.innerHTML=`<div class="elma-trip-head"><span class="elma-trip-badge">1</span><span class="elma-trip-title"><b>1 numaralı hat uygun değil</b><small></small></span><button class="elma-trip-close" type="button" aria-label="Kapat">×</button></div>`;
    sheet.querySelector('small').textContent=message;
    sheet.querySelector('button').onclick=removeSheet;
    document.body.appendChild(sheet);
  }

  function showJourney(journey,walkStart,walkEnd){
    addStyles();removeSheet();
    const stopCount=journey.alight-journey.board;
    const walkSeconds=(walkStart.duration||journey.walkStart/1.3)+(walkEnd.duration||journey.walkEnd/1.3);
    const busSeconds=Math.max(180,stopCount*105);
    const totalMinutes=Math.max(1,Math.round((walkSeconds+busSeconds)/60));
    const sheet=document.createElement('section');
    sheet.id='elmaLine1Trip';sheet.className='elma-trip-sheet';
    sheet.innerHTML=`<div class="elma-trip-head"><span class="elma-trip-badge">1</span><span class="elma-trip-title"><b>1 numaralı otobüs</b><small>Yaklaşık ${totalMinutes} dk • Aktarmasız</small></span><button class="elma-trip-close" type="button" aria-label="Kapat">×</button></div><div class="elma-trip-steps"><div class="elma-trip-step"><span class="elma-trip-dot">↗</span><span><b>${meters(walkStart.meters||journey.walkStart)} yürü</b><small>${journey.board+1}. durağa git</small></span></div><div class="elma-trip-step bus"><span class="elma-trip-dot">1</span><span><b>1 numaralı otobüse bin</b><small>${journey.board+1}. duraktan ${journey.alight+1}. durağa • ${stopCount} durak</small></span></div><div class="elma-trip-step"><span class="elma-trip-dot">↓</span><span><b>${journey.alight+1}. durakta in</b><small>Hedefe ${meters(walkEnd.meters||journey.walkEnd)} yürü</small></span></div></div><div class="elma-trip-warning">Deneme sürümü: Şimdilik yalnızca 1 numaralı hattın gidiş yönü hesaplanır.</div>`;
    sheet.querySelector('button').onclick=removeSheet;
    document.body.appendChild(sheet);
  }

  window.elmaPlanLine1=async(origin,destination,map)=>{
    const data=window.ELMA_LINE_1_ROUTE||{stops:fallbackStops,route:fallbackStops};
    const journey=bestJourney(origin,destination,data.stops);
    if(!journey)return false;
    if(journey.walkStart>3000||journey.walkEnd>3000){
      showUnavailable('Başlangıç veya hedef 1 numaralı hattın gidiş güzergâhına çok uzak.');
      return true;
    }
    const boardPoint=point(data.stops[journey.board]),alightPoint=point(data.stops[journey.alight]);
    const startPoint={lat:origin.lat,lng:origin.lon},endPoint={lat:destination.lat,lng:destination.lon};
    const [walkStart,walkEnd]=await Promise.all([walkingPath(startPoint,boardPoint),walkingPath(alightPoint,endPoint)]);
    addPolyline(map,walkStart.path,{strokeColor:'#777a80',strokeOpacity:.8,strokeWeight:4,icons:[{icon:{path:'M 0,-1 0,1',strokeOpacity:1,scale:2},offset:'0',repeat:'12px'}]});
    let fromIndex=closestRouteIndex(data.route,data.stops[journey.board]);
    let toIndex=closestRouteIndex(data.route,data.stops[journey.alight],fromIndex);
    addPolyline(map,data.route.slice(fromIndex,toIndex+1).map(point),{strokeColor:'#050506',strokeOpacity:1,strokeWeight:7,zIndex:5});
    addPolyline(map,walkEnd.path,{strokeColor:'#777a80',strokeOpacity:.8,strokeWeight:4,icons:[{icon:{path:'M 0,-1 0,1',strokeOpacity:1,scale:2},offset:'0',repeat:'12px'}]});
    const bounds=new google.maps.LatLngBounds();
    [...walkStart.path,...data.route.slice(fromIndex,toIndex+1).map(point),...walkEnd.path].forEach(item=>bounds.extend(item));
    map.fitBounds(bounds,70);
    showJourney(journey,walkStart,walkEnd);
    return true;
  };
})();
