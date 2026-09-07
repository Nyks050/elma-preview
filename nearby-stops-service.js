(()=>{
  if(window.__elmaNearbyStopsMounted)return;
  window.__elmaNearbyStopsMounted=true;

  const DEFAULT_POSITION={coords:{latitude:40.65,longitude:35.83}};
  const stopIcon='<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M18 4h25c9 0 15 6 15 15v20c0 9-6 15-15 15H18Z"/><path fill="#fff" d="M25 13h18c4 0 7 3 7 7v8H25Zm2 22h7v7h-7Zm14 0h7v7h-7Z"/><path fill="currentColor" d="M13 4h8v56h-8Zm8 48h15v8H21Z"/></svg>';

  function addStyles(){
    if(document.getElementById('elmaNearbyStopsStyle'))return;
    const style=document.createElement('style');
    style.id='elmaNearbyStopsStyle';
    style.textContent=`
      .eg-nearby-card .eg-service-icon{background-image:none!important;filter:drop-shadow(0 5px 7px rgba(0,0,0,.2))!important;color:#000!important}
      .eg-nearby-card .eg-service-icon>svg,.eg-nearby-head-icon>svg{display:block!important;width:100%;height:100%}
      .eg-nearby-head-icon{width:54px;height:54px;color:#000;filter:drop-shadow(0 5px 7px rgba(0,0,0,.18))}\n      .eg-nearby-intro{margin:0 0 14px;color:#62656a;font-size:13px;line-height:1.5}
      .eg-nearby-locate{width:100%;min-height:48px;border:0;border-radius:15px;background:#09090a;color:#fff;font-weight:800;padding:12px 16px}
      .eg-nearby-locate:disabled{opacity:.55}
      .eg-nearby-status{margin:12px 2px;color:#62656a;font-size:12px;line-height:1.4}
      .eg-nearby-results{display:grid;gap:10px}
      .eg-nearby-stop{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #dedee1;border-radius:18px;background:#fff;padding:13px;color:#09090a;text-decoration:none}
      .eg-nearby-rank{width:42px;height:42px;border-radius:13px;background:#09090a;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:850}
      .eg-nearby-copy{min-width:0}.eg-nearby-copy b{display:block;font-size:14px;line-height:1.35}.eg-nearby-copy small{display:block;margin-top:4px;color:#62656a;font-size:11px;line-height:1.35}
      .eg-nearby-distance{font-size:12px;font-weight:850;white-space:nowrap}
      .eg-nearby-arrow{font-size:22px;line-height:1}
      @media(max-width:359px){.eg-nearby-stop{grid-template-columns:38px minmax(0,1fr);gap:10px}.eg-nearby-rank{width:38px;height:38px}.eg-nearby-distance{grid-column:2}.eg-nearby-arrow{display:none}}
    `;
    document.head.appendChild(style);
  }

  function showPanel(panel){
    document.querySelectorAll('.eg-panel').forEach(item=>item.classList.toggle('active',item===panel));
    document.querySelectorAll('.eg-tab').forEach(tab=>{
      const active=tab.dataset.tab==='services';
      tab.classList.toggle('active',active);
      tab.setAttribute('aria-selected',String(active));
    });
    const hero=document.querySelector('.hero'),map=document.querySelector('.mapwrap');
    if(hero)hero.style.display='none';
    if(map)map.style.display='none';
  }

  function goServices(){
    const services=document.querySelector('.eg-panel[data-panel="services"]');
    if(services)showPanel(services);
  }

  function distanceMetres(a,b){
    const rad=value=>value*Math.PI/180;
    const earth=6371000;
    const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
    const value=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
    return 2*earth*Math.atan2(Math.sqrt(value),Math.sqrt(1-value));
  }

  function collectStops(){
    const groups=[];
    const line1=window.ELMA_LINE_1_ROUTE;
    if(line1?.directions)line1.directions.forEach(item=>groups.push(item));
    const line6=window.ELMA_LINE_6_ROUTE;
    if(line6?.directions)line6.directions.forEach(item=>groups.push(item));
    const unique=new Map();
    groups.forEach(group=>(group.stops||[]).forEach((point,index)=>{
      const lat=Number(point[0]),lng=Number(point[1]);
      if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
      const key=lat.toFixed(5)+','+lng.toFixed(5);
      const label=(group.name||group.line+' Nolu Hat')+' · '+group.direction;
      if(!unique.has(key))unique.set(key,{lat,lng,number:index+1,lines:[label]});
      else if(!unique.get(key).lines.includes(label))unique.get(key).lines.push(label);
    }));
    return [...unique.values()];
  }

  function formatDistance(metres){
    return metres<1000?Math.max(10,Math.round(metres/10)*10)+' m':(metres/1000).toFixed(1).replace('.',',')+' km';
  }

  function setStatus(text){
    const status=document.getElementById('egNearbyStatus');
    if(status)status.textContent=text;
  }

  let dataWaits=0;
  function render(position,isDefault=false){
    const origin={lat:position.coords.latitude,lng:position.coords.longitude};
    const results=document.getElementById('egNearbyResults');
    const stops=collectStops().map(stop=>({...stop,distance:distanceMetres(origin,stop)})).sort((a,b)=>a.distance-b.distance).slice(0,8);
    if(!results)return;
    results.replaceChildren();
    if(!stops.length){if(dataWaits++<20){setStatus('Durak verileri hazırlanıyor…');setTimeout(()=>render(position,isDefault),150);return false}setStatus('Amasya durak verileri henüz hazır değil.');return false}
    dataWaits=0;
    stops.forEach((stop,index)=>{
      const link=document.createElement('a');
      link.className='eg-nearby-stop';
      link.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(stop.lat+','+stop.lng);
      link.target='_blank';
      link.rel='noopener';
      link.setAttribute('aria-label',(index+1)+'. yakındaki durak, '+formatDistance(stop.distance)+', haritada aç');
      link.innerHTML='<span class="eg-nearby-rank">'+(index+1)+'</span><span class="eg-nearby-copy"><b>Yakındaki Durak '+(index+1)+'</b><small>'+stop.lines.join(' · ')+'</small></span><span class="eg-nearby-distance">'+formatDistance(stop.distance)+'</span><span class="eg-nearby-arrow">›</span>';
      results.appendChild(link);
    });
    setStatus((isDefault?'Konum kapalı · Amasya merkez · ':'Konum açık · ')+'En yakın '+stops.length+' durak sıralandı.');
    return true;
  }

  async function requestLocation(){
    const button=document.getElementById('egNearbyLocate');
    if(button)button.hidden=true;
    if(window.elmaUserPosition)return render(window.elmaUserPosition,false);
    if(!navigator.geolocation||!navigator.permissions?.query)return render(DEFAULT_POSITION,true);
    try{
      const permission=await navigator.permissions.query({name:'geolocation'});
      if(permission.state!=='granted')return render(DEFAULT_POSITION,true);
      const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:8000,maximumAge:120000}));
      window.elmaUserPosition=position;
      return render(position,false);
    }catch(error){
      return render(DEFAULT_POSITION,true);
    }
  }

  function mount(){
    const widgets=document.getElementById('elmaHomeWidgets');
    const grid=widgets?.querySelector('.eg-services-grid');
    if(!widgets||!grid)return false;
    if(document.querySelector('.eg-nearby-card'))return true;
    addStyles();
    const card=document.createElement('button');
    card.className='eg-service-card eg-nearby-card';
    card.type='button';
    card.dataset.serviceTarget='nearby-stops';
    card.innerHTML='<span class="eg-service-icon">'+stopIcon+'</span><span class="eg-service-name">Yakındaki Duraklar</span>';
    const panel=document.createElement('div');
    panel.className='eg-panel';
    panel.dataset.panel='nearby-stops';
    panel.innerHTML='<button class="eg-service-back" type="button">‹ Hizmetler</button><div class="eg-card"><div class="eg-head"><div><div class="eg-title">Yakındaki Duraklar</div><div class="eg-muted">Konumuna en yakın duraklar</div></div><div class="eg-nearby-head-icon">'+stopIcon+'</div></div><p class="eg-nearby-intro">Hat 1 ve Hat 6 üzerindeki durakları bulunduğun konuma göre mesafeleriyle gösterir.</p><button id="egNearbyLocate" class="eg-nearby-locate" type="button" hidden>Konumumu kullan</button><div id="egNearbyStatus" class="eg-nearby-status" aria-live="polite">Yakındaki durakları görmek için konumunu kullan.</div><div id="egNearbyResults" class="eg-nearby-results"></div></div>';
    const weather=grid.querySelector('[data-service-target="weather"]');
    grid.insertBefore(card,weather||null);
    widgets.insertBefore(panel,widgets.querySelector('.eg-panel[data-panel="account"]'));
    card.onclick=()=>{showPanel(panel);requestLocation()};
    panel.querySelector('.eg-service-back').onclick=goServices;
    panel.querySelector('#egNearbyLocate').onclick=requestLocation;
    return true;
  }

  let attempts=0;
  const timer=setInterval(()=>{if(mount()||++attempts>120)clearInterval(timer)},100);
  mount();
})();