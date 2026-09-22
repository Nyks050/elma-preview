(()=>{
  if(window.__elmaTransportLinesV2)return;
  window.__elmaTransportLinesV2=true;

  const LINES=['1','2','3','4 ALT','4 ÜST','5','6','8','11'];
  const DATA_LINES=new Set(['1','2','6']);
  const FAVORITES_KEY='elma_favorite_lines_v2';
  const state={query:'',filter:'all',sort:'asc',open:null,direction:'outbound',favorites:new Set(readFavorites())};

  function readFavorites(){
    try{return JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]')}catch{return[]}
  }

  function saveFavorites(){
    try{localStorage.setItem(FAVORITES_KEY,JSON.stringify([...state.favorites]))}catch{}
  }

  function loadScript(src){
    return new Promise(resolve=>{
      if(document.querySelector(`script[data-elma-lines-src="${src}"]`))return resolve();
      const script=document.createElement('script');
      script.src=src;
      script.dataset.elmaLinesSrc=src;
      script.onload=script.onerror=resolve;
      document.head.appendChild(script);
    });
  }

  function dayKey(line){
    const day=new Date().getDay();
    if(line==='6')return day===6?'saturday':day===0?'sunday':'weekday';
    return day===6?'saturday':day===0?'sundayHoliday':'weekday';
  }

  function scheduleFor(line){
    const data=window.ELMA_TRANSIT?.[line];
    const schedule=data?.schedules?.[dayKey(line)];
    if(Array.isArray(schedule))return{times:schedule,departure:data.departureStop?`Durak ${data.departureStop}`:'Kalkış durağı'};
    if(schedule?.times)return{times:schedule.times,departure:schedule.departure||'Kalkış durağı'};
    return{times:[],departure:data?.departureStop?`Durak ${data.departureStop}`:'Kalkış durağı'};
  }

  function liveInfo(line){
    const data=window.ELMA_TRANSIT?.[line],schedule=scheduleFor(line),now=new Date(),minute=now.getHours()*60+now.getMinutes();
    const minuteOf=time=>{const [h,m]=time.split(':').map(Number);return h*60+m};
    const firstMinute=schedule.times.length?minuteOf(schedule.times[0]):null;
    const lastMinute=schedule.times.length?minuteOf(schedule.times[schedule.times.length-1]):null;
    const phase=firstMinute===null?'unknown':minute<firstMinute?'not-started':minute>lastMinute?'finished':'active';
    const upcoming=phase==='active'?schedule.times.filter(time=>minuteOf(time)>=minute).slice(0,3):[];
    const first=upcoming[0];
    const minutes=first?Math.max(0,first.split(':').map(Number).reduce((h,m)=>h*60+m)-minute):null;
    return{data,schedule,upcoming,minutes,phase,firstTime:schedule.times[0]||null,active:phase==='active'};
  }

  function minuteLabel(value){
    if(value===null)return'Sefer bitti';
    if(value===0)return'Şimdi';
    return`${value} dk`;
  }

  function serviceLabel(info){
    if(info.phase==='not-started')return'Başlamadı';
    if(info.phase==='finished')return'Bitti';
    if(info.phase==='unknown')return'—';
    return minuteLabel(info.minutes);
  }

  function statusLabel(info){
    if(info.phase==='not-started')return`${info.firstTime}’da başlar`;
    if(info.phase==='finished')return'Bugün bitti';
    if(info.phase==='unknown')return'Bilgi yok';
    return'Tarifede';
  }

  function lineName(line){
    if(line==='4 ALT')return'4 Numaralı Hat · Alt';
    if(line==='4 ÜST')return'4 Numaralı Hat · Üst';
    return`${line} Numaralı Hat`;
  }

  function visibleLines(){
    let lines=LINES.filter(line=>lineName(line).toLocaleLowerCase('tr').includes(state.query.toLocaleLowerCase('tr'))||line.toLocaleLowerCase('tr').includes(state.query.toLocaleLowerCase('tr')));
    if(state.filter==='active')lines=lines.filter(line=>liveInfo(line).active);
    if(state.filter==='favorites')lines=lines.filter(line=>state.favorites.has(line));
    if(state.sort==='desc')lines.reverse();
    return lines;
  }

  function routeStrip(line,info){
    const count=info.data?.stopCount;
    const times=info.upcoming.length?info.upcoming.join(' · '):info.phase==='not-started'?`İlk sefer ${info.firstTime}`:info.phase==='finished'?'Bugünkü seferler tamamlandı':'Tarife bilgisi yok';
    return `<section class="el-lines-detail" aria-label="${lineName(line)} ayrıntıları">
      <div class="el-lines-direction" role="tablist" aria-label="Yön seçimi">
        <button type="button" role="tab" data-direction="outbound" aria-selected="${state.direction==='outbound'}" class="${state.direction==='outbound'?'active':''}">Gidiş</button>
        <button type="button" role="tab" data-direction="return" aria-selected="${state.direction==='return'}" class="${state.direction==='return'?'active':''}">Dönüş</button>
        <span class="el-lines-next"><small>Sonraki seferler</small><b>${times}</b></span>
      </div>
      <div class="el-lines-stops" aria-hidden="true">
        <span class="start"></span><i></i><span></span><i></i><span></span><i></i><span class="end"></span>
      </div>
      <div class="el-lines-stop-labels"><b>${state.direction==='outbound'?'Kalkış':'Dönüş'}</b><span>Ara duraklar</span><b>${state.direction==='outbound'?'Varış':'Kalkış'}</b></div>
      <div class="el-lines-detail-foot">
        <span class="el-lines-stop-count">${count?`${count} durak`:'Durak bilgisi hazırlanıyor'}</span>
        <button type="button" class="el-lines-stops-action" data-open-route="${line}">Tüm durakları gör <span>›</span></button>
      </div>
      <button type="button" class="el-lines-open" data-open-route="${line}" ${DATA_LINES.has(line)?'':'disabled'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19V5m0 2h8a4 4 0 0 1 0 8H6m0-3h12"/></svg>
        ${DATA_LINES.has(line)?'Hattı aç':'Güzergâh yakında'} <span>›</span>
      </button>
    </section>`;
  }

  function lineRow(line){
    const info=liveInfo(line),open=state.open===line,favorite=state.favorites.has(line);
    return `<article class="el-lines-item${open?' open':''}" data-line="${line}">
      <div class="el-lines-row">
        <button type="button" class="el-lines-summary" data-toggle-line="${line}" aria-expanded="${open}">
          <span class="el-lines-number">${line==='4 ALT'?'4<small>ALT</small>':line==='4 ÜST'?'4<small>ÜST</small>':line}</span>
          <span class="el-lines-route">
            <span class="el-lines-track"><i></i><b></b><i></i></span>
            <span class="el-lines-meta"><span>Gidiş</span><span>${info.data?.stopCount?`${info.data.stopCount} durak`:'Dönüş'}</span></span>
          </span>
          <span class="el-lines-live">
            <b class="${info.phase!=='active'?'state-label':''}">${serviceLabel(info)}</b>
            <small class="${info.active?'active':''}"><i></i>${statusLabel(info)}</small>
          </span>
          <span class="el-lines-chevron">${open?'⌃':'›'}</span>
        </button>
        <button type="button" class="el-lines-favorite${favorite?' active':''}" data-favorite="${line}" aria-label="${favorite?'Favorilerden çıkar':'Favorilere ekle'}" aria-pressed="${favorite}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/></svg>
        </button>
      </div>
      ${open?routeStrip(line,info):''}
    </article>`;
  }

  function render(){
    const root=document.getElementById('elmaLinesV2');
    if(!root)return;
    const lines=visibleLines();
    root.querySelector('.el-lines-list').innerHTML=lines.length?lines.map(lineRow).join(''):`<div class="el-lines-empty"><b>Hat bulunamadı</b><span>Aramayı veya filtreyi değiştir.</span></div>`;
    root.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===state.filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  }

  function openRoute(line){
    if(!DATA_LINES.has(line))return;
    const trigger=document.querySelector('[data-service-target="transport-routes"]');
    if(trigger)trigger.click();
  }

  function bind(root){
    root.addEventListener('input',event=>{
      if(!event.target.matches('#elmaLinesSearch'))return;
      state.query=event.target.value.trim();
      render();
    });
    root.addEventListener('click',event=>{
      const filter=event.target.closest('[data-filter]');
      if(filter){state.filter=filter.dataset.filter;render();return}
      const favorite=event.target.closest('[data-favorite]');
      if(favorite){const line=favorite.dataset.favorite;state.favorites.has(line)?state.favorites.delete(line):state.favorites.add(line);saveFavorites();render();return}
      const toggle=event.target.closest('[data-toggle-line]');
      if(toggle){state.open=state.open===toggle.dataset.toggleLine?null:toggle.dataset.toggleLine;render();return}
      const direction=event.target.closest('[data-direction]');
      if(direction){state.direction=direction.dataset.direction;render();return}
      const sort=event.target.closest('[data-sort]');
      if(sort){state.sort=state.sort==='asc'?'desc':'asc';sort.setAttribute('aria-label',state.sort==='asc'?'Hatları tersten sırala':'Hatları normal sırala');render();return}
      const route=event.target.closest('[data-open-route]');
      if(route)openRoute(route.dataset.openRoute);
    });
  }

  function addStyles(){
    if(document.getElementById('elmaLinesV2Style'))return;
    const style=document.createElement('style');
    style.id='elmaLinesV2Style';
    style.textContent=`
      .eg-panel[data-panel="transport-lines"]{padding-bottom:22px}.eg-panel[data-panel="transport-lines"]>.eg-service-back{margin:0 0 14px;padding:8px 2px;color:#555b64;font-size:13px}.eg-panel[data-panel="transport-lines"]>.eg-transport-lines-head,.eg-panel[data-panel="transport-lines"]>.eg-transport-lines-list{display:none!important}
      .el-lines{color:#111216;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif}.el-lines *{box-sizing:border-box}.el-lines button,.el-lines input{font:inherit}.el-lines-toolbar{position:sticky;top:0;z-index:5;margin:0 -2px;padding:0 2px 13px;background:linear-gradient(#fff 82%,rgba(255,255,255,0))}.el-lines-search{height:52px;display:flex;align-items:center;gap:11px;padding:0 15px;border:1px solid #e2e4e8;border-radius:17px;background:#f4f5f6}.el-lines-search svg{width:21px;height:21px;fill:none;stroke:#555b64;stroke-width:2;stroke-linecap:round}.el-lines-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#111216;font-size:15px;font-weight:650}.el-lines-search input::placeholder{color:#8a8f97}.el-lines-filters{display:flex;align-items:center;gap:7px;margin-top:10px}.el-lines-filter{height:38px;padding:0 14px;border:1px solid #e2e4e8;border-radius:13px;background:#fff;color:#656a73;font-size:12px;font-weight:760}.el-lines-filter.active{border-color:#17191d;background:#17191d;color:#fff}.el-lines-sort{width:38px;height:38px;margin-left:auto;display:grid;place-items:center;border:1px solid #e2e4e8;border-radius:13px;background:#fff;color:#34383e}.el-lines-sort svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.el-lines-list{border-top:1px solid #e6e7ea}.el-lines-item{border-bottom:1px solid #e6e7ea}.el-lines-row{position:relative}.el-lines-summary{width:100%;min-height:114px;display:grid;grid-template-columns:56px minmax(0,1fr) 65px 18px;align-items:center;gap:11px;padding:15px 43px 15px 3px;border:0;background:transparent;color:#111216;text-align:left}.el-lines-number{display:flex;flex-direction:column;align-items:flex-start;font-size:38px;font-weight:880;letter-spacing:-2px;line-height:.9}.el-lines-number small{margin-top:5px;padding:3px 5px;border-radius:5px;background:#17191d;color:#fff;font-size:8px;font-weight:850;letter-spacing:.4px;line-height:1}.el-lines-route{min-width:0}.el-lines-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:800;letter-spacing:-.25px}.el-lines-track{height:14px;display:grid;grid-template-columns:8px 1fr 8px;align-items:center;margin-top:9px}.el-lines-track i{width:8px;height:8px;border:2px solid #6f747c;border-radius:50%;background:#fff}.el-lines-track b{height:1px;background:#aeb2b8}.el-lines-meta{display:flex;justify-content:space-between;margin-top:2px;color:#747981;font-size:9px;font-weight:680}.el-lines-live{text-align:left}.el-lines-live>b{display:block;font-size:18px;font-weight:850;letter-spacing:-.6px}.el-lines-live small{display:flex;align-items:center;gap:5px;margin-top:5px;color:#989ca3;font-size:9px;font-weight:720}.el-lines-live small i{width:6px;height:6px;border-radius:50%;background:#b6bac0}.el-lines-live small.active{color:#555a62}.el-lines-live small.active i{background:#17191d;box-shadow:0 0 0 3px #e5e6e8}.el-lines-chevron{color:#777c84;font-size:22px}.el-lines-favorite{position:absolute;top:50%;right:11px;width:32px;height:38px;display:grid;place-items:center;transform:translateY(-50%);border:0;background:transparent;color:#9a9ea5}.el-lines-favorite svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round}.el-lines-favorite.active{color:#111216}.el-lines-favorite.active svg{fill:currentColor}.el-lines-item.open{margin:0 -7px;padding:0 7px 8px;border-bottom:0;border-radius:22px;background:#f3f4f5}.el-lines-item.open+.el-lines-item{border-top:1px solid #e6e7ea}.el-lines-detail{margin:0 0 0;padding:14px;border:1px solid #e0e2e5;border-radius:18px;background:#fff;box-shadow:0 11px 30px rgba(22,25,30,.07)}.el-lines-direction{display:grid;grid-template-columns:1fr 1fr minmax(110px,1.2fr);align-items:center;gap:5px}.el-lines-direction>button{height:38px;border:0;border-radius:11px;background:#f0f1f2;color:#666b74;font-size:11px;font-weight:800}.el-lines-direction>button.active{background:#17191d;color:#fff}.el-lines-next{min-width:0;padding-left:8px;text-align:right}.el-lines-next small,.el-lines-next b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.el-lines-next small{color:#8a8f97;font-size:8px;font-weight:700}.el-lines-next b{margin-top:3px;font-size:11px}.el-lines-stops{display:grid;grid-template-columns:10px 1fr 10px 1fr 10px 1fr 10px;align-items:center;margin:24px 3px 0}.el-lines-stops span{width:10px;height:10px;border:2px solid #17191d;border-radius:50%;background:#fff}.el-lines-stops span.start{background:#17191d}.el-lines-stops i{height:2px;background:#17191d}.el-lines-stop-labels{display:flex;justify-content:space-between;margin-top:8px;color:#777c84;font-size:9px}.el-lines-stop-labels b{color:#26292e}.el-lines-detail-foot{display:flex;align-items:center;justify-content:space-between;margin-top:18px;padding-top:12px;border-top:1px solid #eceef0}.el-lines-stop-count{color:#4e535b;font-size:10px;font-weight:750}.el-lines-stops-action{border:0;background:transparent;color:#6c7179;font-size:10px;font-weight:740}.el-lines-stops-action span{margin-left:4px;font-size:17px}.el-lines-open{width:100%;height:48px;margin-top:11px;display:flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:14px;background:#17191d;color:#fff;font-size:12px;font-weight:820}.el-lines-open svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.el-lines-open span{margin-left:auto;margin-right:4px;font-size:20px}.el-lines-open:disabled{background:#d9dbde;color:#777c84}.el-lines-empty{min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.el-lines-empty b{font-size:15px}.el-lines-empty span{margin-top:6px;color:#888d95;font-size:11px}@media(max-width:359px){.el-lines-summary{grid-template-columns:45px minmax(0,1fr) 57px 14px;gap:8px;padding-right:39px}.el-lines-number{font-size:32px}.el-lines-name{font-size:12px}.el-lines-filter{padding:0 10px}.el-lines-direction{grid-template-columns:1fr 1fr}.el-lines-next{grid-column:1/-1;padding:7px 0 0;text-align:left}}
      .el-lines-summary{min-height:96px;grid-template-columns:56px minmax(0,1fr) 76px 18px}.el-lines-track{margin-top:0}.el-lines-live>b{white-space:nowrap}.el-lines-live>b.state-label{font-size:12px;letter-spacing:-.2px}.el-lines-live small{white-space:nowrap}@media(max-width:359px){.el-lines-summary{grid-template-columns:45px minmax(0,1fr) 69px 14px}.el-lines-live>b.state-label{font-size:10px}}
    `;
    style.textContent+=`.el-lines-filters{gap:6px}.el-lines-filter{flex:1;min-width:0;height:34px;padding:0 7px;border-radius:11px;font-size:10.5px;white-space:nowrap}.el-lines-sort{width:34px;height:34px;flex:0 0 34px;border-radius:11px}.el-lines-sort svg{width:17px;height:17px}@media(max-width:359px){.el-lines-filter{padding:0 4px;font-size:9.5px}}`;
    document.head.appendChild(style);
  }

  async function mount(){
    const panel=document.querySelector('.eg-panel[data-panel="transport-lines"]');
    if(!panel)return false;
    if(document.getElementById('elmaLinesV2'))return true;
    await Promise.all([
      loadScript('line-1-schedule.js?v=20260830'),
      loadScript('line-2-schedule.js?v=20260830-line2'),
      loadScript('line-6-schedule.js?v=20260830-line6')
    ]);
    addStyles();
    const root=document.createElement('div');
    root.id='elmaLinesV2';
    root.className='el-lines';
    root.innerHTML=`<div class="el-lines-toolbar">
      <label class="el-lines-search" for="elmaLinesSearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg><input id="elmaLinesSearch" type="search" inputmode="search" autocomplete="off" placeholder="Hat veya durak ara" aria-label="Hat veya durak ara"></label>
      <div class="el-lines-filters" aria-label="Hat filtreleri">
        <button type="button" class="el-lines-filter active" data-filter="all">Tümü</button>
        <button type="button" class="el-lines-filter" data-filter="active">Aktif hatlar</button>
        <button type="button" class="el-lines-filter" data-filter="favorites">Favoriler</button>
        <button type="button" class="el-lines-sort" data-sort aria-label="Hatları tersten sırala"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h10M8 12h7M8 18h4M4 5v14m0 0-2-2m2 2 2-2"/></svg></button>
      </div>
    </div><div class="el-lines-list" aria-live="polite"></div>`;
    panel.appendChild(root);
    bind(root);
    render();
    setInterval(render,60000);
    return true;
  }

  let attempts=0;
  function boot(){mount().then(done=>{if(!done&&++attempts<80)setTimeout(boot,100)});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
