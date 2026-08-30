(()=>{
  if(window.__elmaHelpCenterMounted)return;
  window.__elmaHelpCenterMounted=true;

  const helpIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12"/><path d="M12.5 12a3.8 3.8 0 0 1 7.2 1.7c0 3-3.7 3.2-3.7 6M16 24h.01"/></svg>';
  const searchIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>';
  const guides=[
    {id:'location',title:'Konum izni nasıl açılır?',summary:'Hava durumu ve yakınındaki hizmetler için',keywords:'konum izin gps hava eczane',steps:['Hesap ekranındaki Ayarlar bölümünü aç.','Konum servisleri anahtarını etkinleştir.','Telefon izin penceresinde “İzin ver” seçeneğine dokun.'],action:'location',actionText:'Konum ayarına git'},
    {id:'lost',title:'Kayıp eşya ilanı nasıl verilir?',summary:'Fotoğraflı kayıp veya buluntu ilanı oluştur',keywords:'kayıp buluntu ilan fotoğraf eşya',steps:['Hizmetler ekranından Kayıp bölümünü aç.','“Bir şey kaybettim” veya “Bir şey buldum” seçeneğini seç.','Eşya ve konum bilgilerini doldurup ilanı yayımla.'],action:'lost',actionText:'Kayıp ilanı ver'},
    {id:'times',title:'Sefer saatlerini nereden bulurum?',summary:'Hatların güncel kalkış saatlerini görüntüle',keywords:'hat sefer saat otobüs kalkış geçmiş',steps:['Hizmetler ekranındaki Hatlar bölümünü aç.','Bakmak istediğin hat numarasına dokun.','Hafta içi, Cumartesi veya Pazar sekmesini seç.'],action:'lines',actionText:'Hatlara git'},
    {id:'route',title:'Güzergâhı nasıl görüntülerim?',summary:'Hat yolunu ve numaralı durakları haritada aç',keywords:'güzergah rota harita durak hat',steps:['Hizmetler ekranından Güzergah bölümünü aç.','İstediğin hat kartına dokun.','Haritayı yakınlaştırarak durakları incele.'],action:'routes',actionText:'Güzergâhlara git'},
    {id:'pharmacy',title:'Nöbetçi eczaneyi nasıl bulurum?',summary:'Konumuna en yakın güncel eczaneleri göster',keywords:'eczane nöbetçi konum sağlık',steps:['Hizmetler ekranından Nöbetçi Eczane bölümünü aç.','İstenirse konum iznine onay ver.','Eczane kartındaki Ara veya Yol tarifi seçeneğini kullan.'],action:'pharmacy',actionText:'Eczaneleri göster'},
    {id:'login',title:'Giriş yapamıyorum',summary:'Telefon kodu ve Google girişi sorunları',keywords:'giriş telefon sms kod google hesap doğrulama',steps:['Telefon numaranı başında sıfır olmadan kontrol et.','SMS kodu gelmediyse kısa bir süre bekleyip yeniden dene.','Google girişinde doğru hesabı seçtiğinden emin ol.'],action:'account',actionText:'Hesaba dön'}
  ];

  function addStyles(){
    if(document.getElementById('elmaHelpCenterStyle'))return;
    const style=document.createElement('style');style.id='elmaHelpCenterStyle';
    style.textContent=`.eg-help-shell{display:grid;gap:14px}.eg-help-hero{position:relative;overflow:hidden;min-height:190px;border-radius:27px;background:linear-gradient(145deg,#080809,#202024);color:#fff;padding:23px;box-shadow:0 14px 34px #0003}.eg-help-hero h2{position:relative;z-index:2;max-width:270px;margin:0 0 8px;font-size:30px;line-height:1;letter-spacing:-1.15px}.eg-help-hero p{position:relative;z-index:2;max-width:250px;margin:0;color:#c4c5c8;font-size:11px;line-height:1.5}.eg-help-visual{position:absolute;right:9px;top:3px;width:108px;height:108px;background-image:url("assets/elma-3d-icons.webp?v=20260830-fast2");background-repeat:no-repeat;background-size:400% 400%;background-position:0 66.667%;filter:drop-shadow(0 14px 20px #0008)}.eg-help-search{position:absolute;z-index:3;left:18px;right:18px;bottom:17px;height:47px;display:flex;align-items:center;gap:9px;border:1px solid #ffffff26;border-radius:15px;background:#ffffff14;padding:0 13px;backdrop-filter:blur(12px)}.eg-help-search svg{width:18px;height:18px;fill:none;stroke:#bfc1c5;stroke-width:2;stroke-linecap:round}.eg-help-search input{min-width:0;width:100%;border:0;background:transparent;color:#fff;outline:0;font-size:12px}.eg-help-search input::placeholder{color:#a9abb0}.eg-help-label{margin:3px 2px -3px;color:#777a80;font-size:9px;font-weight:850;letter-spacing:.45px;text-transform:uppercase}.eg-help-quick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.eg-help-quick-btn{min-height:78px;border:1px solid #e1e1e3;border-radius:19px;background:#fff;color:#09090a;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;padding:13px;text-align:left}.eg-help-quick-btn b{font-size:12px}.eg-help-quick-btn span{color:#777a80;font-size:9px}.eg-help-arrow{align-self:flex-end;color:#09090a!important;font-size:17px!important}.eg-help-list{display:grid;gap:9px}.eg-help-item{overflow:hidden;border:1px solid #e0e0e2;border-radius:19px;background:#fff}.eg-help-question{width:100%;min-height:67px;border:0;background:#fff;color:#09090a;display:flex;align-items:center;gap:11px;padding:12px 14px;text-align:left}.eg-help-number{width:34px;height:34px;border-radius:12px;background:#f0f0f1;display:grid;place-items:center;flex:0 0 34px;font-size:10px;font-weight:900}.eg-help-copy{flex:1;min-width:0}.eg-help-copy b{display:block;font-size:12px;margin-bottom:3px}.eg-help-copy small{display:block;color:#777a80;font-size:9px;line-height:1.35}.eg-help-chevron{font-size:18px;color:#777a80;transition:transform .18s ease}.eg-help-question[aria-expanded="true"] .eg-help-chevron{transform:rotate(90deg)}.eg-help-answer{display:none;padding:0 15px 15px}.eg-help-answer.show{display:block}.eg-help-steps{margin:0;padding:13px 13px 13px 31px;border-radius:15px;background:#f5f5f6;color:#55585d;font-size:10px;line-height:1.55}.eg-help-steps li+li{margin-top:6px}.eg-help-go{width:100%;min-height:42px;margin-top:8px;border:0;border-radius:13px;background:#09090a;color:#fff;font-size:10px;font-weight:850}.eg-help-empty{display:none;min-height:150px;border:1px dashed #d7d7da;border-radius:20px;align-items:center;justify-content:center;text-align:center;color:#777a80;padding:24px;font-size:11px;line-height:1.5}.eg-help-empty.show{display:flex}@media(max-width:350px){.eg-help-hero{padding:20px}.eg-help-hero h2{font-size:27px}.eg-help-visual{right:-7px;width:96px;height:96px}.eg-help-quick{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
  }

  function setNavAccount(){
    document.querySelectorAll('.eg-tab').forEach(tab=>{const active=tab.dataset.tab==='account';tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));if(active)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current')});
  }

  function showHelp(panel){
    document.querySelectorAll('.eg-panel').forEach(item=>item.classList.toggle('active',item===panel));
    document.querySelector('.hero')?.style.setProperty('display','none');
    document.querySelector('.mapwrap')?.style.setProperty('display','none');
    document.getElementById('elmaHomeWidgets')?.classList.remove('home-active');setNavAccount();
  }

  function goAccount(){document.querySelector('.eg-tab[data-tab="account"]')?.click()}

  function openService(target){
    if(target==='account')return goAccount();
    if(target==='location'){
      goAccount();setTimeout(()=>document.getElementById('egLocationToggle')?.scrollIntoView({behavior:'smooth',block:'center'}),50);return;
    }
    document.querySelector('.eg-tab[data-tab="services"]')?.click();
    setTimeout(()=>{
      if(target==='lost')document.querySelector('.eg-lost-card')?.click();
      else if(target==='pharmacy')document.querySelector('.eg-pharmacy-card')?.click();
      else document.querySelector('.eg-service-card[data-service-target="'+target+'"]')?.click();
      if(target==='lost')setTimeout(()=>document.getElementById('egLostQuickLost')?.click(),80);
    },30);
  }

  function renderGuides(container){
    guides.forEach((guide,index)=>{
      const item=document.createElement('article');item.className='eg-help-item';item.dataset.search=(guide.title+' '+guide.summary+' '+guide.keywords).toLocaleLowerCase('tr-TR');
      const question=document.createElement('button');question.className='eg-help-question';question.type='button';question.setAttribute('aria-expanded','false');question.innerHTML='<span class="eg-help-number">'+String(index+1).padStart(2,'0')+'</span><span class="eg-help-copy"><b></b><small></small></span><span class="eg-help-chevron" aria-hidden="true">›</span>';
      question.querySelector('b').textContent=guide.title;question.querySelector('small').textContent=guide.summary;
      const answer=document.createElement('div');answer.className='eg-help-answer';const steps=document.createElement('ol');steps.className='eg-help-steps';guide.steps.forEach(text=>{const step=document.createElement('li');step.textContent=text;steps.appendChild(step)});const action=document.createElement('button');action.className='eg-help-go';action.type='button';action.textContent=guide.actionText+' →';action.onclick=()=>openService(guide.action);answer.append(steps,action);
      question.onclick=()=>{const open=question.getAttribute('aria-expanded')!=='true';container.querySelectorAll('.eg-help-question').forEach(button=>button.setAttribute('aria-expanded','false'));container.querySelectorAll('.eg-help-answer').forEach(element=>element.classList.remove('show'));question.setAttribute('aria-expanded',String(open));answer.classList.toggle('show',open)};
      item.append(question,answer);container.appendChild(item);
    });
  }

  function filterGuides(value){
    const query=value.trim().toLocaleLowerCase('tr-TR');let visible=0;
    document.querySelectorAll('.eg-help-item').forEach(item=>{const show=!query||item.dataset.search.includes(query);item.hidden=!show;if(show)visible++});
    document.getElementById('egHelpEmpty')?.classList.toggle('show',visible===0);
  }

  function mount(){
    const widgets=document.getElementById('elmaHomeWidgets'),account=document.querySelector('.eg-panel[data-panel="account"]'),helpButton=document.getElementById('egAccountHelp');if(!widgets||!account||!helpButton)return false;if(document.querySelector('.eg-panel[data-panel="help"]'))return true;addStyles();
    const panel=document.createElement('div');panel.className='eg-panel';panel.dataset.panel='help';panel.innerHTML='<button class="eg-service-back" type="button">‹ Hesap</button><div class="eg-help-shell"><section class="eg-help-hero"><h2>Nasıl yardımcı olabiliriz?</h2><p>Aradığın konuyu seç veya yazarak hızlıca bul.</p><div class="eg-help-visual" aria-hidden="true">'+helpIcon+'</div><label class="eg-help-search">'+searchIcon+'<input id="egHelpSearch" type="search" placeholder="Bir sorun veya özellik ara"></label></section><div class="eg-help-label">Hızlı işlemler</div><div class="eg-help-quick"><button class="eg-help-quick-btn" data-help-action="lost"><b>Kayıp ilanı ver</b><span>Eşyanı paylaş</span><span class="eg-help-arrow">↗</span></button><button class="eg-help-quick-btn" data-help-action="lines"><b>Sefer saatleri</b><span>Hatları görüntüle</span><span class="eg-help-arrow">↗</span></button><button class="eg-help-quick-btn" data-help-action="location"><b>Konum ayarı</b><span>İzinleri kontrol et</span><span class="eg-help-arrow">↗</span></button><button class="eg-help-quick-btn" data-help-action="pharmacy"><b>Nöbetçi eczane</b><span>Yakınındakileri bul</span><span class="eg-help-arrow">↗</span></button></div><div class="eg-help-label">Önerilen yardımlar</div><div id="egHelpList" class="eg-help-list"></div><div id="egHelpEmpty" class="eg-help-empty">Bu aramayla eşleşen bir yardım bulunamadı.<br>Farklı bir kelime deneyebilirsin.</div></div>';
    widgets.insertBefore(panel,account);renderGuides(panel.querySelector('#egHelpList'));
    helpButton.onclick=()=>showHelp(panel);panel.querySelector('.eg-service-back').onclick=goAccount;panel.querySelectorAll('[data-help-action]').forEach(button=>button.onclick=()=>openService(button.dataset.helpAction));panel.querySelector('#egHelpSearch').oninput=event=>filterGuides(event.target.value);return true;
  }

  let attempts=0;const timer=setInterval(()=>{if(mount()||++attempts>120)clearInterval(timer)},100);mount();
})();
