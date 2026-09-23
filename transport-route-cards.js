(()=>{
  const PANEL='.eg-panel[data-panel="transport-routes"]';
  const DATA_URL='assets/amasya-transit-data.json?v=20260922-map1';
  const TILE_URL='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const FAVORITES_KEY='elma_favorite_routes_v1';
  let lines=[],selected='',direction='outbound',query='',favoritesOnly=false,map,libPromise;
  const previews=new Map();
  let favorites=new Set();try{favorites=new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]'))}catch{}
  const panel=()=>document.querySelector(PANEL),root=()=>document.getElementById('elmaRouteMap');
  const number=line=>line.id==='4-alt'?'4 ALT':line.id==='4-ust'?'4 ÜST':String(line.number);
  const title=line=>line.id==='4-alt'?'4 Numaralı Hat · Alt':line.id==='4-ust'?'4 Numaralı Hat · Üst':line.number+' Numaralı Hat';
  const current=()=>lines.find(line=>line.id===selected);
  const style={version:8,sources:{osm:{type:'raster',tiles:[TILE_URL],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]};
  const geo=points=>({type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:points.map(p=>[p[1],p[0]])}}]});
  function halves(line){
    const stop=line.stops?.[line.returnStartIndex];
    const pivot=line.route.findIndex(point=>point[0]===stop?.lat&&point[1]===stop?.lng);
    const middle=pivot>0&&pivot<line.route.length-1?pivot:Math.floor(line.route.length/2);
    return{outbound:line.route.slice(0,middle+1),return:line.route.slice(middle)};
  }
  function distance(points){
    let total=0;for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],r=Math.PI/180,dy=(b[0]-a[0])*r,dx=(b[1]-a[1])*r;
      const h=Math.sin(dy/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dx/2)**2;
      total+=12742*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
    }return total.toFixed(1).replace('.',',')+' km';
  }
  function library(){
    if(window.maplibregl)return Promise.resolve(window.maplibregl);
    if(libPromise)return libPromise;
    libPromise=new Promise((resolve,reject)=>{
      if(!document.getElementById('ermMapCSS')){
        const css=document.createElement('link');css.id='ermMapCSS';css.rel='stylesheet';
        css.href='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.css';document.head.appendChild(css);
      }
      const script=document.createElement('script');script.src='https://unpkg.com/maplibre-gl@5.12.0/dist/maplibre-gl.js';
      script.onload=()=>window.maplibregl?resolve(window.maplibregl):reject(Error('MapLibre'));
      script.onerror=()=>reject(Error('MapLibre'));document.head.appendChild(script);
    }).catch(error=>{libPromise=null;throw error});return libPromise;
  }
  function fit(instance,points,padding=18){
    if(!instance||!points.length)return;
    const xs=points.map(p=>p[1]),ys=points.map(p=>p[0]);
    instance.resize();instance.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{padding,maxZoom:15.5,duration:0});
  }
  function trace(instance,points){
    const source=instance.getSource('route');if(source)source.setData(geo(points));
    else{
      instance.addSource('route',{type:'geojson',data:geo(points)});
      instance.addLayer({id:'route-halo',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':8}});
      instance.addLayer({id:'route-main',type:'line',source:'route',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#111','line-width':4}});
      instance.addSource('ends',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      instance.addLayer({id:'ends',type:'circle',source:'ends',paint:{'circle-radius':6,'circle-color':'#fff','circle-stroke-color':'#111','circle-stroke-width':2.5}});
    }
    instance.getSource('ends').setData({type:'FeatureCollection',features:[points[0],points[points.length-1]].map(p=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates:[p[1],p[0]]}}))});
  }
  async function preview(element,line){
    if(!element?.isConnected||previews.has(line.id))return;
    try{
      const GL=await library();if(!element.isConnected||previews.has(line.id))return;
      const instance=new GL.Map({container:element,style,center:[35.83,40.65],zoom:11,interactive:false,attributionControl:false,fadeDuration:0});
      previews.set(line.id,instance);
      instance.on('load',()=>{trace(instance,line.route);fit(instance,line.route,13)});
    }catch(error){console.warn('Harita önizlemesi:',error)}
  }
  function clearPreviews(){for(const instance of previews.values())instance.remove();previews.clear()}
  function renderList(){
    const wrap=root();if(!wrap||!lines.length)return;
    const q=query.trim().toLocaleLowerCase('tr-TR');
    const visible=lines.filter(line=>(!favoritesOnly||favorites.has(line.id))&&(!q||[title(line),number(line)].join(' ').toLocaleLowerCase('tr-TR').includes(q)));
    clearPreviews();
    wrap.querySelector('.erm-cards').innerHTML=visible.length?visible.map(line=>'<article class="erm-card"><button class="erm-card-open" type="button" data-line="'+line.id+'" aria-label="'+title(line)+' güzergâhını haritada aç"><span class="erm-card-head"><b class="erm-card-number">'+number(line)+'</b><strong class="erm-card-title">'+title(line)+'</strong></span><span class="erm-thumb" data-preview="'+line.id+'"></span><span class="erm-card-foot"><span><i></i> GÜZERGÂH</span><b>'+distance(line.route)+'</b></span></button><button class="erm-heart'+(favorites.has(line.id)?' active':'')+'" type="button" data-favorite="'+line.id+'" aria-label="'+(favorites.has(line.id)?'Favorilerden çıkar':'Favorilere ekle')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button></article>').join(''):'<div class="erm-no-results">Hat bulunamadı.</div>';
    const observer=new IntersectionObserver((entries,instance)=>{
      for(const entry of entries)if(entry.isIntersecting){instance.unobserve(entry.target);const line=lines.find(item=>item.id===entry.target.dataset.preview);if(line)preview(entry.target,line)}
    },{rootMargin:'180px'});
    wrap.querySelectorAll('[data-preview]').forEach(element=>observer.observe(element));
    wrap.querySelector('.erm-filter').classList.toggle('active',favoritesOnly);
    wrap.querySelector('.erm-filter').setAttribute('aria-pressed',String(favoritesOnly));
  }
  async function showDetail(id){
    selected=id;direction='outbound';
    const wrap=root(),line=current();if(!wrap||!line)return;
    wrap.querySelector('.erm-list').hidden=true;wrap.querySelector('.erm-detail').hidden=false;
    wrap.querySelector('.erm-detail-number').textContent=number(line);
    wrap.querySelector('.erm-detail-name').textContent=title(line);
    wrap.querySelectorAll('[data-direction]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.direction===direction)));
    wrap.querySelector('.erm-distance').textContent=distance(halves(line)[direction]);
    try{
      const GL=await library();if(selected!==id||!wrap.isConnected)return;
      if(!map){
        map=new GL.Map({container:wrap.querySelector('.erm-map'),style,center:[35.83,40.65],zoom:12,dragRotate:false,pitchWithRotate:false,attributionControl:true});
        map.touchZoomRotate.disableRotation();map.on('load',drawDetail);
      }else drawDetail();
    }catch(error){wrap.querySelector('.erm-map').textContent='Harita yüklenemedi.';console.warn('Güzergâh haritası:',error)}
  }
  function drawDetail(){
    if(!map||!map.isStyleLoaded()||!current())return;
    const points=halves(current())[direction];trace(map,points);fit(map,points,38);
  }
  function styles(){
    if(document.getElementById('elmaRouteMapStyle'))return;
    const css=document.createElement('style');css.id='elmaRouteMapStyle';
    css.textContent=`
      ${PANEL}{padding:0 0 110px!important}
      .erm{--ink:#111215;--muted:#767988;--border:#e2e3e9;--surface:#fff;min-height:70vh;padding:14px 14px 30px;background:#fff;color:var(--ink);font-family:inherit}
      html:not([data-theme="light"]) .erm{--ink:#f5f5f5;--muted:#aaabb3;--border:#36363a;--surface:#1a1a1d;background:#111113}
      .erm *{box-sizing:border-box}.erm button{font:inherit;cursor:pointer}.erm-list[hidden],.erm-detail[hidden]{display:none}
      .erm-tools{display:flex;gap:8px;margin-bottom:13px}.erm-search{display:flex;flex:1;align-items:center;gap:12px;height:47px;min-width:0;padding:0 13px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--ink)}.erm-search svg{width:19px;height:19px;flex:none;fill:none;stroke:currentColor;stroke-width:2}.erm-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--ink);font:inherit;font-size:13px}.erm-search input::placeholder{color:var(--muted)}.erm-search:focus-within{border-color:var(--ink)}
      .erm-filter{width:47px;height:47px;flex:none;display:grid;place-items:center;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--ink);box-shadow:0 3px 9px #00000009}.erm-filter.active{background:var(--ink);color:var(--surface)}.erm-filter svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
      .erm-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.erm-card{position:relative;min-width:0;overflow:hidden;border:1px solid var(--border);border-radius:17px;background:var(--surface)}.erm-card-open{display:block;width:100%;padding:10px;border:0;background:transparent;color:var(--ink);text-align:left}.erm-card-head{display:flex;align-items:center;gap:10px;padding-right:27px}.erm-card-number{display:grid;width:43px;height:43px;flex:none;place-items:center;border-radius:10px;background:#171719;color:#fff;font-size:17px;font-weight:850;line-height:1;white-space:pre-line}.erm-card-title{min-width:0;overflow:hidden;font-size:12px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}.erm-heart{position:absolute;top:16px;right:11px;width:22px;height:28px;padding:0;border:0;background:none;color:#747989}.erm-heart.active{color:var(--ink)}.erm-heart svg{width:21px;height:21px;fill:transparent;stroke:currentColor;stroke-width:1.7}.erm-heart.active svg{fill:currentColor}
      .erm-thumb{display:block;height:98px;margin:9px 0 10px;overflow:hidden;border-radius:10px;background:#eef0ec;pointer-events:none}.erm-thumb .maplibregl-canvas{pointer-events:none}.erm-card-foot{display:flex;align-items:center;justify-content:space-between;gap:3px;color:var(--muted);font-size:9px;font-weight:750;letter-spacing:.1px}.erm-card-foot span{white-space:nowrap}.erm-card-foot i{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:var(--ink);vertical-align:1px}.erm-card-foot b{color:var(--ink);font-size:11px;white-space:nowrap}.erm-no-results{grid-column:1/-1;padding:35px;color:var(--muted);text-align:center}
      .erm-back{display:block;margin:0 0 15px;padding:4px 0;border:0;background:none;color:var(--muted);font-size:13px!important;font-weight:750!important}.erm-detail-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}.erm-detail-number{display:grid;min-width:43px;height:43px;place-items:center;padding:0 8px;border-radius:11px;background:#171719;color:#fff;font-size:17px;font-weight:850}.erm-detail-name{min-width:0;flex:1;font-size:15px;font-weight:800}.erm-fit{width:38px;height:38px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--ink);font-size:23px!important}.erm-map{height:min(62dvh,550px);min-height:310px;overflow:hidden;border:1px solid var(--border);border-radius:15px;background:#e9e9e9}.erm-map .maplibregl-ctrl-attrib{font-size:10px}
      .erm-detail-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}.erm-dir{display:grid;grid-template-columns:1fr 1fr;gap:3px;min-width:170px;padding:3px;border:1px solid var(--border);border-radius:10px;background:var(--surface)}.erm-dir button{height:35px;border:0;border-radius:7px;background:none;color:var(--muted);font-size:12px!important;font-weight:750!important}.erm-dir button[aria-pressed="true"]{background:var(--ink);color:var(--surface)}.erm-distance{font-size:13px;font-weight:800}
      @media(max-width:370px){.erm{padding-right:10px;padding-left:10px}.erm-cards{gap:7px}.erm-card-open{padding:8px}.erm-card-head{gap:7px}.erm-card-number{width:37px;height:37px;font-size:15px}.erm-card-title{font-size:11px}.erm-thumb{height:85px}.erm-card-foot{font-size:8px}.erm-card-foot b{font-size:10px}}
    `;document.head.appendChild(css);
  }
  function mount(){
    const target=panel();if(!target||root())return;
    styles();const wrap=document.createElement('div');wrap.id='elmaRouteMap';wrap.className='erm';
    wrap.innerHTML='<div class="erm-list"><div class="erm-tools"><label class="erm-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="Hat ara" placeholder="Hat ara (örn. Güzergâh adı veya numara)"></label><button class="erm-filter" type="button" aria-label="Favori hatları filtrele" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/><circle cx="9" cy="6" r="2" fill="var(--surface)"/><circle cx="16" cy="12" r="2" fill="var(--surface)"/><circle cx="9" cy="18" r="2" fill="var(--surface)"/></svg></button></div><div class="erm-cards"><div class="erm-no-results">Hatlar yükleniyor…</div></div></div><div class="erm-detail" hidden><button class="erm-back" type="button">‹ Güzergâhlar</button><div class="erm-detail-head"><b class="erm-detail-number"></b><strong class="erm-detail-name"></strong><button class="erm-fit" type="button" aria-label="Güzergâhın tamamını göster">⌖</button></div><div class="erm-map" aria-label="OpenStreetMap güzergâh haritası"></div><div class="erm-detail-foot"><div class="erm-dir" role="group" aria-label="Güzergâh yönü"><button type="button" data-direction="outbound" aria-pressed="true">Gidiş</button><button type="button" data-direction="return" aria-pressed="false">Dönüş</button></div><b class="erm-distance"></b></div></div>';
    target.appendChild(wrap);
    wrap.querySelector('input').oninput=event=>{query=event.target.value;renderList()};
    wrap.querySelector('.erm-filter').onclick=()=>{favoritesOnly=!favoritesOnly;renderList()};
    wrap.querySelector('.erm-cards').onclick=event=>{
      const favorite=event.target.closest('[data-favorite]');if(favorite){const id=favorite.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);try{localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favorites]))}catch{};renderList();return}
      const button=event.target.closest('[data-line]');if(button)showDetail(button.dataset.line);
    };
    wrap.querySelector('.erm-back').onclick=()=>{selected='';wrap.querySelector('.erm-detail').hidden=true;wrap.querySelector('.erm-list').hidden=false;renderList()};
    wrap.querySelector('.erm-fit').onclick=()=>current()&&fit(map,halves(current())[direction],38);
    wrap.querySelector('.erm-dir').onclick=event=>{const button=event.target.closest('[data-direction]');if(!button||!current())return;direction=button.dataset.direction;wrap.querySelectorAll('[data-direction]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));wrap.querySelector('.erm-distance').textContent=distance(halves(current())[direction]);drawDetail()};
    new MutationObserver(()=>{if(target.classList.contains('active')&&map&&current())fit(map,halves(current())[direction],38)}).observe(target,{attributes:true,attributeFilter:['class']});
    fetch(DATA_URL).then(response=>{if(!response.ok)throw Error(response.status);return response.json()}).then(data=>{lines=data.lines.filter(line=>Array.isArray(line.route)&&line.route.length>1);renderList()}).catch(()=>{wrap.querySelector('.erm-cards').innerHTML='<div class="erm-no-results">Hatlar yüklenemedi. Tekrar deneyin.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  window.addEventListener('elma-home-widgets-ready',mount);
})();
