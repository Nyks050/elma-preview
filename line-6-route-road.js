(()=>{
  if(window.__elmaLine6RouteMounted)return;
  window.__elmaLine6RouteMounted=true;
  const stops=[[40.6509073,35.7937144],[40.6496713,35.7953616],[40.6498748,35.7958499],[40.6505504,35.7977596],[40.6510022,35.799656],[40.6518446,35.8012573],[40.6528886,35.8036471],[40.6549682,35.8051076],[40.6551016,35.8085505],[40.65373,35.810204],[40.6529848,35.8126388],[40.6502092,35.813002],[40.6474741,35.8136941],[40.6450238,35.8109662],[40.6427973,35.8079917],[40.6375686,35.8087695],[40.6198218,35.8185006],[40.6174031,35.814268],[40.607308,35.8118447],[40.6044503,35.8110975],[40.6018431,35.8095904],[40.6017107,35.8098962],[40.6045149,35.811527],[40.6067489,35.8120597],[40.6026047,35.8190569],[40.6058272,35.814206],[40.6074148,35.8122048],[40.6178206,35.8153746],[40.6203356,35.819112],[40.6327046,35.8138447],[40.646188,35.8111236],[40.6478685,35.8097459],[40.6506649,35.8070686],[40.6552399,35.8086085],[40.6506649,35.8070686],[40.6552399,35.8086085],[40.6558426,35.8063643],[40.6544141,35.8045297],[40.6529116,35.803455],[40.6520203,35.8014058],[40.6509621,35.7990991],[40.6506956,35.798104],[40.6500281,35.7960199],[40.6497452,35.795285],[40.6493225,35.7908953]];
  const outboundStops=stops.slice(0,25),returnStops=stops.slice(24);
  const directions=[{line:'6',name:'6 Nolu Hat',direction:'Gidiş',stops:outboundStops},{line:'6',name:'6 Nolu Hat',direction:'Dönüş',stops:returnStops}];
  const kml=window.ELMA_LINE6_KML||{segments:[],stops:[]};
  const startStop=kml.stops[13];
  const distance2=(a,b)=>(a[0]-b[0])**2+((a[1]-b[1])*.76)**2;
  function joinSegments(segments,start){
    const remaining=segments.filter(segment=>segment.length>1).map(segment=>segment.slice());
    const path=start?[start.slice()]:[];
    while(remaining.length){
      let best={distance:Infinity,index:0,reverse:false};
      const current=path.at(-1)||remaining[0][0];
      remaining.forEach((segment,index)=>{
        for(const reverse of [false,true]){
          const distance=distance2(current,reverse?segment.at(-1):segment[0]);
          if(distance<best.distance)best={distance,index,reverse};
        }
      });
      const segment=remaining.splice(best.index,1)[0];
      if(best.reverse)segment.reverse();
      path.push(...(distance2(path.at(-1)||segment[0],segment[0])<1e-12?segment.slice(1):segment));
    }
    return path;
  }
  const routePath=joinSegments(kml.segments,startStop?.position);
  const orderedStops=kml.stops.map((stop,index)=>({stop,index,routeIndex:routePath.reduce((best,position,pathIndex)=>distance2(position,stop.position)<distance2(routePath[best],stop.position)?pathIndex:best,0)})).sort((a,b)=>a.routeIndex-b.routeIndex);
  const numberedStops=orderedStops.map(({stop,index},order)=>({stop,index,number:order+1,name:/^Durak \d+(?: \(\d+\))?$/.test(stop.name)?`Durak ${order+1}`:stop.name}));
  const visualStops=numberedStops.map(({stop})=>stop.position);
  window.ELMA_LINE_6_ROUTE={stops,outboundStops,returnStops,directions,visualStops};
  window.ELMA_TRANSIT_LINES=window.ELMA_TRANSIT_LINES||[];
  window.ELMA_TRANSIT_LINES=window.ELMA_TRANSIT_LINES.filter(line=>line.line!=='6').concat(directions);
  let routeMap=null,routeBounds=null,routeLoading=null;
  const point=position=>({lat:position[0],lng:position[1]});
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function addStyles(){
    if(document.getElementById('elmaLine6RouteStyle'))return;
    const style=document.createElement('style');style.id='elmaLine6RouteStyle';
    style.textContent=`
.eg-panel[data-panel="routes"] .eg-route-list{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
.eg-route-screen-head{padding:4px 0 20px}.eg-route-screen-head h2{margin:0;color:#111216;font-size:31px;font-weight:850;letter-spacing:-.055em}.eg-route-screen-head p{margin:7px 0 0;color:#74777e;font-size:13px}
.eg-route6{overflow:hidden;border:1px solid #e8e9ec;border-radius:20px;background:#fff}
.eg-route6-head{display:flex;align-items:center;gap:13px;width:100%;padding:16px;border:0;background:#fff;text-align:left;cursor:pointer}
.eg-route6-icon{width:44px;height:44px;border-radius:14px;background:#17191d;color:#fff;display:grid;place-items:center;flex:0 0 44px;font:850 22px/1 Inter,system-ui,sans-serif}
.eg-route6-copy{flex:1;min-width:0}.eg-route6-copy b{display:block;color:#111216;font-size:16px;font-weight:800;margin-bottom:4px}.eg-route6-copy small{display:block;color:#74777e;font-size:11px}
.eg-route6-toggle{width:30px;height:30px;border-radius:50%;background:#f0f0f2;color:#17191d;display:grid;place-items:center;flex:0 0 30px;transition:transform .2s}.eg-route6-toggle svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}.eg-route6-head[aria-expanded="true"] .eg-route6-toggle{transform:rotate(180deg)}
.eg-route6-body[hidden]{display:none}.eg-route6-map{height:380px;border-top:1px solid #e6e7e9;border-bottom:1px solid #e6e7e9;background:#f7f7f8}
.eg-route6-stops-head{display:flex;justify-content:space-between;align-items:baseline;padding:17px 16px 10px}.eg-route6-stops-head b{font-size:16px;letter-spacing:-.03em}.eg-route6-stops-head small{font-size:11px;color:#7c7f85}
.eg-route6-stops{list-style:none;margin:0;padding:0 12px 14px;max-height:290px;overflow:auto}.eg-route6-stops li+li{border-top:1px solid #f0f0f2}.eg-route6-stop{display:flex;align-items:center;gap:11px;width:100%;min-height:53px;padding:8px 4px;border:0;background:transparent;color:#1b1c20;text-align:left;font:650 12px/1.3 Inter,system-ui,sans-serif;cursor:pointer}.eg-route6-stop:hover,.eg-route6-stop:focus-visible{background:#f7f7f8;outline:0}.eg-route6-stop-number{width:27px;height:27px;flex:0 0 27px;border-radius:50%;background:#17191d;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800}.eg-route6-stop-name{flex:1;min-width:0}.eg-route6-stop-arrow{color:#a0a3a9;font-size:19px}
.eg-route6-footer{padding:12px 16px;border-top:1px solid #eeeef0;color:#74777e;font-size:11px}
`;
    document.head.appendChild(style);
  }
  function fitRoute(){if(routeMap&&routeBounds&&!routeBounds.isEmpty())routeMap.fitBounds(routeBounds,28)}
  async function initMap(container){
    if(routeMap)return routeMap;
    if(!window.ElmaMaps||!kml.segments.length)return null;
    routeBounds=new ElmaMaps.LatLngBounds();
    routeMap=new ElmaMaps.Map(container,{center:point(routePath[0]||visualStops[0]),zoom:12,disableDefaultUI:true,clickableIcons:false,gestureHandling:'greedy',mapTypeId:'roadmap'});
    const path=routePath.map(point);path.forEach(position=>routeBounds.extend(position));
    new ElmaMaps.Polyline({map:routeMap,path,strokeColor:'#111111',strokeOpacity:1,strokeWeight:6,geodesic:false,clickable:false});
    numberedStops.forEach(({stop,number,name})=>{
      const position=point(stop.position);routeBounds.extend(position);
      new ElmaMaps.Marker({map:routeMap,position,zIndex:100+number,title:`6 Nolu Hat • ${number}. durak: ${name}`,label:{text:String(number),color:'#fff',fontSize:'9px',fontWeight:'800'},icon:{path:ElmaMaps.SymbolPath.CIRCLE,scale:11,fillColor:'#17191d',fillOpacity:1,strokeColor:'#fff',strokeOpacity:1,strokeWeight:2}});
    });
    fitRoute();return routeMap;
  }
  function refreshMap(container){
    if(!routeLoading)routeLoading=initMap(container).finally(()=>{routeLoading=null});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(routeMap){ElmaMaps.event.trigger(routeMap,'resize');fitRoute()}}));
  }
  function mount(){
    const routePanel=document.querySelector('.eg-panel[data-panel="routes"]');if(!routePanel)return false;
    let panel=routePanel.querySelector('.eg-card');
    if(!panel){
      panel=document.createElement('div');panel.className='eg-card eg-route-list';
      panel.innerHTML='<div class="eg-route-screen-head"><h2>Güzergâhlar</h2><p>Hatları harita üzerinde keşfet</p></div>';
      routePanel.appendChild(panel);
    }
    if(panel.querySelector('.eg-route6'))return true;
    addStyles();
    const placeholder=panel.querySelector('.eg-route-empty'),card=document.createElement('div');card.className='eg-route6';
    const stopItems=numberedStops.map(({index,number,name})=>`<li><button class="eg-route6-stop" type="button" data-stop="${index}" aria-label="${number}. durak: ${escapeHtml(name)}"><span class="eg-route6-stop-number">${number}</span><span class="eg-route6-stop-name">${escapeHtml(name)}</span><span class="eg-route6-stop-arrow" aria-hidden="true">›</span></button></li>`).join('');
    card.innerHTML=`<button class="eg-route6-head" type="button" aria-expanded="true" aria-controls="egRoute6Body"><span class="eg-route6-icon" aria-hidden="true">6</span><span class="eg-route6-copy"><b>6 Nolu Hat</b><small>1. duraktan başlayan güzergâh • ${kml.stops.length} durak</small></span><span class="eg-route6-toggle" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></button><div id="egRoute6Body" class="eg-route6-body"><div id="egRoute6Map" class="eg-route6-map" role="region" aria-label="6 nolu hat KML güzergâh haritası"></div><div class="eg-route6-stops-head"><b>Duraklar</b><small>Haritada görmek için dokun</small></div><ol class="eg-route6-stops">${stopItems}</ol><div class="eg-route6-footer">1. duraktan başlayan kesintisiz rota • ${kml.stops.length} durak</div></div>`;
    if(placeholder)placeholder.replaceWith(card);else panel.appendChild(card);
    const container=card.querySelector('.eg-route6-map'),head=card.querySelector('.eg-route6-head'),body=card.querySelector('.eg-route6-body');
    const show=()=>{if(routePanel?.classList.contains('active')&&head.getAttribute('aria-expanded')==='true')refreshMap(container)};
    head.addEventListener('click',()=>{const open=head.getAttribute('aria-expanded')!=='true';head.setAttribute('aria-expanded',String(open));body.hidden=!open;if(open)show()});
    card.querySelectorAll('.eg-route6-stop').forEach(button=>button.addEventListener('click',()=>{
      const stop=kml.stops[Number(button.dataset.stop)];if(!stop||!routeMap)return;
      routeMap.panTo(point(stop.position));routeMap.setZoom(16);
      container.scrollIntoView({block:'nearest',behavior:'smooth'});
    }));
    new MutationObserver(show).observe(routePanel,{attributes:true,attributeFilter:['class']});show();return true;
  }
  let tries=0;function boot(){if(mount())return;if(++tries<=50)setTimeout(boot,200)}boot();
})();
