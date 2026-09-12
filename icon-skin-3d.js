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
    #elmaHomeWidgets [data-panel="services"]{--svc-ink:#f7f7f5;--svc-muted:#9a9da4;--svc-card:#151518;--svc-line:#292a2f;--svc-accent:#d8ff46;--svc-accent-ink:#0a0b08;--svc-soft:#222329;padding-bottom:14px}
    html[data-theme="light"] #elmaHomeWidgets [data-panel="services"]{--svc-ink:#111216;--svc-muted:#696d75;--svc-card:#fff;--svc-line:#e5e6e9;--svc-accent:#c9f33d;--svc-accent-ink:#111407;--svc-soft:#f1f2f4}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{padding:9px 1px 0}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head:before{content:"ELMA GO / ŞEHİR";display:block;margin-bottom:12px;color:var(--svc-muted);font-size:.72rem;font-weight:820;letter-spacing:.13em}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{margin:0;color:var(--svc-ink);font-size:2.55rem;line-height:.94;letter-spacing:-.075em}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{max-width:330px;margin:13px 0 0;color:var(--svc-muted);font-size:.98rem;font-weight:540;line-height:1.42}
    #elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-top:26px!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card{position:relative;isolation:isolate;min-width:0!important;min-height:158px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;gap:16px!important;padding:16px!important;overflow:hidden;text-align:left!important;border:1px solid var(--svc-line)!important;border-radius:20px!important;background:var(--svc-card)!important;color:var(--svc-ink)!important;box-shadow:none!important;cursor:pointer;transition:transform .18s ease,border-color .18s ease}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:before{content:attr(data-service-index);position:absolute;right:13px;top:12px;color:var(--svc-muted);font-size:.65rem;font-weight:850;letter-spacing:.08em}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:"";position:absolute;right:-32px;bottom:-48px;width:104px;height:104px;border:1px solid color-mix(in srgb,var(--svc-muted) 18%,transparent);border-radius:50%;box-shadow:0 0 0 18px color-mix(in srgb,var(--svc-muted) 5%,transparent);z-index:-1}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon{width:48px!important;height:48px!important;display:grid!important;place-items:center!important;flex:0 0 48px;padding:11px!important;border:0!important;border-radius:15px!important;background:var(--svc-soft)!important;background-image:none!important;color:var(--svc-ink)!important;filter:none!important;box-shadow:none!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{display:block!important;width:100%!important;height:100%!important;fill:none!important;stroke:currentColor!important;stroke-width:1.65!important;stroke-linecap:round!important;stroke-linejoin:round!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:flex;min-width:0;flex-direction:column;gap:5px;align-items:flex-start}
    #elmaHomeWidgets [data-panel="services"] .eg-service-name{color:var(--svc-ink)!important;font-size:1rem!important;font-weight:780!important;line-height:1.12!important;letter-spacing:-.025em!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-description{display:block!important;max-width:145px;color:var(--svc-muted)!important;font-size:.75rem!important;font-weight:520!important;line-height:1.35!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"]{grid-column:1/-1!important;min-height:168px!important;padding:20px!important;background:var(--svc-accent)!important;color:var(--svc-accent-ink)!important;border-color:transparent!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"]:before{color:color-mix(in srgb,var(--svc-accent-ink) 58%,transparent)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"]:after{right:-15px;bottom:-60px;width:150px;height:150px;border-color:color-mix(in srgb,var(--svc-accent-ink) 14%,transparent);box-shadow:0 0 0 24px color-mix(in srgb,var(--svc-accent-ink) 5%,transparent)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"] .eg-service-icon{background:var(--svc-accent-ink)!important;color:var(--svc-accent)!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"] .eg-service-name{color:var(--svc-accent-ink)!important;font-size:1.35rem!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card[data-service-key="nearby"] .eg-service-description{max-width:220px;color:color-mix(in srgb,var(--svc-accent-ink) 72%,transparent)!important;font-size:.82rem!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:2px solid var(--svc-ink);outline-offset:3px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active{transform:scale(.975)!important}
    @media(hover:hover){#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover{transform:translateY(-3px);border-color:var(--svc-muted)!important}}
    @media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:8px!important}#elmaHomeWidgets [data-panel="services"] .eg-service-card{min-height:148px!important;padding:14px!important}#elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:.7rem!important}}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-services-grid{grid-template-columns:1fr!important}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-card{grid-column:1!important}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none!important}}
  `;
  document.head.appendChild(style);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');if(!grid)return;
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
