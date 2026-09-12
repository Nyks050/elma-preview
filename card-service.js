(()=>{
'use strict';
if(window.__elmaCardService)return;
window.__elmaCardService=true;
let panel;
const cardIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="7" width="26" height="19" rx="3"/><path d="M3 13h26M8 20h6"/></svg>';
const balanceIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 9h20v17H6zM10 9V6h12v3"/><path d="M10 17h12M10 21h7"/></svg>';
const topupIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12"/><path d="M16 10v12M10 16h12"/></svg>';
const historyIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 10a11 11 0 1 1-1 10"/><path d="M7 4v6H1M16 9v8l5 3"/></svg>';
function show(panelToShow){
 document.querySelectorAll('.eg-panel').forEach(item=>item.classList.toggle('active',item===panelToShow));
 document.querySelectorAll('.elma-main-tab').forEach(item=>item.classList.toggle('active',item.dataset.elmaTab==='services'));
 document.querySelectorAll('.eg-tab').forEach(item=>item.classList.toggle('active',item.dataset.tab==='services'));
 const hero=document.querySelector('.hero'),map=document.querySelector('.mapwrap'),widgets=document.getElementById('elmaHomeWidgets');
 if(hero)hero.style.display='none';if(map)map.style.display='none';widgets?.classList.remove('home-active');panelToShow.scrollIntoView({block:'start'});
}
function open(){show(panel)}
function back(){if(window.elmaSelectMainTab)window.elmaSelectMainTab('services');else{const services=document.querySelector('.eg-panel[data-panel="services"]');if(services)show(services)}}
function mount(){
 const widgets=document.getElementById('elmaHomeWidgets');if(!widgets){setTimeout(mount,80);return}
 const style=document.createElement('style');style.id='elmaCardServiceStyle';style.textContent=`
#elmaHomeWidgets [data-panel="card-service"]{min-height:100vh;padding:calc(18px + env(safe-area-inset-top)) 6% calc(92px + env(safe-area-inset-bottom));background:#fff;color:#09090a;font-family:-apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif}
.eg-card-page-head{display:grid;grid-template-columns:42px 1fr 42px;align-items:center;margin-bottom:24px}.eg-card-page-head button{width:42px;height:42px;border:0;border-radius:50%;background:#f1f1f2;color:#111;font-size:27px}.eg-card-page-head h2{margin:0;text-align:center;font-size:23px;letter-spacing:-.04em}.eg-card-soon-shell{display:grid;gap:13px}.eg-card-soon-hero{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:18px;border:1px solid #dedee1;border-radius:22px;background:#fff}.eg-card-soon-copy{min-width:0}.eg-card-soon-badge{display:inline-flex;border-radius:99px;background:#09090a;color:#fff;padding:6px 9px;font-size:9px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.eg-card-soon-hero h3{margin:12px 0 6px;font-size:24px;letter-spacing:-.05em}.eg-card-soon-hero p{margin:0;color:#5d6065;font-size:12px;line-height:1.5}.eg-card-soon-icon{width:66px;height:66px;flex:0 0 66px;border-radius:21px;background:#f1f1f2;padding:17px;color:#09090a}.eg-card-soon-icon svg,.eg-card-feature-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.eg-card-soon-label{margin:7px 2px 0;color:#777a80;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}.eg-card-soon-list{display:grid;gap:10px}.eg-card-feature{display:flex;align-items:center;gap:13px;padding:14px;border:1px solid #dedee1;border-radius:19px;background:#fff}.eg-card-feature-icon{width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:#ededee;color:#09090a;padding:10px}.eg-card-feature-copy{min-width:0}.eg-card-feature-copy b{display:block;font-size:14px;margin-bottom:4px}.eg-card-feature-copy small{display:block;color:#65686d;font-size:10px;line-height:1.45}.eg-card-soon-note{padding:16px;border:1px dashed #d5d5d8;border-radius:18px;background:#fafafa;text-align:center;color:#66696e;font-size:11px;line-height:1.55}.eg-card-soon-back{min-height:48px;border:0;border-radius:15px;background:#09090a;color:#fff;font-weight:850}
`;
 document.head.appendChild(style);
 panel=document.createElement('section');panel.className='eg-panel';panel.dataset.panel='card-service';
 panel.innerHTML='<header class="eg-card-page-head"><button type="button" aria-label="Hizmetlere dön">‹</button><h2>Kart İşlemleri</h2><span></span></header><div class="eg-card-soon-shell"><section class="eg-card-soon-hero"><div class="eg-card-soon-copy"><span class="eg-card-soon-badge">Yakında</span><h3>Kartın da Elma Go’da</h3><p>Ulaşım kartını yönetebileceğin yeni deneyimi hazırlıyoruz.</p></div><div class="eg-card-soon-icon">'+cardIcon+'</div></section><div class="eg-card-soon-label">Neler geliyor?</div><div class="eg-card-soon-list"><div class="eg-card-feature"><div class="eg-card-feature-icon">'+balanceIcon+'</div><div class="eg-card-feature-copy"><b>Bakiye görüntüleme</b><small>Kartındaki güncel bakiyeyi anında kontrol et.</small></div></div><div class="eg-card-feature"><div class="eg-card-feature-icon">'+topupIcon+'</div><div class="eg-card-feature-copy"><b>Bakiye yükleme</b><small>Kartına hızlı ve güvenli biçimde bakiye ekle.</small></div></div><div class="eg-card-feature"><div class="eg-card-feature-icon">'+historyIcon+'</div><div class="eg-card-feature-copy"><b>İşlem geçmişi</b><small>Yüklemelerini ve kart hareketlerini tek yerde gör.</small></div></div></div><div class="eg-card-soon-note">Kart İşlemleri henüz kullanıma açık değil. Hazır olduğunda bu sayfadan erişebileceksin.</div><button class="eg-card-soon-back" type="button">Hizmetlere dön</button></div>';
 const account=widgets.querySelector('.eg-panel[data-panel="account"]');widgets.insertBefore(panel,account||null);panel.querySelector('.eg-card-page-head button').onclick=back;panel.querySelector('.eg-card-soon-back').onclick=back;window.elmaOpenCardService=open;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
