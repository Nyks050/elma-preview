(()=>{
'use strict';
if(window.__elmaReferenceServices)return;
window.__elmaReferenceServices=true;
const svg=body=>'<svg viewBox="0 0 32 32" aria-hidden="true">'+body+'</svg>';
const icons={
schedule:svg('<circle cx="16" cy="16" r="12"/><path d="m16 9 0 7 5-5M16 4v2"/>'),
lines:svg('<rect x="7" y="4" width="18" height="22" rx="4"/><path d="M10 9h12v8H10zM10 26v3m12-3v3M11 22h1m8 0h1"/>'),
nearby:svg('<path d="M14 4v3m0 7v4m0 7v4M6 7h17l5 4-5 4H6v-8Zm18 11H7l-4 4 4 4h17v-8"/>'),
routes:svg('<path d="m4 7 8-3 8 3 8-3v21l-8 3-8-3-8 3V7Zm8-3v21m8-18v21"/>'),
weather:svg('<circle cx="22" cy="11" r="5"/><path d="M22 2v2m7 7h2m-9 7v2M15 4l2 2m10 10 2 2m0-14-2 2M8 27h15a5 5 0 0 0 0-10 7 7 0 0 0-13-2 6 6 0 0 0-2 12Z"/>'),
news:svg('<path d="M7 23h18l-3-5v-6a6 6 0 0 0-12 0v6l-3 5Zm6 4a3 3 0 0 0 6 0"/><circle cx="24" cy="7" r="4" fill="#e51d2a" stroke="#111"/>'),
lost:svg('<rect x="5" y="10" width="22" height="18" rx="3"/><path d="M11 10V7a5 5 0 0 1 10 0v3M12 19h8m-4-4v8"/>'),
pharmacy:svg('<path d="M11 4h10v7h7v10h-7v7H11v-7H4V11h7Z"/>'),
card:svg('<rect x="3" y="7" width="26" height="19" rx="3"/><path d="M3 13h26M8 20h6"/>')
};
const style=document.createElement('style');
style.id='elmaReferenceServices';
style.textContent=`
body.eg-reference-services{background:#fff!important}
body.eg-reference-services #elmaHomeWidgets{width:100%;max-width:520px;padding:env(safe-area-inset-top) 0 calc(110px + env(safe-area-inset-bottom));margin:0 auto;background:#fff}
#elmaHomeWidgets [data-panel="services"]{color:#09090a;font-family:-apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif}
#elmaHomeWidgets [data-panel="services"] .eg-screen-head{display:none}

.eg-reference-hero{width:100%;background:#fff}
.eg-reference-heading{padding:22px 6% 12px}
.eg-reference-heading h2{margin:0;font-size:clamp(32px,8.8vw,46px);font-weight:780;letter-spacing:-.055em;line-height:1.1}
.eg-reference-heading p{margin:5px 0 0;font-size:clamp(14px,3.7vw,19px);color:#626262;line-height:1.4}
.eg-bus-banner{position:relative;isolation:isolate;width:100%;min-height:clamp(160px,42vw,200px);overflow:hidden;background:#fff}
.eg-reference-story{position:relative;max-width:60%;padding:22px 0 25px;margin-left:6%;color:#09090a}
.eg-reference-story h3{white-space:pre-line;font-size:clamp(23px,6.1vw,30px);font-weight:750;letter-spacing:-.05em;line-height:1.05;margin:0 0 9px}
.eg-reference-story p{max-width:185px;margin:0;color:#595959;font-size:14px;line-height:1.4}
#elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:0 5%;border:0;border-radius:0;box-shadow:none;background:#fff}
#elmaHomeWidgets [data-panel="services"] .eg-service-card{position:relative;grid-column:auto;width:100%;min-width:0;min-height:90px;height:auto;display:grid;grid-template-columns:42px minmax(0,1fr) 19px;align-items:center;gap:9px;padding:17px 7px;border:0;border-radius:0;border-bottom:1px solid #f0f0f0;background:#fff;color:#09090a;text-align:left;box-shadow:none;font-family:inherit;cursor:pointer;touch-action:manipulation}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(odd){border-right:1px solid #f4f4f4;padding-right:10px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){padding-left:14px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:last-child{border-bottom:0}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-last-child(2):nth-child(odd){border-bottom:0}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:last-child:nth-child(odd){grid-column:1/-1;border-right:0}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:before{content:none}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:"›";display:grid;place-items:center;width:19px;height:19px;background:#f2f2f2;border-radius:50%;font-size:20px;line-height:1;font-weight:600;position:static}
#elmaHomeWidgets [data-panel="services"] .eg-service-icon{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;padding:9px!important;border:0!important;border-radius:50%!important;background:#f3f3f3!important;color:#080808!important;filter:none!important;box-shadow:none!important}
#elmaHomeWidgets [data-panel="services"] .eg-service-icon svg{display:block!important;width:100%!important;height:100%!important;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}
#elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:block;min-width:0}
#elmaHomeWidgets [data-panel="services"] .eg-service-name{display:block;font-size:clamp(11px,2.85vw,15px);font-weight:730;line-height:1.25;letter-spacing:-.05em;white-space:normal}
#elmaHomeWidgets [data-panel="services"] .eg-service-description{display:block;margin-top:3px;font-size:clamp(10px,2.4vw,13px);line-height:1.45;font-weight:400;letter-spacing:-.02em;color:#737373}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:2px solid #111;outline-offset:-2px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:active{background:#f7f7f7;transform:scale(.985)}
#elmaHomeWidgets [data-panel="services"] .eg-reference-notice{margin:10px 6%;padding:14px;border:1px solid #e6e6e6;border-radius:16px;font-size:14px;line-height:1.5;color:#555;background:#fafafa}
.eg-reference-notice[hidden]{display:none}
/* Floating navigation dock, shared across all app screens. */
body .elma-main-nav{position:fixed;z-index:880;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));width:auto;max-width:480px;height:74px;margin:0 auto;padding:6px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;border:1px solid #e8e8ec;border-radius:28px;background:rgba(255,255,255,.94);box-shadow:0 16px 38px #1113181c,0 2px 5px #1113180d;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
body .elma-main-tab{min-width:0;min-height:60px;padding:6px 2px 5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:0;border-radius:22px;background:transparent;color:#7b7e85;font-family:inherit;font-size:10px;font-weight:720;letter-spacing:-.015em;line-height:1.1;white-space:nowrap;transition:background .2s ease,color .2s ease,transform .2s ease,box-shadow .2s ease}
body .elma-main-tab svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s ease}
body .elma-main-tab.active{background:#17191d;color:#fff;font-weight:790;box-shadow:0 6px 14px #1113182b}
body .elma-main-tab.active svg{transform:translateY(-1px)}
body .elma-main-tab:active{transform:scale(.96)}
body .elma-main-tab:focus-visible{outline:2px solid #17191d;outline-offset:2px}
@media(max-width:350px){body .elma-main-nav{left:8px;right:8px;gap:2px;padding:5px}body .elma-main-tab{font-size:9px}}
@media(prefers-reduced-motion:reduce){body .elma-main-tab,body .elma-main-tab svg{transition:none!important}}
@media(min-width:480px){#elmaHomeWidgets [data-panel="services"] .eg-service-card{min-height:106px;grid-template-columns:48px minmax(0,1fr) 24px;gap:12px}#elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:48px!important;height:48px!important;padding:11px!important}}
@media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-service-card{grid-template-columns:30px minmax(0,1fr) 16px;gap:5px;padding:12px 4px}#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){padding-left:8px}#elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:30px!important;height:30px!important;padding:6px!important}}
html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:15px}
html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:14px}
@media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transform:none!important}}
/* Elma Go services: spacious editorial header, dark city feature and tactile tiles. */
body.eg-reference-services #elmaHomeWidgets{background:#fff!important}
#elmaHomeWidgets [data-panel="services"]{padding-bottom:20px}
.eg-reference-heading{padding:27px 6% 17px}
.eg-reference-heading h2{max-width:430px;font-size:clamp(32px,8.7vw,46px);font-weight:800;letter-spacing:-.065em;line-height:1.06}
.eg-reference-heading p{margin-top:9px;font-size:14px;color:#73767c;font-weight:500}
.eg-bus-banner{width:auto;min-height:190px;margin:0 6%;border-radius:28px;background:#111216;box-shadow:0 18px 40px rgba(12,13,17,.14)}
.eg-bus-banner{height:220px;background:#090b0f}
.eg-bus-scene{width:100%;height:220px;overflow:hidden}
.eg-bus-scene img{display:block;width:100%;height:100%;object-fit:cover;filter:none;animation:none}
.eg-reference-story{max-width:100%;margin-left:0;padding:25px 22px 24px;color:#fff;min-height:190px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}
.eg-reference-story .eg-feature-kicker{margin-bottom:15px;color:#bec1c7;font-size:10px;font-weight:800;letter-spacing:.14em}
.eg-reference-story h3{max-width:235px;margin:0 0 12px;font-size:clamp(24px,6vw,31px);font-weight:800;line-height:1.08;letter-spacing:-.055em}
.eg-reference-story p{max-width:220px;color:#d1d3d8;font-size:12px;line-height:1.5}
.eg-service-section-head{display:flex;justify-content:space-between;align-items:baseline;margin:31px 6% 14px}
.eg-service-section-head h3{margin:0;color:#121316;font-size:22px;font-weight:800;letter-spacing:-.05em}
.eg-service-section-head span{color:#858891;font-size:11px;font-weight:760;letter-spacing:.08em}
#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:11px;margin:0 6%;background:transparent}
#elmaHomeWidgets [data-panel="services"] .eg-service-card,#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(odd),#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even),#elmaHomeWidgets [data-panel="services"] .eg-service-card:last-child:nth-child(odd){grid-column:auto;min-height:145px;grid-template-columns:1fr auto;grid-template-rows:46px 1fr;gap:5px 4px;padding:15px;border:1px solid #ececef;border-radius:21px;background:#f7f7f8;box-shadow:none;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:after{grid-column:2;grid-row:1;width:25px;height:25px;background:#e9eaec;color:#32343a;font-size:21px}
#elmaHomeWidgets [data-panel="services"] .eg-service-icon{grid-column:1;grid-row:1;width:43px!important;height:43px!important;padding:10px!important;border-radius:13px!important;background:#fff!important;color:#16171a!important}
#elmaHomeWidgets [data-panel="services"] .eg-service-copy{grid-column:1/-1;grid-row:2;align-self:end}
#elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:14px;font-weight:800;letter-spacing:-.035em}
#elmaHomeWidgets [data-panel="services"] .eg-service-description{margin-top:5px;font-size:11px;line-height:1.35;color:#777a81}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:first-child{background:#1b1c20;border-color:#1b1c20;color:#fff}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:first-child .eg-service-icon{background:#383a40!important;color:#fff!important}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:first-child .eg-service-description{color:#bfc1c8}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:first-child:after{background:#383a40;color:#fff}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:active{transform:scale(.975);box-shadow:0 8px 20px #00000014}
@media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:8px}#elmaHomeWidgets [data-panel="services"] .eg-service-card{min-height:138px!important;padding:12px!important}#elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:12px}#elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:10px}}
@media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none}}
`;
document.head.appendChild(style);
let notice,grid,root,observer,timer;
function message(text){notice.textContent=text;notice.hidden=false;notice.scrollIntoView({block:'nearest',behavior:'smooth'})}
function make(key,title,description,handler){
const b=document.createElement('button');b.type='button';b.className='eg-service-card';b.dataset.referenceKey=key;
b.innerHTML='<span class="eg-service-icon" aria-hidden="true">'+icons[key]+'</span><span class="eg-service-copy"><span class="eg-service-name">'+title+'</span><span class="eg-service-description">'+description+'</span></span>';
b.onclick=handler;return b;
}
let cardServiceLoad,scheduleLoad;
function loadServicePageTheme(){
 if(document.querySelector('script[data-elma-service-theme]'))return;
 const script=document.createElement('script');script.src='service-page-theme.js?v=20260913-unified2';script.defer=true;script.dataset.elmaServiceTheme='1';document.head.appendChild(script);
}
function loadCardService(){
 if(window.elmaOpenCardService)return Promise.resolve();
 if(cardServiceLoad)return cardServiceLoad;
 cardServiceLoad=new Promise(resolve=>{const script=document.createElement('script');script.src='card-service.js?v=20260912-card-service2';script.defer=true;script.onload=resolve;script.onerror=resolve;document.head.appendChild(script)});
 return cardServiceLoad;
}
function loadScheduleCards(){
 if(scheduleLoad)return scheduleLoad;
 const sources=[['line-1-ui.js?v=20260830-past-contrast','1'],['line-2-ui.js?v=20260830-past-contrast','2'],['line-6-ui.js?v=20260830-line6','6']];
 scheduleLoad=Promise.all(sources.map(([src,line])=>new Promise(resolve=>{
  const existing=document.querySelector('script[data-elma-schedule-line="'+line+'"]');if(existing){resolve();return}
  const script=document.createElement('script');script.src=src;script.defer=true;script.dataset.elmaScheduleLine=line;script.onload=resolve;script.onerror=resolve;document.head.appendChild(script);
 })));
 return scheduleLoad;
}

function mount(){
root=document.querySelector('#elmaHomeWidgets [data-panel="services"]');if(!root){setTimeout(mount,100);return}
grid=root.querySelector('.eg-services-grid');if(!grid)return;loadServicePageTheme();
const hero=document.createElement('div');hero.className='eg-reference-hero';
hero.innerHTML='<header class="eg-reference-heading"><h2>Şehir, elinin altında.</h2><p>Günlük yolculuğun için ihtiyacın olan her şey.</p></header><div class="eg-bus-banner"><div class="eg-bus-scene" role="img" aria-label="Amasya’da soldan sağa ilerleyen otobüs animasyonu"><img src="assets/services-bus-stop.svg?v=20260918-scene1" alt="" width="800" height="400" decoding="async"></div></div>';
root.prepend(hero);
const sectionHead=document.createElement('div');sectionHead.className='eg-service-section-head';sectionHead.innerHTML='<h3>Keşfet</h3><span>ŞEHİR HİZMETLERİ</span>';grid.before(sectionHead);
notice=document.createElement('div');notice.className='eg-reference-notice';notice.hidden=true;notice.setAttribute('role','status');root.appendChild(notice);
const schedule=make('schedule','Sefer Saatleri','Güncel sefer saatlerini inceleyin.',()=>{const b=root.querySelector('[data-service-target="lines"]');if(b)b.click();else message('Hat bilgileri henüz yüklenmedi. Lütfen tekrar deneyin.')});
const news=make('news','Duyurular','Güncel duyuruları ve haberleri takip edin.',()=>message('Duyuru kaynağı henüz bağlanmadı. Güncel duyurular burada gösterilecek.'));
const card=make('card','Kart İşlemleri','Kart özellikleri yakında Elma Go’da.',()=>loadCardService().then(()=>{if(window.elmaOpenCardService)window.elmaOpenCardService();else message('Kart işlemleri yüklenemedi. Lütfen tekrar deneyin.')}));
grid.append(schedule,news,card);
// Keep the original lines action available to Sefer Saatleri, outside the visible grid.
const internalActions=document.createElement('div');internalActions.hidden=true;internalActions.style.display='none';root.appendChild(internalActions);
const linesPanel=document.querySelector('.eg-panel[data-panel="lines"]');
if(linesPanel&&!linesPanel.querySelector('.eg-list')){
 const heading=document.createElement('div');heading.className='eg-screen-head';heading.innerHTML='<h2 class="eg-screen-title">Sefer Saatleri</h2><p class="eg-screen-subtitle">Hat seçerek güncel kalkış saatlerini görüntüle.</p>';
 const list=document.createElement('div');list.className='eg-list';linesPanel.append(heading,list);
}
loadScheduleCards();loadCardService();
function refresh(){
observer?.disconnect();
const linesAction=root.querySelector('[data-service-target="lines"]');
if(linesAction&&linesAction.parentElement!==internalActions)internalActions.appendChild(linesAction);
// Estimated everyday use, not measured analytics.
const defs=[
[schedule,'schedule','Sefer Saatleri','Güncel sefer saatlerini inceleyin.'],
[card,'card','Kart İşlemleri','Kart özellikleri yakında Elma Go’da.'],
[root.querySelector('.eg-nearby-card'),'nearby','Yakındaki Duraklar','Size en yakın durakları bulun.'],
[root.querySelector('[data-service-target="routes"]'),'routes','Güzergâh','Hatların güzergâhlarını inceleyin.'],
[root.querySelector('.eg-pharmacy-card'),'pharmacy','Nöbetçi Eczane','Nöbetçi eczanelere ulaşın.'],
[root.querySelector('[data-service-target="weather"]'),'weather','Hava Durumu','Güncel hava durumu bilgileri.'],
[root.querySelector('.eg-lost-card'),'lost','Kayıp Eşya','Kayıp ve bulunan eşya ilanları.'],
[news,'news','Duyurular','Güncel duyuruları ve haberleri takip edin.']];
const ordered=[];
defs.forEach(([b,key,title,desc])=>{if(!b)return;ordered.push(b);if(b.dataset.referenceStyled)return;b.dataset.referenceStyled='1';b.innerHTML='<span class="eg-service-icon" aria-hidden="true">'+icons[key]+'</span><span class="eg-service-copy"><span class="eg-service-name">'+title+'</span><span class="eg-service-description">'+desc+'</span></span>';});

ordered.forEach((b,i)=>{if(grid.children[i]!==b)grid.insertBefore(b,grid.children[i]||null)});
document.body.classList.toggle('eg-reference-services',root.classList.contains('active'));
observer.observe(document.getElementById('elmaHomeWidgets'),{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
}
observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,30)});refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
