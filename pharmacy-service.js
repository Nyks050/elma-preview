(()=>{
  if(window.__elmaPharmacyServiceMounted)return;
  window.__elmaPharmacyServiceMounted=true;

  const API_URL='https://elma-eczane-api.enesmalik2147.workers.dev/';
  const pharmacyIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 4h10v7h7v10h-7v7H11v-7H4V11h7z"/></svg>';

  function addStyles(){
    if(document.getElementById('elmaPharmacyStyle'))return;
    const style=document.createElement('style');
    style.id='elmaPharmacyStyle';
    style.textContent='.eg-pharmacy-card{grid-column:1/-1;min-height:108px}.eg-pharmacy-intro{margin:0 0 14px;color:#66696e;font-size:12px;line-height:1.45}.eg-pharmacy-locate{width:100%;min-height:48px;border:0;border-radius:15px;background:#09090a;color:#fff;font-weight:800;padding:12px 16px}.eg-pharmacy-locate:disabled{opacity:.55}.eg-pharmacy-status{margin:12px 2px 0;color:#66696e;font-size:11px;line-height:1.4}.eg-pharmacy-results{display:grid;gap:10px;margin-top:14px}.eg-pharmacy-item{border:1px solid #dedee1;border-radius:18px;background:#fff;padding:14px}.eg-pharmacy-item h3{margin:0;color:#09090a;font-size:15px}.eg-pharmacy-distance{display:inline-block;margin-top:5px;border-radius:99px;background:#eeeeef;color:#55585d;padding:4px 8px;font-size:10px;font-weight:750}.eg-pharmacy-address{margin:9px 0;color:#56595e;font-size:11px;line-height:1.45}.eg-pharmacy-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.eg-pharmacy-action{min-height:38px;border:1px solid #d5d5d8;border-radius:12px;background:#f4f4f4;color:#09090a;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px;font-weight:800}.eg-pharmacy-note{margin:13px 2px 0;color:#777a80;font-size:9px;line-height:1.45}';
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

  function setStatus(text){
    const status=document.getElementById('egPharmacyStatus');
    if(status)status.textContent=text;
  }

  function distanceLabel(item){
    const metres=Number(item.distanceMt);
    if(Number.isFinite(metres))return metres<1000?Math.round(metres)+' m':(metres/1000).toFixed(1).replace('.',',')+' km';
    return 'Yakında';
  }

  function render(items){
    const results=document.getElementById('egPharmacyResults');
    if(!results)return;
    results.replaceChildren();
    items.forEach(item=>{
      const card=document.createElement('article');
      card.className='eg-pharmacy-item';
      const title=document.createElement('h3');
      title.textContent=item.pharmacyName||'Nöbetçi Eczane';
      const distance=document.createElement('span');
      distance.className='eg-pharmacy-distance';
      distance.textContent=distanceLabel(item);
      const address=document.createElement('p');
      address.className='eg-pharmacy-address';
      address.textContent=item.address||[item.district,item.city].filter(Boolean).join(' / ');
      const actions=document.createElement('div');
      actions.className='eg-pharmacy-actions';
      const phone=document.createElement('a');
      phone.className='eg-pharmacy-action';
      phone.textContent='Ara';
      phone.href='tel:'+(item.phone||'').replace(/[^\d+]/g,'');
      const directions=document.createElement('a');
      directions.className='eg-pharmacy-action';
      directions.textContent='Yol tarifi';
      directions.target='_blank';
      directions.rel='noopener';
      directions.href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(item.latitude+','+item.longitude);
      actions.append(phone,directions);
      card.append(title,distance,address,actions);
      results.appendChild(card);
    });
  }

  async function loadForPosition(position){
    const button=document.getElementById('egPharmacyLocate');
    if(button){button.disabled=true;button.textContent='Nöbetçi eczaneler aranıyor…'}
    setStatus('Konumuna en yakın nöbetçi eczaneler alınıyor.');
    try{
      const {latitude,longitude}=position.coords;
      const response=await fetch(API_URL+'?latitude='+encodeURIComponent(latitude)+'&longitude='+encodeURIComponent(longitude));
      const payload=await response.json();
      if(!response.ok||payload.status!=='success'||!Array.isArray(payload.data))throw new Error('service');
      render(payload.data);
      setStatus(payload.data.length?payload.data.length+' nöbetçi eczane bulundu.':'Bu konumun yakınında nöbetçi eczane bulunamadı.');
    }catch(error){
      setStatus('Eczane bilgileri alınamadı. İnternet bağlantını kontrol edip tekrar dene.');
    }finally{
      if(button){button.disabled=false;button.textContent='Konumuma göre yeniden ara'}
    }
  }

  function requestLocation(){
    if(!navigator.geolocation)return setStatus('Bu cihaz konum özelliğini desteklemiyor.');
    const button=document.getElementById('egPharmacyLocate');
    if(button){button.disabled=true;button.textContent='Konum alınıyor…'}
    navigator.geolocation.getCurrentPosition(loadForPosition,error=>{
      if(button){button.disabled=false;button.textContent='Konumuma göre göster'}
      setStatus(error.code===1?'Yakındaki eczaneler için konum izni gerekli.':'Konum alınamadı. Tekrar deneyebilirsin.');
    },{enableHighAccuracy:false,timeout:15000,maximumAge:300000});
  }

  function mount(){
    const widgets=document.getElementById('elmaHomeWidgets');
    const grid=widgets?.querySelector('.eg-services-grid');
    if(!widgets||!grid)return false;
    if(document.querySelector('.eg-pharmacy-card'))return true;
    addStyles();
    const card=document.createElement('button');
    card.className='eg-service-card eg-pharmacy-card';
    card.type='button';
    card.innerHTML='<span class="eg-service-icon">'+pharmacyIcon+'</span><span class="eg-service-name">Nöbetçi Eczane</span>';
    const panel=document.createElement('div');
    panel.className='eg-panel';
    panel.dataset.panel='pharmacies';
    panel.innerHTML='<button class="eg-service-back" type="button">‹ Hizmetler</button><div class="eg-card"><div class="eg-head"><div><div class="eg-title">Nöbetçi Eczaneler</div><div class="eg-muted">Konumuna göre güncel liste</div></div><div class="eg-weather-icon">'+pharmacyIcon+'</div></div><p class="eg-pharmacy-intro">Bugün açık olan en yakın nöbetçi eczaneleri, telefonlarını ve yol tariflerini gösterir.</p><button id="egPharmacyLocate" class="eg-pharmacy-locate" type="button">Konumuma göre göster</button><div id="egPharmacyStatus" class="eg-pharmacy-status">Konum yalnızca bu özelliği kullandığında istenir.</div><div id="egPharmacyResults" class="eg-pharmacy-results"></div><p class="eg-pharmacy-note">Nöbetçi eczane verileri sağlayıcı tarafından gün içinde otomatik güncellenir. Gitmeden önce telefonla doğrulaman önerilir.</p></div>';
    grid.appendChild(card);
    widgets.insertBefore(panel,widgets.querySelector('.eg-panel[data-panel="account"]'));
    card.onclick=()=>showPanel(panel);
    panel.querySelector('.eg-service-back').onclick=goServices;
    panel.querySelector('#egPharmacyLocate').onclick=requestLocation;
    return true;
  }

  let attempts=0;
  const timer=setInterval(()=>{if(mount()||++attempts>100)clearInterval(timer)},100);
  mount();
})();
