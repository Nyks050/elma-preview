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
    #elmaHomeWidgets [data-panel="services"] {
      --service-text:#151518;--service-secondary:#666970;--service-fill:#f4f4f6;
      color:var(--service-text);padding-bottom:24px;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{padding:12px 2px 0}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{margin:0;font-size:2.125rem;line-height:1.2;font-weight:750;letter-spacing:-.045em}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{margin:8px 0 0;font-size:1rem;line-height:1.5;font-weight:400;color:var(--service-secondary)}
    #elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:1fr;gap:12px;margin-top:28px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card{
      grid-column:auto;min-width:0;min-height:186px;padding:22px 12px 20px;
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      gap:18px;background:var(--service-fill);color:var(--service-text);
      border:1px solid transparent;border-radius:24px;box-shadow:none;
      text-align:center;cursor:pointer;touch-action:manipulation;
      -webkit-tap-highlight-color:transparent;transition:background .16s ease,transform .16s ease;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-card::before,
    #elmaHomeWidgets [data-panel="services"] .eg-service-card::after{content:none}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon{
      display:grid!important;place-items:center;width:52px!important;height:52px!important;
      flex:0 0 52px;padding:6px!important;background:none!important;
      border:0!important;border-radius:0;box-shadow:none!important;
      color:var(--service-text)!important;filter:none!important;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{
      display:block!important;width:100%!important;height:100%!important;
      fill:none!important;stroke:currentColor!important;stroke-width:1.7;
      stroke-linecap:round;stroke-linejoin:round;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:flex;flex-direction:column;align-items:center;gap:7px;min-width:0;width:100%}
    #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:1rem;line-height:1.3;font-weight:650;letter-spacing:-.025em;color:var(--service-text)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-description{display:block;max-width:175px;font-size:.875rem;line-height:1.4;font-weight:400;color:var(--service-secondary);text-wrap:balance}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:2px solid var(--service-text);outline-offset:3px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active{transform:scale(.97);background:#e7e7eb}
    @media(hover:hover){#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover{background:#eaeaee}}
    @media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:10px}#elmaHomeWidgets [data-panel="services"] .eg-service-card{padding:20px 10px;min-height:186px;border-radius:20px}}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:1.125rem}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:1rem}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none;transform:none}}
    html[data-reduce-motion="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none;transform:none}
  `;
  document.head.appendChild(style);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');if(!grid)return;
    const subtitle=grid.closest('[data-panel="services"]')?.querySelector('.eg-screen-subtitle');
    if(subtitle&&subtitle.textContent!=='Günlük hayatını kolaylaştıran hizmetler.')subtitle.textContent='Günlük hayatını kolaylaştıran hizmetler.';
    const definitions=[
      ['[data-service-target="nearby-stops"]','nearby','Yakındaki Duraklar','Sana en yakın duraklar'],
      ['[data-service-target="lines"]','lines','Hatlar','Hatlar ve sefer saatleri'],
      ['[data-service-target="routes"]','routes','Güzergâhlar','Duraklar ve hat rotaları'],
      ['[data-service-target="weather"]','weather','Hava Durumu','Güncel hava ve tahminler'],
      ['.eg-lost-card','lost','Kayıp & Buluntu','Kayıp ve bulunan eşyalar'],
      ['.eg-pharmacy-card','pharmacy','Nöbetçi Eczane','Nöbetçi eczanelerin konumları']
    ],ordered=[];
    definitions.forEach(([selector,key,title,description],index)=>{
      const card=grid.querySelector(selector);if(!card)return;ordered.push(card);
      card.dataset.serviceKey=key;card.dataset.serviceIndex=String(index+1).padStart(2,'0');
      card.setAttribute('aria-label',title+'. '+description);
      const holder=card.querySelector('.eg-service-icon'),name=card.querySelector('.eg-service-name');
      if(holder&&holder.dataset.serviceIcon!==key){holder.dataset.serviceIcon=key;holder.innerHTML=icons[key];holder.setAttribute('aria-hidden','true')}
      if(!name)return;if(name.textContent!==title)name.textContent=title;
      let copy=card.querySelector('.eg-service-copy');
      if(!copy){copy=document.createElement('span');copy.className='eg-service-copy';name.before(copy);copy.appendChild(name)}
      let detail=copy.querySelector('.eg-service-description');
      if(!detail){detail=document.createElement('span');detail.className='eg-service-description';copy.appendChild(detail)}
      if(detail.textContent!==description)detail.textContent=description;
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
