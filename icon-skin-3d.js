(()=>{
  if(window.__elma3dIconSkin)return;
  window.__elma3dIconSkin=true;

  const icons={
    nearby:'<svg viewBox="0 0 32 32"><circle cx="16" cy="14" r="4"/><path d="M16 29s9-8.3 9-17a9 9 0 1 0-18 0c0 8.7 9 17 9 17Z"/><path d="M3 26h6m14 0h6"/></svg>',
    lines:'<svg viewBox="0 0 32 32"><rect x="6" y="3" width="20" height="23" rx="6"/><path d="M10 9h12M9 16h14M11 26v3m10-3v3"/><circle cx="11" cy="21" r="1.5"/><circle cx="21" cy="21" r="1.5"/></svg>',
    routes:'<svg viewBox="0 0 32 32"><circle cx="7" cy="24" r="3"/><circle cx="25" cy="8" r="3"/><path d="M10 23c2-7 8-2 11-8 1.2-2.4 2.1-3.2 2.7-3.8"/><path d="m20.5 7.8 4.5.2-.6 4.4"/></svg>',
    weather:'<svg viewBox="0 0 32 32"><path d="M10 24h13a5 5 0 0 0 .6-10A8 8 0 0 0 8.8 12.5 5.8 5.8 0 0 0 10 24Z"/><path d="M8 7 6 5m10 0V2M5 15H2"/></svg>',
    lost:'<svg viewBox="0 0 32 32"><path d="M8 10h16v17H8z"/><path d="M12 10V8a4 4 0 0 1 8 0v2m-4 5v5"/><circle cx="16" cy="24" r="1"/></svg>',
    pharmacy:'<svg viewBox="0 0 32 32"><path d="M12 4h8v8h8v8h-8v8h-8v-8H4v-8h8z"/></svg>'
  };

  const style=document.createElement('style');
  style.id='elmaServicesLayout';
  style.textContent=`
    #elmaHomeWidgets [data-panel="services"]{--svc-ink:#f7f7fa;--svc-muted:#9699a4;--svc-card:#14151a;--svc-line:#282a32;--svc-soft:#20222a;padding-bottom:18px}
    html[data-theme="light"] #elmaHomeWidgets [data-panel="services"]{--svc-ink:#101116;--svc-muted:#717580;--svc-card:#fff;--svc-line:#e7e8ec;--svc-soft:#f0f1f4}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{position:relative;padding:8px 2px 2px}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head:before{content:"ŞEHRİN CEBİNDE";display:inline-flex;align-items:center;min-height:27px;margin-bottom:15px;padding:0 10px;border:1px solid var(--svc-line);border-radius:99px;color:var(--svc-muted);font-size:.65rem;font-weight:850;letter-spacing:.12em}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{margin:0;color:var(--svc-ink);font-size:2.8rem;line-height:.9;letter-spacing:-.085em}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{max-width:350px;margin:15px 0 0;color:var(--svc-muted);font-size:1rem;font-weight:560;line-height:1.42}
    #elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:11px!important;margin-top:28px!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card{--tone:#8b90a0;--tone-soft:#22242c;position:relative;isolation:isolate;min-width:0!important;min-height:164px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;gap:18px!important;padding:17px!important;overflow:hidden;text-align:left!important;border:1px solid var(--svc-line)!important;border-radius:24px!important;background:linear-gradient(155deg,color-mix(in srgb,var(--tone) 7%,var(--svc-card)),var(--svc-card) 56%)!important;color:var(--svc-ink)!important;box-shadow:0 14px 32px rgba(0,0,0,.08)!important;cursor:pointer;transition:transform .22s cubic-bezier(.2,.8,.2,1),border-color .18s ease,box-shadow .22s ease}
    html[data-theme="light"] #elmaHomeWidgets [data-panel="services"] .eg-service-card{--tone-soft:color-mix(in srgb,var(--tone) 13%,#fff);box-shadow:0 12px 34px rgba(26,29,38,.055)!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:before{content:attr(data-service-index);position:absolute;right:15px;top:15px;color:var(--svc-muted);font-size:.62rem;font-weight:880;letter-spacing:.1em}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:"↗";position:absolute;right:14px;bottom:14px;width:29px;height:29px;display:grid;place-items:center;border:1px solid var(--svc-line);border-radius:50%;color:var(--svc-muted);font-size:.95rem;font-weight:700}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:50px!important;height:50px!important;display:grid!important;place-items:center!important;flex:0 0 50px;padding:12px!important;border:1px solid color-mix(in srgb,var(--tone) 20%,transparent)!important;border-radius:17px!important;background:var(--tone-soft)!important;background-image:none!important;color:var(--tone)!important;filter:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{display:block!important;width:100%!important;height:100%!important;fill:none!important;stroke:currentColor!important;stroke-width:1.65!important;stroke-linecap:round!important;stroke-linejoin:round!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:flex;min-width:0;padding-right:28px;flex-direction:column;gap:6px;align-items:flex-start}
    #elmaHomeWidgets [data-panel="services"] .eg-service-name{color:var(--svc-ink)!important;font-size:1.03rem!important;font-weight:790!important;line-height:1.12!important;letter-spacing:-.035em!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-description{display:block!important;max-width:150px;color:var(--svc-muted)!important;font-size:.74rem!important;font-weight:520!important;line-height:1.38!important}
    #elmaHomeWidgets [data-panel="services"] [data-service-key="lines"]{--tone:#5d8cff}
    #elmaHomeWidgets [data-panel="services"] [data-service-key="routes"]{--tone:#ff765f}
    #elmaHomeWidgets [data-panel="services"] [data-service-key="weather"]{--tone:#3ec6e0}
    #elmaHomeWidgets [data-panel="services"] [data-service-key="lost"]{--tone:#a883ff}
    #elmaHomeWidgets [data-panel="services"] [data-service-key="pharmacy"]{--tone:#ff5e78}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"]{--tone:#86a7ff;grid-column:1/-1!important;min-height:190px!important;padding:22px!important;background:radial-gradient(circle at 82% 12%,rgba(75,117,255,.44),transparent 34%),radial-gradient(circle at 72% 100%,rgba(117,79,255,.28),transparent 38%),linear-gradient(145deg,#151823,#07080c 72%)!important;color:#fff!important;border-color:#292e40!important;box-shadow:0 22px 48px rgba(5,8,18,.24)!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"]:before{content:"CANLI • 01";color:#aebbdc}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"]:after{content:"→";right:20px;bottom:20px;width:42px;height:42px;border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.1);color:#fff;font-size:1.25rem;backdrop-filter:blur(10px)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"] .eg-service-icon{width:56px!important;height:56px!important;background:rgba(255,255,255,.12)!important;color:#b9c8ff!important;border-color:rgba(255,255,255,.16)!important;backdrop-filter:blur(12px)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"] .eg-service-name{color:#fff!important;font-size:1.55rem!important;letter-spacing:-.055em!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"] .eg-service-description{max-width:250px;color:#aeb3c1!important;font-size:.82rem!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="weather"]{grid-column:1/-1!important;min-height:112px!important;display:grid!important;grid-template-columns:50px minmax(0,1fr) 30px!important;align-items:center!important;gap:14px!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="weather"]:before{display:none}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="weather"]:after{position:static;grid-column:3;grid-row:1;width:29px;height:29px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="weather"] .eg-service-copy{grid-column:2;grid-row:1;padding-right:0}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="weather"] .eg-service-description{max-width:none}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:2px solid var(--svc-ink);outline-offset:3px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active{transform:scale(.975)!important}
    @media(hover:hover){#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--tone) 44%,var(--svc-line))!important;box-shadow:0 18px 42px rgba(0,0,0,.12)!important}}
    @media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:8px!important}#elmaHomeWidgets [data-panel="services"] .eg-service-card{min-height:154px!important;padding:14px!important;border-radius:21px!important}#elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:.7rem!important}}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-services-grid{grid-template-columns:1fr!important}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-card{grid-column:1!important}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none!important}}
  `;
  document.head.appendChild(style);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');if(!grid)return;
    const subtitle=grid.closest('[data-panel="services"]')?.querySelector('.eg-screen-subtitle');
    if(subtitle)subtitle.textContent='Ulaşım, hava ve şehir araçları tek yerde.';
    const definitions=[
      ['[data-service-target="nearby-stops"]','nearby','Yakındaki Duraklar','En yakın durağı ve geçen hatları bul'],
      ['[data-service-target="lines"]','lines','Hatlar','Sefer saatleri ve hat bilgileri'],
      ['[data-service-target="routes"]','routes','Güzergâhlar','Durakları harita üzerinde incele'],
      ['[data-service-target="weather"]','weather','Hava Durumu','Güncel durum ve üç günlük tahmin'],
      ['.eg-lost-card','lost','Kayıp & Buluntu','Kayıp ilanlarına göz at veya ilan ver'],
      ['.eg-pharmacy-card','pharmacy','Nöbetçi Eczane','Bugün açık eczaneleri yakında bul']
    ],ordered=[];
    definitions.forEach(([selector,key,title,description],index)=>{
      const card=grid.querySelector(selector);if(!card)return;ordered.push(card);
      card.dataset.serviceKey=key;card.dataset.serviceIndex=String(index+1).padStart(2,'0');
      card.setAttribute('aria-label',title+'. '+description);
      const holder=card.querySelector('.eg-service-icon'),name=card.querySelector('.eg-service-name');
      if(holder&&holder.dataset.serviceIcon!==key){holder.dataset.serviceIcon=key;holder.innerHTML=icons[key];holder.setAttribute('aria-hidden','true')}
      if(!name)return;name.textContent=title;
      let copy=card.querySelector('.eg-service-copy');
      if(!copy){copy=document.createElement('span');copy.className='eg-service-copy';name.before(copy);copy.appendChild(name)}
      let detail=copy.querySelector('.eg-service-description');
      if(!detail){detail=document.createElement('span');detail.className='eg-service-description';copy.appendChild(detail)}
      detail.textContent=description;
    });
    ordered.forEach((card,index)=>{if(grid.children[index]!==card)grid.insertBefore(card,grid.children[index]||null)});
  }
  let timer=0,tries=0;
  function mount(){
    const widgets=document.getElementById('elmaHomeWidgets');
    if(!widgets){if(++tries<80)setTimeout(mount,100);return}
    refineServices();
    new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(refineServices,20)}).observe(widgets,{subtree:true,childList:true});
  }
  mount();
})();
