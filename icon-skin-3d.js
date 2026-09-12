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
.eg-city-track{display:flex;width:100%;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}
.eg-city-track::-webkit-scrollbar{display:none}
.eg-city-slide{position:relative;isolation:isolate;flex:0 0 100%;min-width:0;min-height:clamp(160px,42vw,200px);scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden;background:#fff}
.eg-city-slide>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1);z-index:-2}
.eg-city-slide:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 27%,rgba(255,255,255,.82) 43%,rgba(255,255,255,0) 74%),linear-gradient(0deg,#fff,rgba(255,255,255,0) 25%)}
.eg-reference-story{position:relative;max-width:60%;padding:22px 0 25px;margin-left:6%;color:#09090a}
.eg-reference-story h3{white-space:pre-line;font-size:clamp(23px,6.1vw,30px);font-weight:750;letter-spacing:-.05em;line-height:1.05;margin:0 0 9px}
.eg-reference-story p{max-width:185px;margin:0;color:#595959;font-size:14px;line-height:1.4}
.eg-city-controls{display:flex;align-items:center;justify-content:center;gap:7px;min-height:38px;margin:0 6% 4px}
.eg-city-controls[hidden]{display:none}
.eg-city-controls button{border:0;display:grid;place-items:center;background:transparent;min-width:32px;min-height:32px;padding:6px;color:#181818;cursor:pointer;border-radius:50%}
.eg-city-controls .eg-city-prev,.eg-city-controls .eg-city-next{font-size:22px;line-height:1}
.eg-city-dot:before{content:"";width:6px;height:6px;background:#c6c6c6;border-radius:50%}
.eg-city-dot[aria-pressed="true"]:before{width:18px;border-radius:4px;background:#181818}
.eg-city-controls button:focus-visible,.eg-city-track:focus-visible{outline:2px solid #111;outline-offset:-2px}
.eg-city-controls button:disabled{opacity:.25;cursor:default}
#elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;margin:0 5%;border:0;border-radius:0;box-shadow:none;background:#fff}
#elmaHomeWidgets [data-panel="services"] .eg-service-card{position:relative;grid-column:auto;width:100%;min-width:0;min-height:90px;height:auto;display:grid;grid-template-columns:42px minmax(0,1fr) 19px;align-items:center;gap:9px;padding:17px 7px;border:0;border-radius:0;border-bottom:1px solid #f0f0f0;background:#fff;color:#09090a;text-align:left;box-shadow:none;font-family:inherit;cursor:pointer;touch-action:manipulation}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(odd){border-right:1px solid #f4f4f4;padding-right:10px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){padding-left:14px}
#elmaHomeWidgets [data-panel="services"] .eg-service-card:last-child{border-bottom:0}
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
body.eg-reference-services .elma-main-nav{left:4%;right:4%;bottom:calc(12px + env(safe-area-inset-bottom));height:66px;max-width:480px;padding:4px 8px;border:1px solid #f8f8f8;border-radius:40px;box-shadow:0 6px 20px #00000012;background:#ffffffed;backdrop-filter:blur(18px)}
body.eg-reference-services .elma-main-tab{font-family:inherit;border-radius:32px;font-size:11px;line-height:1.2;gap:4px;font-weight:600;color:#737373}
body.eg-reference-services .elma-main-tab svg{width:23px;height:23px;stroke-width:1.9}
body.eg-reference-services .elma-main-tab.active{background:#f4f4f4;color:#080808;font-weight:700}
@media(min-width:480px){#elmaHomeWidgets [data-panel="services"] .eg-service-card{min-height:106px;grid-template-columns:48px minmax(0,1fr) 24px;gap:12px}#elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:48px!important;height:48px!important;padding:11px!important}}
@media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-service-card{grid-template-columns:30px minmax(0,1fr) 16px;gap:5px;padding:12px 4px}#elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){padding-left:8px}#elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:30px!important;height:30px!important;padding:6px!important}}
html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:15px}
html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:14px}
@media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transform:none!important}}
`;
document.head.appendChild(style);
let notice,grid,root,observer,timer;
function message(text){notice.textContent=text;notice.hidden=false;notice.scrollIntoView({block:'nearest',behavior:'smooth'})}
function make(key,title,description,handler){
const b=document.createElement('button');b.type='button';b.className='eg-service-card';b.dataset.referenceKey=key;
b.innerHTML='<span class="eg-service-icon" aria-hidden="true">'+icons[key]+'</span><span class="eg-service-copy"><span class="eg-service-name">'+title+'</span><span class="eg-service-description">'+description+'</span></span>';
b.onclick=handler;return b;
}

function setupCityBanner(hero){
 const defaults=[{"title":"Şehir seninle\ndaha kolay","description":"Tarihiyle, doğasıyla, her yolculuk sana daha yakın.","image":"assets/amasya-photo-1.webp","alt":"Amasya Yalıboyu evleri, Yeşilırmak ve kayalık yamaçlar","position":"center 57%","source":"https://commons.wikimedia.org/wiki/File:Amasya_evleri_ve_Ye%C5%9Fil%C4%B1rmak.jpg","author":"Cobija"},{"title":"Amasya'yı\nyeniden keşfet","description":"Yeşilırmak kıyısından şehrin sokaklarına.","image":"assets/amasya-photo-2.webp","alt":"Yeşilırmak'a yansıyan Amasya evleri ve saat kulesi","position":"center 52%","source":"https://commons.wikimedia.org/wiki/File:Amasya_evleri_ve_Ye%C5%9Fil%C4%B1rmak_(2).jpg","author":"Cobija"}];
 const track=hero.querySelector('.eg-city-track'),controls=hero.querySelector('.eg-city-controls');
 let current=0,buttons=[],prev,next,pages=[],scrollFrame=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.reduceMotion==='true';
 function go(index){if(!pages.length)return;const bounded=Math.max(0,Math.min(index,pages.length-1));track.scrollTo({left:bounded*track.clientWidth,behavior:reduced()?'auto':'smooth'});}
 function sync(){if(!track.clientWidth)return;current=Math.max(0,Math.min(pages.length-1,Math.round(track.scrollLeft/track.clientWidth)));buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));prev.disabled=current===0;next.disabled=current===pages.length-1;}
 function render(items){
  pages=items;current=0;track.replaceChildren();controls.replaceChildren();
  items.forEach((item,i)=>{
   const slide=document.createElement('article');slide.className='eg-city-slide';slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slayt');slide.setAttribute('aria-label',(i+1)+' / '+items.length);
   const image=document.createElement('img');image.src=item.image;image.alt=item.alt||'Amasya';image.width=1200;image.height=900;image.loading=i===0?'eager':'lazy';image.decoding='async';image.style.objectPosition=item.position||'center';
   image.onerror=()=>{image.hidden=true;};
   const text=document.createElement('div');text.className='eg-reference-story';const heading=document.createElement('h3');heading.textContent=item.title;const copy=document.createElement('p');copy.textContent=item.description;text.append(heading,copy);slide.append(image,text);track.appendChild(slide);
  });
  function control(label,text,handler){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.textContent=text;b.onclick=handler;return b;}
  prev=control('Önceki görsel','‹',()=>go(current-1));prev.className='eg-city-prev';controls.appendChild(prev);
  buttons=items.map((item,i)=>{const b=control((i+1)+'. görsel: '+item.title.replace(/\n/g,' '),'',()=>go(i));b.className='eg-city-dot';b.setAttribute('aria-pressed',String(i===0));controls.appendChild(b);return b});
  next=control('Sonraki görsel','›',()=>go(current+1));next.className='eg-city-next';controls.appendChild(next);controls.hidden=items.length<2;
  track.scrollLeft=0;prev.disabled=true;next.disabled=items.length<2;
 }
 track.addEventListener('scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(sync)},{passive:true});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();go(current+1)}if(event.key==='ArrowLeft'){event.preventDefault();go(current-1)}});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(track.clientWidth)track.scrollTo({left:current*track.clientWidth,behavior:'auto'})}).observe(track);
 render(defaults);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);
 fetch('services-banners.json',{cache:'no-cache',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Banner content unavailable');return r.json()}).then(items=>{
  if(!Array.isArray(items)||!items.length)return;
  const valid=items.filter(item=>item&&typeof item.title==='string'&&typeof item.description==='string'&&typeof item.image==='string'&&/^assets\/[\w./-]+$/.test(item.image)&&typeof item.source==='string'&&item.source.startsWith('https://commons.wikimedia.org/')&&typeof item.author==='string');
  if(valid.length&&JSON.stringify(valid)!==JSON.stringify(defaults))render(valid);
 }).catch(()=>{}).finally(()=>clearTimeout(timeout));
}

function mount(){
root=document.querySelector('#elmaHomeWidgets [data-panel="services"]');if(!root){setTimeout(mount,100);return}
grid=root.querySelector('.eg-services-grid');if(!grid)return;
const hero=document.createElement('div');hero.className='eg-reference-hero';
hero.innerHTML='<header class="eg-reference-heading"><h2>Hizmetler</h2><p>Şehir araçları, tek merkezde.</p></header><div class="eg-city-track" tabindex="0" role="region" aria-roledescription="karusel" aria-label="Amasya fotoğrafları"></div><div class="eg-city-controls" aria-label="Banner seçimi"></div>';
setupCityBanner(hero);
root.prepend(hero);
notice=document.createElement('div');notice.className='eg-reference-notice';notice.hidden=true;notice.setAttribute('role','status');root.appendChild(notice);
const schedule=make('schedule','Sefer Saatleri','Güncel sefer saatlerini inceleyin.',()=>{const b=root.querySelector('[data-service-target="lines"]');if(b)b.click();else message('Hat bilgileri henüz yüklenmedi. Lütfen tekrar deneyin.')});
const news=make('news','Duyurular','Güncel duyuruları ve haberleri takip edin.',()=>message('Duyuru kaynağı henüz bağlanmadı. Güncel duyurular burada gösterilecek.'));
const card=make('card','Kart İşlemleri','Ulaşım kartı işlemlerinizi kolayca yönetin.',()=>message('Ulaşım kartı yönetimi henüz Elma Go’ya bağlanmadı.'));
grid.append(schedule,news,card);
function refresh(){
observer?.disconnect();
const defs=[
[schedule,'schedule','Sefer Saatleri','Güncel sefer saatlerini inceleyin.'],
[root.querySelector('[data-service-target="lines"]'),'lines','Hatlar','Tüm hat bilgilerini görüntüleyin.'],
[root.querySelector('.eg-lost-card'),'lost','Kayıp Eşya','Kayıp ve bulunan eşya ilanları.'],
[root.querySelector('.eg-nearby-card'),'nearby','Yakındaki Duraklar','Size en yakın durakları bulun.'],
[root.querySelector('.eg-pharmacy-card'),'pharmacy','Nöbetçi Eczane','Nöbetçi eczanelere ulaşın.'],
[root.querySelector('[data-service-target="routes"]'),'routes','Güzergâh','Hatların güzergâhlarını inceleyin.'],
[root.querySelector('[data-service-target="weather"]'),'weather','Hava Durumu','Güncel hava durumu bilgileri.'],
[news,'news','Duyurular','Güncel duyuruları ve haberleri takip edin.'],
[card,'card','Kart İşlemleri','Ulaşım kartı işlemlerinizi kolayca yönetin.']];
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
