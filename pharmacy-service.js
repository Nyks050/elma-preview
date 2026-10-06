(()=>{
  if(window.__elmaPharmacyServiceMounted)return;
  window.__elmaPharmacyServiceMounted=true;

  const API_URL='https://elma-eczane-api.enesmalik2147.workers.dev/';
  const AMASYA_CENTER={latitude:40.65,longitude:35.83};
  const CENTER_RADIUS_METRES=12000;
  const OUTSIDE_DISTRICTS=['merzifon','suluova','tasova','gumushacikoy','goynucek','hamamozu'];
  const serviceIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 4h10v7h7v10h-7v7H11v-7H4V11h7z"/></svg>';

  function normalize(value){
    return String(value||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  }

  function number(value){
    const parsed=Number(String(value??'').replace(',','.'));
    return Number.isFinite(parsed)?parsed:null;
  }

  function distanceBetween(lat1,lon1,lat2,lon2){
    const toRad=value=>value*Math.PI/180;
    const dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1);
    const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }

  function coordinates(item){
    const latitude=number(item.latitude??item.lat),longitude=number(item.longitude??item.lon??item.lng);
    return latitude===null||longitude===null?null:{latitude,longitude};
  }

  function isAmasyaCenter(item){
    const city=normalize(item.city??item.province??item.il);
    const district=normalize(item.district??item.town??item.ilce);
    const address=normalize(item.address);
    const combined=[city,district,address].join(' ');
    if(OUTSIDE_DISTRICTS.some(name=>combined.includes(name)))return false;
    if(city&&city!=='amasya'&&!city.includes('amasya'))return false;
    if(district&&district!=='merkez'&&!district.includes('amasya merkez'))return false;
    const point=coordinates(item);
    if(point&&distanceBetween(AMASYA_CENTER.latitude,AMASYA_CENTER.longitude,point.latitude,point.longitude)>CENTER_RADIUS_METRES)return false;
    return Boolean(point||city.includes('amasya')||address.includes('amasya'));
  }

  function addStyles(){
    if(document.getElementById('elmaPharmacyStyle'))return;
    const style=document.createElement('style');
    style.id='elmaPharmacyStyle';
    style.textContent=`
      .eg-panel[data-panel="pharmacies"]{padding-bottom:28px;color:#09090a}
      .eg-pharmacy-shell{position:relative;overflow:hidden;border:2px solid #09090a;border-radius:26px;background:#fff;box-shadow:8px 8px 0 #09090a;padding:20px}
      .eg-pharmacy-shell:before{content:"";position:absolute;inset:0 0 auto;height:6px;background:linear-gradient(90deg,#09090a 0 72%,#d8d8d8 72% 86%,#09090a 86%)}
      .eg-pharmacy-kicker{margin-top:5px;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#6b6b6f}
      .eg-pharmacy-title{margin:7px 0 0;font-size:29px;line-height:1.02;letter-spacing:-1.1px;font-weight:900;color:#09090a}
      .eg-pharmacy-lead{max-width:330px;margin:10px 0 0;color:#5d5d62;font-size:12px;line-height:1.5}
      .eg-pharmacy-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 0;padding:13px 14px;border-radius:16px;background:#09090a;color:#fff}
      .eg-pharmacy-summary-copy{min-width:0}
      .eg-pharmacy-summary-copy b{display:block;font-size:12px;letter-spacing:-.1px}
      .eg-pharmacy-status{display:block;margin-top:3px;color:#bdbdc2;font-size:10px;line-height:1.35}
      .eg-pharmacy-count{display:grid;place-items:center;min-width:42px;height:42px;border-radius:13px;background:#fff;color:#09090a;font-size:19px;font-weight:950}
      .eg-pharmacy-results{display:grid;gap:13px;margin-top:16px}
      .eg-pharmacy-item{position:relative;border:1.5px solid #09090a;border-radius:20px;background:#fff;padding:16px;box-shadow:4px 4px 0 #d7d7da}
      .eg-pharmacy-item-head{display:flex;align-items:flex-start;gap:11px}
      .eg-pharmacy-index{display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border-radius:11px;background:#09090a;color:#fff;font-size:12px;font-weight:900}
      .eg-pharmacy-item-copy{min-width:0;flex:1}
      .eg-pharmacy-item h3{margin:1px 0 0;color:#09090a;font-size:16px;line-height:1.18;letter-spacing:-.25px}
      .eg-pharmacy-distance{display:inline-flex;margin-top:6px;border:1px solid #cfcfd3;border-radius:999px;background:#f4f4f5;color:#3f3f43;padding:4px 8px;font-size:9px;font-weight:850}
      .eg-pharmacy-address{margin:12px 0;color:#55555a;font-size:11px;line-height:1.5}
      .eg-pharmacy-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .eg-pharmacy-action{min-height:42px;border:1.5px solid #09090a;border-radius:13px;background:#fff;color:#09090a;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px;font-weight:900}
      .eg-pharmacy-action.primary{background:#09090a;color:#fff}
      .eg-pharmacy-action[aria-disabled="true"]{opacity:.38;pointer-events:none}
      .eg-pharmacy-retry{width:100%;min-height:44px;margin-top:14px;border:1.5px solid #09090a;border-radius:14px;background:#09090a;color:#fff;font-weight:900}
      .eg-pharmacy-empty{padding:25px 15px;border:1.5px dashed #a9a9ad;border-radius:18px;text-align:center;color:#5d5d62;font-size:12px;line-height:1.5}
      .eg-pharmacy-skeleton{height:132px;border:1px solid #dedee1;border-radius:20px;background:linear-gradient(100deg,#eee 20%,#fafafa 40%,#eee 60%);background-size:220% 100%;animation:egPharmacyShimmer 1.2s linear infinite}
      .eg-pharmacy-note{margin:16px 2px 0;color:#77777c;font-size:9px;line-height:1.5}
      @keyframes egPharmacyShimmer{to{background-position-x:-220%}}
      @media(prefers-reduced-motion:reduce){.eg-pharmacy-skeleton{animation:none}}
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

  function setStatus(text,count='—'){
    const status=document.getElementById('egPharmacyStatus');
    const countElement=document.getElementById('egPharmacyCount');
    if(status)status.textContent=text;
    if(countElement)countElement.textContent=String(count);
  }

  function distanceLabel(item){
    const reported=number(item.distanceMt);
    const point=coordinates(item);
    const metres=reported??(point?distanceBetween(AMASYA_CENTER.latitude,AMASYA_CENTER.longitude,point.latitude,point.longitude):null);
    if(metres!==null)return metres<1000?Math.round(metres)+' m':(metres/1000).toFixed(1).replace('.',',')+' km';
    return 'Amasya Merkez';
  }

  function render(items){
    const results=document.getElementById('egPharmacyResults');
    if(!results)return;
    results.replaceChildren();
    if(!items.length){
      const empty=document.createElement('div');
      empty.className='eg-pharmacy-empty';
      empty.textContent='Amasya Merkez için bugün nöbetçi eczane bulunamadı. Veriler gün içinde yenilenebilir.';
      results.appendChild(empty);
      return;
    }
    items.forEach((item,index)=>{
      const card=document.createElement('article');
      card.className='eg-pharmacy-item';
      const head=document.createElement('div');
      head.className='eg-pharmacy-item-head';
      const order=document.createElement('span');
      order.className='eg-pharmacy-index';
      order.textContent=String(index+1).padStart(2,'0');
      const copy=document.createElement('div');
      copy.className='eg-pharmacy-item-copy';
      const title=document.createElement('h3');
      title.textContent=item.pharmacyName||item.name||'Nöbetçi Eczane';
      const distance=document.createElement('span');
      distance.className='eg-pharmacy-distance';
      distance.textContent=distanceLabel(item);
      copy.append(title,distance);
      head.append(order,copy);
      const address=document.createElement('p');
      address.className='eg-pharmacy-address';
      address.textContent=item.address||[item.district,item.city].filter(Boolean).join(' / ')||'Amasya Merkez';
      const actions=document.createElement('div');
      actions.className='eg-pharmacy-actions';
      const phone=document.createElement('a');
      phone.className='eg-pharmacy-action primary';
      phone.textContent='Telefonla ara';
      const cleanedPhone=String(item.phone||'').replace(/[^\d+]/g,'');
      phone.href=cleanedPhone?'tel:'+cleanedPhone:'#';
      if(!cleanedPhone)phone.setAttribute('aria-disabled','true');
      const directions=document.createElement('a');
      directions.className='eg-pharmacy-action';
      directions.textContent='Yol tarifi';
      directions.target='_blank';
      directions.rel='noopener';
      const point=coordinates(item);
      directions.href=point?'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(point.latitude+','+point.longitude)+'&travelmode=driving':'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(title.textContent+' Amasya');
      actions.append(phone,directions);
      card.append(head,address,actions);
      results.appendChild(card);
    });
  }

  function showLoading(){
    const results=document.getElementById('egPharmacyResults');
    if(!results)return;
    results.innerHTML='<div class="eg-pharmacy-skeleton"></div><div class="eg-pharmacy-skeleton"></div>';
  }

  function showError(){
    const results=document.getElementById('egPharmacyResults');
    if(!results)return;
    results.innerHTML='<div class="eg-pharmacy-empty">Eczane bilgileri şu anda alınamadı. İnternet bağlantını kontrol edip yeniden deneyebilirsin.</div><button class="eg-pharmacy-retry" type="button">Yeniden dene</button>';
    results.querySelector('.eg-pharmacy-retry').onclick=loadAmasyaCenter;
  }

  async function loadAmasyaCenter(){
    showLoading();
    setStatus('Liste güncelleniyor','…');
    try{
      const params=new URLSearchParams({latitude:String(AMASYA_CENTER.latitude),longitude:String(AMASYA_CENTER.longitude)});
      const response=await fetch(API_URL+'?'+params.toString(),{cache:'no-store'});
      const payload=await response.json();
      if(!response.ok||payload.status!=='success'||!Array.isArray(payload.data))throw new Error('service');
      const items=payload.data.filter(isAmasyaCenter).sort((a,b)=>{
        const aPoint=coordinates(a),bPoint=coordinates(b);
        const aDistance=number(a.distanceMt)??(aPoint?distanceBetween(AMASYA_CENTER.latitude,AMASYA_CENTER.longitude,aPoint.latitude,aPoint.longitude):Infinity);
        const bDistance=number(b.distanceMt)??(bPoint?distanceBetween(AMASYA_CENTER.latitude,AMASYA_CENTER.longitude,bPoint.latitude,bPoint.longitude):Infinity);
        return aDistance-bDistance;
      });
      render(items);
      setStatus(items.length?'Bugünün güncel merkez listesi':'Bugün kayıt bulunamadı',items.length);
    }catch(error){
      setStatus('Bağlantı kurulamadı','!');
      showError();
    }
  }

  function mount(){
    const widgets=document.getElementById('elmaHomeWidgets');
    const grid=widgets?.querySelector('.eg-panel[data-panel="services"] .eg-services-grid');
    if(!widgets||!grid)return false;
    if(document.querySelector('.eg-pharmacy-card'))return true;
    addStyles();
    const card=document.createElement('button');
    card.className='eg-service-card eg-pharmacy-card';
    card.type='button';
    card.innerHTML='<span class="eg-service-icon">'+serviceIcon+'</span><span class="eg-service-name">Nöbetçi Eczaneler</span>';
    const panel=document.createElement('div');
    panel.className='eg-panel';
    panel.dataset.panel='pharmacies';
    panel.innerHTML='<button class="eg-service-back" type="button">‹ Şehir</button><section class="eg-pharmacy-shell"><div class="eg-pharmacy-kicker">Amasya Merkez</div><h2 class="eg-pharmacy-title">Nöbetçi<br>Eczaneler</h2><p class="eg-pharmacy-lead">Bugün açık olan merkez eczanelerini, telefonlarını ve yol tariflerini tek ekranda gör.</p><div class="eg-pharmacy-summary"><div class="eg-pharmacy-summary-copy"><b>Canlı merkez listesi</b><span id="egPharmacyStatus" class="eg-pharmacy-status" aria-live="polite">Liste hazırlanıyor</span></div><span id="egPharmacyCount" class="eg-pharmacy-count">—</span></div><div id="egPharmacyResults" class="eg-pharmacy-results"></div><p class="eg-pharmacy-note">Bilgiler hizmet sağlayıcıdan alınır. Gitmeden önce eczaneyi telefonla araman önerilir.</p></section>';
    grid.appendChild(card);
    widgets.insertBefore(panel,widgets.querySelector('.eg-panel[data-panel="account"]'));
    card.onclick=()=>{showPanel(panel);loadAmasyaCenter()};
    panel.querySelector('.eg-service-back').onclick=goServices;
    return true;
  }

  let attempts=0;
  const timer=setInterval(()=>{if(mount()||++attempts>100)clearInterval(timer)},100);
  mount();
})();

