(()=>{
  if(window.__elma3dIconSkin)return;
  window.__elma3dIconSkin=true;

  const icons={
    nearby:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 28s8-7.2 8-15a8 8 0 1 0-16 0c0 7.8 8 15 8 15Z"/><circle cx="16" cy="13" r="2.75"/></svg>',
    lines:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="4" width="18" height="22" rx="4"/><path d="M10 9h12v8H10zM10 26v2m12-2v2"/><circle cx="11.5" cy="21.5" r="1.25"/><circle cx="20.5" cy="21.5" r="1.25"/></svg>',
    routes:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="7" cy="24" r="2.5"/><circle cx="25" cy="8" r="2.5"/><path d="M9.5 23.5c2-6.5 7.3-2.3 10.4-7.4 1.4-2.3 2.2-4.1 3.3-5.5"/></svg>',
    weather:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="21.5" cy="10.5" r="4.5"/><path d="M21.5 3v2m0 11v2M14 10.5h2m11 0h2M16.2 5.2l1.4 1.4m7.8 7.8 1.4 1.4M26.8 5.2l-1.4 1.4"/><path d="M8.5 25h14a4.5 4.5 0 0 0 .4-9 7 7 0 0 0-13.4 1.5A3.8 3.8 0 0 0 8.5 25Z"/></svg>',
    lost:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 11h16v16H8zM12 11V9a4 4 0 0 1 8 0v2"/><circle cx="20.5" cy="20.5" r="4"/><path d="m23.5 23.5 3 3"/></svg>',
    pharmacy:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4h8v8h8v8h-8v8h-8v-8H4v-8h8z"/></svg>'
  };

  const style=document.createElement('style');
  style.id='elmaServicesLayout';
  style.textContent=`
    #elmaHomeWidgets [data-panel="services"]{--svc-text:#111214;--svc-muted:#71747a;--svc-fill:#f3f3f5;--svc-border:#e7e7ea;color:var(--svc-text);font-family:"Inter",-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif;padding-bottom:20px}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{padding:8px 2px 4px}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{margin:0;font-size:2rem;line-height:1.15;font-weight:720;letter-spacing:-.045em;color:var(--svc-text)}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{margin:7px 0 0;font-size:.875rem;line-height:1.45;font-weight:400;color:var(--svc-muted)}
    #elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:20px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card{
      grid-column:auto;min-width:0;height:118px;min-height:118px;padding:14px;
      display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:10px;
      overflow:hidden;text-align:left;border:1px solid var(--svc-border);border-radius:18px;
      background:var(--svc-fill);color:var(--svc-text);box-shadow:none;cursor:pointer;
      touch-action:manipulation;-webkit-tap-highlight-color:transparent;
      transition:transform .15s ease,background .15s ease,border-color .15s ease;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:before,
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:none}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon{
      display:grid!important;place-items:center;width:42px!important;height:42px!important;
      flex:0 0 42px;padding:8px!important;border:0!important;border-radius:12px!important;
      background:#111214!important;color:#fff!important;box-shadow:none!important;filter:none!important;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{
      display:block!important;width:100%!important;height:100%!important;fill:none!important;
      stroke:currentColor!important;stroke-width:1.65!important;stroke-linecap:round!important;stroke-linejoin:round!important;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:block;min-width:0;width:100%;padding:0}
    #elmaHomeWidgets [data-panel="services"] .eg-service-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.875rem;line-height:1.3;font-weight:650;letter-spacing:-.015em;color:var(--svc-text)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-description{display:none!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:2px solid var(--svc-text);outline-offset:3px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active{transform:scale(.97);background:#e9e9ec}
    @media(hover:hover){#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover{background:#ededf0;border-color:#dadade}}
    @media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:8px}#elmaHomeWidgets [data-panel="services"] .eg-service-card{height:112px;min-height:112px;padding:12px;border-radius:16px}}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:1rem}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none!important;transform:none!important}}
    html[data-reduce-motion="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-card{transition:none!important;transform:none!important}
  `;
  document.head.appendChild(style);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');if(!grid)return;
    const subtitle=grid.closest('[data-panel="services"]')?.querySelector('.eg-screen-subtitle');
    if(subtitle&&subtitle.textContent!=='Şehirde ihtiyacın olan her şey.')subtitle.textContent='Şehirde ihtiyacın olan her şey.';
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
      if(holder&&holder.dataset.serviceIcon!==key+'-compact5'){holder.dataset.serviceIcon=key+'-compact5';holder.innerHTML=icons[key];holder.setAttribute('aria-hidden','true')}
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
