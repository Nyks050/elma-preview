(()=>{
'use strict';
if(window.__elmaReferenceServices)return;
window.__elmaReferenceServices=true;
const svg=body=>'<svg viewBox="0 0 32 32" aria-hidden="true">'+body+'</svg>';
const icons={
schedule:svg('<circle cx="16" cy="16" r="12"/><path d="m16 9 0 7 5-5M16 4v2"/>'),
lines:svg('<rect x="7" y="4" width="18" height="22" rx="4"/><path d="M10 9h12v8H10zM10 26v3m12-3v3M11 22h1m8 0h1"/>'),
ticket:svg('<path d="m5 20 15-15 4 4a3 3 0 0 0 4 4l-15 15-4-4a3 3 0 0 0-4-4Z"/><path d="m14 12 6 6"/>'),
nearby:svg('<path d="M14 4v3m0 7v4m0 7v4M6 7h17l5 4-5 4H6v-8Zm18 11H7l-4 4 4 4h17v-8"/>'),
routes:svg('<path d="m4 7 8-3 8 3 8-3v21l-8 3-8-3-8 3V7Zm8-3v21m8-18v21"/>'),
weather:svg('<circle cx="22" cy="11" r="5"/><path d="M22 2v2m7 7h2m-9 7v2M15 4l2 2m10 10 2 2m0-14-2 2M8 27h15a5 5 0 0 0 0-10 7 7 0 0 0-13-2 6 6 0 0 0-2 12Z"/>'),
news:svg('<path d="M7 23h18l-3-5v-6a6 6 0 0 0-12 0v6l-3 5Zm6 4a3 3 0 0 0 6 0"/><circle cx="24" cy="7" r="4" fill="#e51d2a" stroke="#111"/>'),
card:svg('<rect x="3" y="7" width="26" height="19" rx="3"/><path d="M3 13h26M8 20h6"/>')
};
const style=document.createElement('style');
style.id='elmaReferenceServices';
style.textContent=`
body.eg-reference-services{background:#fff!important}
body.eg-reference-services #elmaHomeWidgets{width:100%;max-width:520px;padding:env(safe-area-inset-top) 0 calc(110px + env(safe-area-inset-bottom));margin:0 auto;background:#fff}
#elmaHomeWidgets [data-panel="services"]{color:#09090a;font-family:-apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif}
#elmaHomeWidgets [data-panel="services"] .eg-screen-head{display:none}
.eg-reference-hero{position:relative;width:100%;aspect-ratio:1/1.04;isolation:isolate;overflow:hidden;background:#fff}
.eg-reference-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;z-index:-1}
.eg-reference-heading{padding:30px 6% 0}
.eg-reference-heading h2{margin:0;font-size:clamp(32px,8.8vw,46px);font-weight:780;letter-spacing:-.055em;line-height:1.1}
.eg-reference-heading p{margin:5px 0 0;font-size:clamp(14px,3.7vw,19px);color:#626262;letter-spacing:.005em;line-height:1.4}
.eg-reference-story{position:absolute;top:35%;left:6.5%;width:45%}
.eg-reference-story h3{font-size:clamp(23px,6.1vw,32px);font-weight:750;letter-spacing:-.055em;line-height:1.03;margin:0 0 9px}
.eg-reference-story p{margin:0;color:#595959;font-size:clamp(13px,3.25vw,17px);line-height:1.4;letter-spacing:-.025em}
#elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:0 5%;border:0;border-radius:0;box-shadow:none;background:#fff}
#elmaHomeWidgets [data-panel="services"] .eg-service-card{position:relative;grid-column:auto;width:100%;min-width:0;min-height:78px;height:auto;display:grid;grid-template-columns:38px minmax(0,1fr) 19px;align-items:center;gap:9px;padding:14px 7px;border:0;border-radius:0;border-bottom:1px solid #f0f0f0;background:#fff;color:#09090a;text-align:left;box-shadow:none;font-family:inherit;cursor:pointer;touch-action:manipulation}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(odd){border-right:1px solid #f4f4f4;padding-right:10px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){padding-left:14px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(n+7){border-bottom:0}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:before{content:none}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:"›";display:grid;place-items:center;width:19px;height:19px;background:#f2f2f2;border-radius:50%;font-size:20px;line-height:1;font-weight:600;position:static}
#elmaHomeWidgets [data-panel="services"] .eg-service-icon{display:grid!important;place-items:center!important;width:38px!important;height:38px!important;padding:9px!important;border:0!important;border-radius:50%!important;background:#f3f3f3!important;color:#080808!important;filter:none!important;box-shadow:none!important}
#elmaHomeWidgets [data-panel="services"] .eg-service-icon svg{display:block!important;width:100%!important;height:100%!important;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none}
#elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:block;min-width:0}
#elmaHomeWidgets [data-panel="services"] .eg-service-name{display:block;font-size:clamp(10px,2.55vw,14px);font-weight:730;line-height:1.25;letter-spacing:-.05em;white-space:normal}
#elmaHomeWidgets [data-panel="services"] .eg-service-description{display:block;margin-top:3px;font-size:clamp(9px,2.2vw,12px);line-height:1.45;font-weight:400;letter-spacing:-.02em;color:#737373}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:2px solid #111;outline-offset:-2px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:active{background:#f7f7f7;transform:scale(.985)}
.eg-reference-other{margin:12px 6%;color:#696969;font-size:12px}
.eg-reference-other summary{padding:10px 0;cursor:pointer}
.eg-reference-other-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
#elmaHomeWidgets [data-panel="services"] .eg-reference-other .eg-service-card{border:0;padding:10px 4px}
.eg-reference-notice{margin:10px 6%;padding:14px;border:1px solid #e6e6e6;border-radius:16px;font-size:14px;line-height:1.5;color:#555;background:#fafafa}
.eg-reference-notice[hidden]{display:none}
body.eg-reference-services .elma-main-nav{left:4%;right:4%;bottom:calc(12px + env(safe-area-inset-bottom));height:66px;max-width:480px;padding:4px 8px;border:1px solid #f8f8f8;border-radius:40px;box-shadow:0 6px 20px #00000012;background:#ffffffed;backdrop-filter:blur(18px)}
body.eg-reference-services .elma-main-tab{font-family:inherit;border-radius:32px;font-size:11px;line-height:1.2;gap:4px;font-weight:600;color:#737373}
body.eg-reference-services .elma-main-tab svg{width:23px;height:23px;stroke-width:1.9}
body.eg-reference-services .elma-main-tab.active{background:#f4f4f4;color:#080808;font-weight:700}
@media(min-width:480px){#elmaHomeWidgets [data-panel="services"] .eg-service-card{min-height:96px;grid-template-columns:48px minmax(0,1fr) 24px;gap:12px}#elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:48px!important;height:48px!important;padding:11px!important}}
@media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-service-card{grid-template-columns:30px minmax(0,1fr) 16px;gap:5px;padding:12px 4px}#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){padding-left:8px}#elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:30px!important;height:30px!important;padding:6px!important}}
html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:15px}
html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:14px}
@media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transform:none!important}}
`;
document.head.appendChild(style);
let notice,grid,other,root,observer,timer;
function message(text){notice.textContent=text;notice.hidden=false;notice.scrollIntoView({block:'nearest',behavior:'smooth'})}
function make(key,title,description,handler){
const b=document.createElement('button');b.type='button';b.className='eg-service-card';b.dataset.referenceKey=key;
b.innerHTML='<span class="eg-service-icon" aria-hidden="true">'+icons[key]+'</span><span class="eg-service-copy"><span class="eg-service-name">'+title+'</span><span class="eg-service-description">'+description+'</span></span>';
b.onclick=handler;return b;
}
function mount(){
root=document.querySelector('#elmaHomeWidgets [data-panel="services"]');if(!root){setTimeout(mount,100);return}
grid=root.querySelector('.eg-services-grid');if(!grid)return;
const hero=document.createElement('div');hero.className='eg-reference-hero';
hero.innerHTML='<img src="assets/amasya-services-hero.webp" alt="" fetchpriority="high" width="1100" height="1100"><header class="eg-reference-heading"><h2>Hizmetler</h2><p>Şehir araçları, tek merkezde.</p></header><div class="eg-reference-story"><h3>Şehir seninle<br>daha kolay</h3><p>Tarihiyle, doğasıyla,<br>her yolculuk sana<br>daha yakın.</p></div>';
root.prepend(hero);
const extras=document.createElement('details');extras.className='eg-reference-other';extras.innerHTML='<summary>Diğer hizmetler</summary><div class="eg-reference-other-grid"></div>';root.appendChild(extras);other=extras.lastElementChild;
notice=document.createElement('div');notice.className='eg-reference-notice';notice.hidden=true;notice.setAttribute('role','status');root.appendChild(notice);
const schedule=make('schedule','Sefer Saatleri','Güncel sefer saatlerini inceleyin.',()=>{const b=root.querySelector('[data-service-target="lines"]');if(b)b.click();else message('Hat bilgileri henüz yüklenmedi. Lütfen tekrar deneyin.')});
const ticket=make('ticket','Bilet İşlemleri','Bilet al, yükleme yap, işlemlerini yönet.',()=>message('Bilet satın alma ve yükleme hizmeti henüz Elma Go’ya bağlanmadı.'));
const routes=make('routes','Rota Planla','Gitmek istediğiniz yere en iyi rotayı bulun.',()=>{if(window.elmaOpenSearch)window.elmaOpenSearch();else message('Rota planlama henüz yüklenmedi. Lütfen tekrar deneyin.')});
const news=make('news','Duyurular','Güncel duyuruları ve haberleri takip edin.',()=>message('Duyuru kaynağı henüz bağlanmadı. Güncel duyurular burada gösterilecek.'));
const card=make('card','Kart İşlemleri','Ulaşım kartı işlemlerinizi kolayca yönetin.',()=>message('Ulaşım kartı yönetimi henüz Elma Go’ya bağlanmadı.'));
grid.append(schedule,ticket,routes,news,card);
function refresh(){
observer?.disconnect();
const defs=[
[schedule,'schedule','Sefer Saatleri','Güncel sefer saatlerini inceleyin.'],
[root.querySelector('[data-service-target="lines"]'),'lines','Hatlar','Tüm hat bilgilerini görüntüleyin.'],
[ticket,'ticket','Bilet İşlemleri','Bilet al, yükleme yap, işlemlerini yönet.'],
[root.querySelector('.eg-nearby-card'),'nearby','Yakındaki Duraklar','Size en yakın durakları bulun.'],
[routes,'routes','Rota Planla','Gitmek istediğiniz yere en iyi rotayı bulun.'],
[root.querySelector('[data-service-target="weather"]'),'weather','Hava Durumu','Güncel hava durumu bilgileri.'],
[news,'news','Duyurular','Güncel duyuruları ve haberleri takip edin.'],
[card,'card','Kart İşlemleri','Ulaşım kartı işlemlerinizi kolayca yönetin.']];
const ordered=[];
defs.forEach(([b,key,title,desc])=>{if(!b)return;ordered.push(b);if(b.dataset.referenceStyled)return;b.dataset.referenceStyled='1';b.innerHTML='<span class="eg-service-icon" aria-hidden="true">'+icons[key]+'</span><span class="eg-service-copy"><span class="eg-service-name">'+title+'</span><span class="eg-service-description">'+desc+'</span></span>';});
[...grid.children].filter(b=>!ordered.includes(b)).forEach(b=>other.appendChild(b));
ordered.forEach((b,i)=>{if(grid.children[i]!==b)grid.insertBefore(b,grid.children[i]||null)});
document.body.classList.toggle('eg-reference-services',root.classList.contains('active'));
observer.observe(document.getElementById('elmaHomeWidgets'),{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
}
observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refresh,30)});refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();