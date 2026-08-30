(()=>{
  if(window.__elmaLine6RouteMounted)return;
  window.__elmaLine6RouteMounted=true;

  const stops=[
    'Amasya MYO',
    'Muhsin Yazıcıoğlu Cd. No:18',
    'Nokta 9',
    'Türkistan Cd. No:62',
    'Türkistan Cd. No:20',
    'Nokta 7',
    'Oniki Haziran Cd. No:1',
    'Nokta 1',
    'Nokta 2',
    'Nokta 3',
    'Nokta 4',
    'Nokta 5',
    'Koza • Başak Sk. No:11'
  ];

  function addStyles(){
    if(document.getElementById('elmaLine6RouteStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLine6RouteStyle';
    style.textContent=`.eg-route6{overflow:hidden;border:1px solid #d8d8dc;border-radius:22px;background:#fff}.eg-route6-head{width:100%;border:0;background:transparent;color:#09090a;display:flex;align-items:center;gap:13px;padding:16px;text-align:left}.eg-route6-icon{width:42px;height:42px;border-radius:14px;background:#09090a;color:#fff;display:grid;place-items:center;padding:10px;flex:0 0 42px}.eg-route6-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.eg-route6-copy{flex:1;min-width:0}.eg-route6-copy b{display:block;font-size:15px;margin-bottom:4px}.eg-route6-copy small{display:block;color:#62656a;font-size:11px;line-height:1.35}.eg-route6-arrow{color:#686b70;font-size:22px}.eg-route6-detail{display:none;border-top:1px solid #e3e3e5;padding:14px 16px 16px}.eg-route6-detail.show{display:block}.eg-route6-summary{font-size:11px;font-weight:750;color:#62656a;margin-bottom:12px}.eg-route6-stop{position:relative;display:flex;gap:12px;min-height:38px;color:#09090a;font-size:12px;font-weight:680}.eg-route6-marker{position:relative;width:14px;flex:0 0 14px}.eg-route6-marker:before{content:'';position:absolute;left:4px;top:3px;width:7px;height:7px;border-radius:50%;background:#09090a}.eg-route6-stop:not(:last-child) .eg-route6-marker:after{content:'';position:absolute;left:7px;top:12px;bottom:-3px;width:1.5px;background:#b8bac0}.eg-route6-stop:first-child .eg-route6-marker:before,.eg-route6-stop:last-child .eg-route6-marker:before{left:2px;top:1px;width:11px;height:11px}.eg-route6-note{margin-top:6px;color:#777a80;font-size:9px;line-height:1.45}`;
    document.head.appendChild(style);
  }

  function mount(){
    const panel=document.querySelector('.eg-panel[data-panel="routes"] .eg-card');
    if(!panel)return false;
    if(panel.querySelector('.eg-route6'))return true;
    addStyles();
    const placeholder=panel.querySelector('.eg-route-empty');
    const card=document.createElement('div');
    card.className='eg-route6';
    card.innerHTML=`<button class="eg-route6-head" type="button" aria-expanded="false"><span class="eg-route6-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="7" cy="24" r="3"/><circle cx="25" cy="8" r="3"/><path d="M9.5 22.5c2.8-6.8 7.7-1.8 10.2-7.5 1.1-2.5 2.5-3.9 3.5-4.7"/></svg></span><span class="eg-route6-copy"><b>6 Numaralı Hat</b><small>Amasya MYO → Koza • ${stops.length} güzergâh noktası</small></span><span class="eg-route6-arrow">›</span></button><div class="eg-route6-detail"><div class="eg-route6-summary">Amasya MYO kalkış yönü</div>${stops.map(name=>`<div class="eg-route6-stop"><span class="eg-route6-marker" aria-hidden="true"></span><span>${name}</span></div>`).join('')}<div class="eg-route6-note">Güzergâh, paylaşılan 6 NUMARA KML dosyasındaki işaret ve yol sırasına göre hazırlanmıştır.</div></div>`;
    if(placeholder)placeholder.replaceWith(card);else panel.appendChild(card);
    const button=card.querySelector('.eg-route6-head'),detail=card.querySelector('.eg-route6-detail'),arrow=card.querySelector('.eg-route6-arrow');
    button.onclick=()=>{const open=!detail.classList.contains('show');detail.classList.toggle('show',open);button.setAttribute('aria-expanded',String(open));arrow.textContent=open?'⌄':'›'};
    return true;
  }

  let tries=0;
  function boot(){if(mount())return;if(++tries<=50)setTimeout(boot,200)}
  boot();
})();
