(()=>{
  if(window.__elmaLine6RouteMounted)return;
  window.__elmaLine6RouteMounted=true;

  const route=[[40.64934,35.79089],[40.64949,35.79112],[40.64954,35.79149],[40.64931,35.79183],[40.64918,35.79181],[40.64894,35.79153],[40.64878,35.79143],[40.6488,35.79248],[40.64903,35.79337],[40.64945,35.79466],[40.65046,35.79739],[40.65094,35.79916],[40.65129,35.80001],[40.65229,35.80208],[40.65278,35.8032],[40.65313,35.80452],[40.65374,35.80442],[40.65419,35.80447],[40.65505,35.80498],[40.65517,35.80511],[40.65596,35.8056],[40.65548,35.80855],[40.65479,35.80867],[40.65356,35.80898],[40.65387,35.81084],[40.65391,35.81267],[40.6523,35.81274],[40.65056,35.81295],[40.64997,35.81308],[40.6483,35.81318],[40.64805,35.81332],[40.64754,35.81386],[40.64677,35.81289],[40.64596,35.81218],[40.64522,35.81144],[40.64487,35.81098],[40.64374,35.80896],[40.64328,35.80841],[40.64278,35.80805],[40.64227,35.80782],[40.64168,35.80773],[40.64104,35.80782],[40.63814,35.80863],[40.63733,35.80896],[40.63702,35.80916],[40.63476,35.81108],[40.6331,35.81271],[40.62998,35.81608],[40.62811,35.81788],[40.62704,35.81916],[40.62657,35.8195],[40.6261,35.81963],[40.62555,35.81964],[40.62081,35.81899],[40.62041,35.8189],[40.61991,35.81865],[40.61953,35.81833],[40.61923,35.81791],[40.61845,35.81603],[40.61816,35.81545],[40.61763,35.81466],[40.61716,35.81413],[40.6165,35.81369],[40.61614,35.81353],[40.61548,35.81333],[40.61474,35.81319],[40.60821,35.81212],[40.60533,35.81157],[40.60448,35.81122],[40.60365,35.81075],[40.60261,35.81025],[40.60203,35.80986],[40.60113,35.80907],[40.60102,35.80904],[40.60096,35.80911],[40.60101,35.80931],[40.60258,35.81048],[40.60314,35.81083],[40.60399,35.81126],[40.60478,35.81158],[40.60575,35.81185],[40.60678,35.81201],[40.60659,35.81289],[40.60618,35.81336],[40.6057,35.81447],[40.60576,35.81535],[40.60563,35.81587],[40.60546,35.81589],[40.60528,35.81721],[40.60503,35.81799],[40.60505,35.81824],[40.60524,35.81899],[40.60525,35.81972],[40.60492,35.81901],[40.60465,35.81856],[40.60455,35.8185],[40.60443,35.81857],[40.60432,35.81874],[40.60418,35.81974],[40.6041,35.81997],[40.60403,35.82004],[40.60391,35.82002],[40.60378,35.81951],[40.60355,35.81921],[40.60333,35.81953]];
  let routeMap=null,routeLine=null;

  function addStyles(){
    if(document.getElementById('elmaLine6RouteStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLine6RouteStyle';
    style.textContent=`.eg-route6{overflow:hidden;border:1px solid #d8d8dc;border-radius:22px;background:#fff}.eg-route6-head{display:flex;align-items:center;gap:13px;padding:15px 16px}.eg-route6-icon{width:42px;height:42px;border-radius:14px;background:#09090a;color:#fff;display:grid;place-items:center;padding:10px;flex:0 0 42px}.eg-route6-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.eg-route6-copy{flex:1;min-width:0}.eg-route6-copy b{display:block;color:#09090a;font-size:15px;margin-bottom:4px}.eg-route6-copy small{display:block;color:#62656a;font-size:11px;line-height:1.35}.eg-route6-map{height:360px;border-top:1px solid #e3e3e5;border-bottom:1px solid #e3e3e5;background:#f7f7f8}.eg-route6-map .leaflet-control-attribution{font-size:8px;background:#fffffff0}.eg-route6-map .leaflet-control-attribution a{color:#09090a}.eg-route6-map .leaflet-control-zoom{display:none}.eg-route6-footer{display:flex;align-items:center;gap:8px;padding:11px 16px;color:#62656a;font-size:10px;line-height:1.4}.eg-route6-key{width:24px;height:5px;border-radius:99px;background:#050506;flex:0 0 24px}`;
    document.head.appendChild(style);
  }

  function initMap(container){
    if(routeMap||!window.L)return;
    routeMap=L.map(container,{zoomControl:false,attributionControl:true,preferCanvas:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,inertia:true});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      updateWhenIdle:true,
      updateWhenZooming:false,
      keepBuffer:1,
      detectRetina:false,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(routeMap);
    routeLine=L.polyline(route,{color:'#050506',weight:6,opacity:.94,lineCap:'round',lineJoin:'round'}).addTo(routeMap);
    routeMap.fitBounds(routeLine.getBounds(),{padding:[22,22],animate:false});
  }

  function refreshMap(container){
    if(!routeMap)initMap(container);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      routeMap?.invalidateSize(false);
      if(routeLine)routeMap.fitBounds(routeLine.getBounds(),{padding:[22,22],animate:false});
    }));
  }

  function mount(){
    const panel=document.querySelector('.eg-panel[data-panel="routes"] .eg-card');
    if(!panel)return false;
    if(panel.querySelector('.eg-route6'))return true;
    addStyles();
    const placeholder=panel.querySelector('.eg-route-empty');
    const card=document.createElement('div');
    card.className='eg-route6';
    card.innerHTML=`<div class="eg-route6-head"><span class="eg-route6-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="7" cy="24" r="3"/><circle cx="25" cy="8" r="3"/><path d="M9.5 22.5c2.8-6.8 7.7-1.8 10.2-7.5 1.1-2.5 2.5-3.9 3.5-4.7"/></svg></span><span class="eg-route6-copy"><b>6 Numaralı Hat</b><small>Hat güzergâhı</small></span></div><div id="egRoute6Map" class="eg-route6-map" role="region" aria-label="6 numaralı hat güzergâh haritası"></div><div class="eg-route6-footer"><span class="eg-route6-key" aria-hidden="true"></span><span>Siyah çizgi 6 numaralı hattın güzergâhını gösterir.</span></div>`;
    if(placeholder)placeholder.replaceWith(card);else panel.appendChild(card);
    const routePanel=document.querySelector('.eg-panel[data-panel="routes"]'),container=card.querySelector('.eg-route6-map');
    const show=()=>{if(routePanel?.classList.contains('active'))refreshMap(container)};
    new MutationObserver(show).observe(routePanel,{attributes:true,attributeFilter:['class']});
    show();
    return true;
  }

  let tries=0;
  function boot(){if(mount())return;if(++tries<=50)setTimeout(boot,200)}
  boot();
})();
