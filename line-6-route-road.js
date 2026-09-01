(()=>{
  if(window.__elmaLine6RouteMounted)return;
  window.__elmaLine6RouteMounted=true;
  const stops=[[40.6509073,35.7937144],[40.6496713,35.7953616],[40.6498748,35.7958499],[40.6505504,35.7977596],[40.6510022,35.799656],[40.6518446,35.8012573],[40.6528886,35.8036471],[40.6549682,35.8051076],[40.6551016,35.8085505],[40.65373,35.810204],[40.6529848,35.8126388],[40.6502092,35.813002],[40.6474741,35.8136941],[40.6450238,35.8109662],[40.6427973,35.8079917],[40.6375686,35.8087695],[40.6198218,35.8185006],[40.6174031,35.814268],[40.607308,35.8118447],[40.6044503,35.8110975],[40.6018431,35.8095904],[40.6017107,35.8098962],[40.6045149,35.811527],[40.6067489,35.8120597],[40.6026047,35.8190569],[40.6058272,35.814206],[40.6074148,35.8122048],[40.6178206,35.8153746],[40.6203356,35.819112],[40.6327046,35.8138447],[40.646188,35.8111236],[40.6478685,35.8097459],[40.6506649,35.8070686],[40.6552399,35.8086085],[40.6506649,35.8070686],[40.6552399,35.8086085],[40.6558426,35.8063643],[40.6544141,35.8045297],[40.6529116,35.803455],[40.6520203,35.8014058],[40.6509621,35.7990991],[40.6506956,35.798104],[40.6500281,35.7960199],[40.6497452,35.795285],[40.6493225,35.7908953]];
  const outboundStops=stops.slice(0,25),returnStops=stops.slice(24);
  const routeChunks=[
    {direction:'Gidiş',color:'#050506',stops:stops.slice(0,10)},
    {direction:'Gidiş',color:'#050506',stops:stops.slice(9,19)},
    {direction:'Gidiş',color:'#050506',stops:stops.slice(18,25)},
    {direction:'Dönüş',color:'#0b8f9c',stops:stops.slice(24,34)},
    {direction:'Dönüş',color:'#0b8f9c',stops:stops.slice(34,44)},
    {direction:'Dönüş',color:'#0b8f9c',stops:stops.slice(43,45)}
  ];
  const directions=[{line:'6',name:'6 Nolu Hat',direction:'Gidiş',stops:outboundStops},{line:'6',name:'6 Nolu Hat',direction:'Dönüş',stops:returnStops}];
  window.ELMA_LINE_6_ROUTE={stops,outboundStops,returnStops,directions};
  window.ELMA_TRANSIT_LINES=window.ELMA_TRANSIT_LINES||[];
  window.ELMA_TRANSIT_LINES=window.ELMA_TRANSIT_LINES.filter(line=>line.line!=='6').concat(directions);
  let routeMap=null,routeLines=[],routeBounds=null,routeLoading=null,routeMarkers=[];
  const point=position=>({lat:position[0],lng:position[1]});

  function addStyles(){
    if(document.getElementById('elmaLine6RouteStyle'))return;
    const style=document.createElement('style');style.id='elmaLine6RouteStyle';
    style.textContent='.eg-route6{overflow:hidden;border:1px solid #d8d8dc;border-radius:22px;background:#fff}.eg-route6-head{display:flex;align-items:center;gap:13px;width:100%;padding:15px 16px;border:0;background:#fff;text-align:left;cursor:pointer}.eg-route6-icon{width:42px;height:42px;border-radius:14px;background:#09090a;color:#fff;display:grid;place-items:center;padding:10px;flex:0 0 42px}.eg-route6-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.eg-route6-copy{flex:1;min-width:0}.eg-route6-copy b{display:block;color:#09090a;font-size:15px;margin-bottom:4px}.eg-route6-copy small{display:block;color:#62656a;font-size:11px}.eg-route6-toggle{width:30px;height:30px;border-radius:50%;background:#f0f0f2;color:#09090a;display:grid;place-items:center;flex:0 0 30px;transition:transform .2s}.eg-route6-toggle svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}.eg-route6-head[aria-expanded="true"] .eg-route6-toggle{transform:rotate(180deg)}.eg-route6-body[hidden]{display:none}.eg-route6-map{height:360px;border-top:1px solid #e3e3e5;border-bottom:1px solid #e3e3e5;background:#f7f7f8}.eg-route6-footer{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 16px;color:#62656a;font-size:10px}.eg-route6-legend{display:flex;align-items:center;gap:7px}.eg-route6-key{width:24px;height:5px;border-radius:99px}.eg-route6-key.outbound{background:#050506}.eg-route6-key.return{background:#0b8f9c}.eg-route6-stop-key{width:13px;height:13px;border:2px solid #050506;border-radius:50%;background:#fff}.eg-route6-footer-count{margin-left:auto;font-weight:800;color:#303034}';
    document.head.appendChild(style);
  }
  function fitRoute(){if(routeMap&&routeBounds&&!routeBounds.isEmpty())routeMap.fitBounds(routeBounds,30)}
  function detailedPath(route){return route?.legs?.flatMap(leg=>leg.steps?.flatMap(step=>step.path||[])||[])||route?.overview_path||[]}
  async function drawGoogleChunk(service,chunk){
    const positions=chunk.stops,result=await service.route({origin:point(positions[0]),destination:point(positions.at(-1)),waypoints:positions.slice(1,-1).map(position=>({location:point(position),stopover:true})),optimizeWaypoints:false,travelMode:google.maps.TravelMode.DRIVING,provideRouteAlternatives:false,region:'TR',language:'tr'});
    const path=detailedPath(result.routes?.[0]);if(!path.length)throw new Error(`${chunk.direction} Google güzergâh parçası boş geldi`);
    path.forEach(position=>routeBounds.extend(position));
    routeLines.push(new google.maps.Polyline({map:routeMap,path,strokeColor:chunk.color,strokeOpacity:.96,strokeWeight:6,geodesic:false,zIndex:chunk.direction==='Dönüş'?6:5}));
  }
  async function initMap(container){
    if(routeMap)return routeMap;if(!window.google?.maps)return null;
    routeBounds=new google.maps.LatLngBounds();routeMap=new google.maps.Map(container,{center:point(stops[0]),zoom:12,disableDefaultUI:true,clickableIcons:false,gestureHandling:'greedy',mapTypeId:'roadmap'});
    routeMarkers=stops.map((position,index)=>{const isReturn=index>=25,number=isReturn?index-24:index+1,color=isReturn?'#0b8f9c':'#050506';routeBounds.extend(point(position));return new google.maps.Marker({map:routeMap,position:point(position),zIndex:100+index,title:`6 Nolu Hat • ${isReturn?'Dönüş':'Gidiş'} • ${isReturn?'D':'G'}${number}`,label:{text:(isReturn?'D':'G')+number,color,fontSize:'8px',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:9,fillColor:'#fff',fillOpacity:1,strokeColor:color,strokeOpacity:1,strokeWeight:2}})});
    const service=new google.maps.DirectionsService();
    for(const chunk of routeChunks)try{await drawGoogleChunk(service,chunk)}catch(error){console.error(`6 Nolu Hat ${chunk.direction} parçası çizilemedi:`,error)}
    fitRoute();return routeMap;
  }
  function refreshMap(container){if(!routeLoading)routeLoading=initMap(container).finally(()=>{routeLoading=null});requestAnimationFrame(()=>requestAnimationFrame(()=>{if(routeMap){google.maps.event.trigger(routeMap,'resize');fitRoute()}}))}
  function mount(){
    const panel=document.querySelector('.eg-panel[data-panel="routes"] .eg-card');if(!panel)return false;if(panel.querySelector('.eg-route6'))return true;addStyles();
    const placeholder=panel.querySelector('.eg-route-empty'),card=document.createElement('div');card.className='eg-route6';
    card.innerHTML='<button class="eg-route6-head" type="button" aria-expanded="false" aria-controls="egRoute6Body"><span class="eg-route6-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="7" cy="24" r="3"/><circle cx="25" cy="8" r="3"/><path d="M9.5 22.5c2.8-6.8 7.7-1.8 10.2-7.5 1.1-2.5 2.5-3.9 3.5-4.7"/></svg></span><span class="eg-route6-copy"><b>6 Nolu Hat</b><small>Gidiş 25 durak • Dönüş 21 durak</small></span><span class="eg-route6-toggle" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></button><div id="egRoute6Body" class="eg-route6-body" hidden><div id="egRoute6Map" class="eg-route6-map" role="region" aria-label="6 nolu hat gidiş ve dönüş güzergâh haritası"></div><div class="eg-route6-footer"><span class="eg-route6-legend"><span class="eg-route6-key outbound"></span><span>Gidiş • 25 durak</span></span><span class="eg-route6-legend"><span class="eg-route6-key return"></span><span>Dönüş • 21 durak</span></span><span class="eg-route6-footer-count">45 farklı durak</span></div></div>';
    if(placeholder)placeholder.replaceWith(card);else panel.appendChild(card);
    const routePanel=document.querySelector('.eg-panel[data-panel="routes"]'),container=card.querySelector('.eg-route6-map'),head=card.querySelector('.eg-route6-head'),body=card.querySelector('.eg-route6-body');
    const show=()=>{if(routePanel?.classList.contains('active')&&head.getAttribute('aria-expanded')==='true')refreshMap(container)};
    head.addEventListener('click',()=>{const open=head.getAttribute('aria-expanded')!=='true';head.setAttribute('aria-expanded',String(open));body.hidden=!open;if(open)show()});new MutationObserver(show).observe(routePanel,{attributes:true,attributeFilter:['class']});return true;
  }
  let tries=0;function boot(){if(mount())return;if(++tries<=50)setTimeout(boot,200)}boot();
})();
