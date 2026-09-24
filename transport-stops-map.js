(()=>{
  const PANEL='.eg-panel[data-panel="transport-trips"]';
  const DATA_URL='assets/amasya-transit-data.json?v=20260922-map1';
  const TILE_URL='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  let lines=[],selected='',map,previewObserver;
  const root=()=>document.getElementById('elmaStopsMap');
  const number=line=>line.id==='4-alt'?'4 ALT':line.id==='4-ust'?'4 ÜST':String(line.number);
  const numberHTML=line=>line.id==='4-alt'?'4<small>ALT</small>':line.id==='4-ust'?'4<small>ÜST</small>':String(line.number);
  const title=line=>line.id==='4-alt'?'4 Numaralı Hat · Alt':line.id==='4-ust'?'4 Numaralı Hat · Üst':line.number+' Numaralı Hat';
  const current=()=>lines.find(line=>line.id===selected);
  const style={version:8,sources:{osm:{type:'raster',tiles:[TILE_URL],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]};
  const feature=points=>({type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:points.map(p=>[p[1],p[0]])}}]});
  const library=()=>window.elmaGetMapLibre();
  function fit(instance,points,padding=22){
    if(!instance||!points.length)return;
    const xs=points.map(p=>p[1]),ys=points.map(p=>p[0]);instance.resize();
    instance.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding,maxZoom:15.5,duration:0});
  }
  function draw(instance,line,showStops){
    if(!instance.isStyleLoaded())return;
    if(!instance.getSource('route')){
      instance.addSource('route',{type:'geojson',data:feature(line.route)});
      instance.addLayer({id:'route-halo',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':showStops?8:7}});
      instance.addLayer({id:'route-main',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#111','line-width':showStops?4:3}});
      instance.addSource('stops',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      instance.addLayer({id:'stops',type:'circle',source:'stops',paint:{'circle-radius':showStops?5:2.5,'circle-color':'#fff','circle-stroke-color':'#111','circle-stroke-width':showStops?2:1.5}});
    }
    instance.getSource('route').setData(feature(line.route));
    instance.getSource('stops').setData({type:'FeatureCollection',features:line.stops.map(stop=>({type:'Feature',properties:{name:stop.name,number:stop.number},geometry:{type:'Point',coordinates:[stop.lng,stop.lat]}}))});
    fit(instance,line.route,showStops?38:14);
  }
  function preview(element,line){window.elmaRenderMapPreview?.(element,line.route,line.stops)}
  function clearPreviews(){previewObserver?.disconnect()}
  function renderList(){
    const wrap=root();if(!wrap||!lines.length)return;
    const query=wrap.querySelector('input').value.trim().toLocaleLowerCase('tr-TR');
    const matches=lines.filter(line=>!query||[title(line),number(line),...line.stops.map(stop=>stop.name)].join(' ').toLocaleLowerCase('tr-TR').includes(query));
    clearPreviews();
    wrap.querySelector('.est-cards').innerHTML=matches.length?matches.map(line=>'<article class="est-card"><button class="est-card-open" type="button" data-line="'+line.id+'" aria-label="'+title(line)+' duraklarını haritada aç"><span class="est-card-head"><b class="est-number">'+numberHTML(line)+'</b><b class="est-card-metric">'+line.stops.length+' durak</b></span><span class="est-thumb" data-preview="'+line.id+'"></span></button></article>').join(''):'<div class="est-empty">Hat veya durak bulunamadı.</div>';
    previewObserver=new IntersectionObserver((entries,observer)=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);const line=lines.find(item=>item.id===entry.target.dataset.preview);if(line)preview(entry.target,line)}},{rootMargin:'180px'});
    wrap.querySelectorAll('[data-preview]').forEach(element=>previewObserver.observe(element));
  }
  async function select(id){
    selected=id;const wrap=root(),line=current();if(!wrap||!line)return;
    clearPreviews();wrap.querySelector('.est-list').hidden=true;wrap.querySelector('.est-detail').hidden=false;
    wrap.querySelector('.est-detail-number').textContent=number(line);
    wrap.querySelector('.est-detail-title').textContent='Duraklar';
    wrap.querySelector('.est-count').textContent=line.stops.length+' durak';
    try{
      const GL=await library();if(selected!==id||!wrap.isConnected)return;
      if(!map){
        map=new GL.Map({container:wrap.querySelector('.est-map'),style,center:[35.83,40.65],zoom:12,dragRotate:false,pitchWithRotate:false,attributionControl:true});
        map.touchZoomRotate.disableRotation();
        map.on('load',()=>{
          if(current())draw(map,current(),true);
          map.on('click','stops',event=>{const stop=event.features?.[0];if(stop)new GL.Popup({closeButton:false,offset:12}).setLngLat(stop.geometry.coordinates).setText(stop.properties.name).addTo(map)});
          map.on('mouseenter','stops',()=>map.getCanvas().style.cursor='pointer');
          map.on('mouseleave','stops',()=>map.getCanvas().style.cursor='');
        });
      }else draw(map,line,true);
    }catch(error){wrap.querySelector('.est-map').textContent='Harita yüklenemedi.';console.warn('Durak haritası:',error)}
  }
  function styles(){
    if(document.getElementById('elmaStopsStyle'))return;
    const css=document.createElement('style');css.id='elmaStopsStyle';
    css.textContent=`
      ${PANEL}{padding:0 0 110px!important}${PANEL}>.eg-service-back{display:none!important}
      .est{--ink:#111215;--muted:#777b86;--border:#e2e3e9;--surface:#fff;min-height:70vh;padding:14px 14px 30px;background:#fff;color:var(--ink);font-family:inherit}
      html:not([data-theme="light"]) .est{--ink:#f5f5f5;--muted:#aaa;--border:#36363a;--surface:#1a1a1d;background:#111113}
      .est *{box-sizing:border-box}.est button{font:inherit;cursor:pointer}.est-list[hidden],.est-detail[hidden]{display:none}
      .est-search{display:flex;align-items:center;gap:12px;height:47px;margin-bottom:13px;padding:0 13px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--ink)}.est-search svg{width:19px;height:19px;flex:none;fill:none;stroke:currentColor;stroke-width:2}.est-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--ink);font:inherit;font-size:13px}.est-search input::placeholder{color:var(--muted)}
      .est-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.est-card{position:relative;min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:17px;background:var(--surface)}.est-card-open{display:block;width:100%;padding:10px;border:0;background:transparent;color:var(--ink);text-align:left}.est-card-head{display:grid;grid-template-columns:1fr 1fr;align-items:center;height:55px;border-left:4px solid var(--ink)}.est-number{display:flex;width:100%;height:43px;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid var(--border);color:var(--ink);font-size:29px;font-weight:850;line-height:1}.est-card-metric{min-width:0;color:var(--ink);font-size:12px;font-weight:800;text-align:center;white-space:nowrap}.est-number small{margin-top:1px;font-size:9px;letter-spacing:.4px}.est-thumb{display:block;height:98px;margin:9px 0 10px;overflow:hidden;border-radius:10px;background:#eef0ec;pointer-events:none}.est-empty{grid-column:1/-1;padding:35px;color:var(--muted);text-align:center}
      .est-back{display:block;margin:0 0 15px;padding:4px 0;border:0;background:none;color:var(--muted);font-size:13px!important;font-weight:750!important}.est-detail-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}.est-detail-number{display:grid;min-width:43px;height:43px;place-items:center;padding:0 6px;border-radius:11px;background:#171719;color:#fff;font-size:16px;font-weight:850}.est-detail-title{min-width:0;flex:1;font-size:15px;font-weight:800}.est-fit{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--ink)}.est-fit svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.est-map{height:min(62dvh,550px);min-height:310px;overflow:hidden;border:1px solid var(--border);border-radius:15px;background:#e9e9e9}.est-map .maplibregl-ctrl-attrib{font-size:10px}.est-count{display:block;margin-top:13px;color:var(--ink);font-size:13px;font-weight:800;text-align:right}
      @media(max-width:370px){.est{padding-right:10px;padding-left:10px}.est-cards{gap:7px}.est-card-open{padding:8px}.est-number{height:37px;font-size:25px}.est-number small{font-size:8px}.est-card-metric{font-size:10px}.est-thumb{height:85px}}
    `;document.head.appendChild(css);
  }
  function mount(){
    const target=document.querySelector(PANEL);if(!target||root())return;
    styles();const wrap=document.createElement('div');wrap.id='elmaStopsMap';wrap.className='est';
    wrap.innerHTML='<div class="est-list"><label class="est-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="Hat veya durak ara" placeholder="Hat veya durak ara"></label><div class="est-cards"><div class="est-empty">Duraklar yükleniyor…</div></div></div><div class="est-detail" hidden><button class="est-back" type="button">‹ Duraklar</button><div class="est-detail-head"><b class="est-detail-number"></b><strong class="est-detail-title"></strong><button class="est-fit" type="button" aria-label="Tüm durakları göster"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4 4 11l7 2 2 7 7-16Z"/><path d="m11 13 9-9"/></svg></button></div><div class="est-map" aria-label="OpenStreetMap durak haritası"></div><b class="est-count"></b></div>';
    target.appendChild(wrap);
    wrap.querySelector('input').oninput=renderList;
    wrap.querySelector('.est-cards').onclick=event=>{const button=event.target.closest('[data-line]');if(button)select(button.dataset.line)};
    wrap.querySelector('.est-back').onclick=()=>{selected='';wrap.querySelector('.est-detail').hidden=true;wrap.querySelector('.est-list').hidden=false;renderList()};
    wrap.querySelector('.est-fit').onclick=()=>current()&&fit(map,current().route,38);
    new MutationObserver(()=>{if(target.classList.contains('active')){library().catch(()=>{});if(map&&current())fit(map,current().route,38)}}).observe(target,{attributes:true,attributeFilter:['class']});
    window.elmaGetTransitData().then(data=>{lines=data.lines.filter(line=>line.route?.length&&line.stops?.length);renderList()}).catch(()=>{wrap.querySelector('.est-cards').innerHTML='<div class="est-empty">Duraklar yüklenemedi. Tekrar deneyin.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  window.addEventListener('elma-home-widgets-ready',mount);
})();
