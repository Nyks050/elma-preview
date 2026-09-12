(()=>{
  if(window.__elma3dIconSkin)return;
  window.__elma3dIconSkin=true;

  const icons={
    nearby:'<svg viewBox="0 0 48 48"><path fill="currentColor" fill-rule="evenodd" d="M24 3C14.6 3 8 9.9 8 19c0 11 16 26 16 26s16-15 16-26C40 9.9 33.4 3 24 3Zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"/></svg>',
    lines:'<svg viewBox="0 0 48 48"><path fill="currentColor" fill-rule="evenodd" d="M16 4h16a8 8 0 0 1 8 8v24a5 5 0 0 1-4 5v3h-6v-3H18v3h-6v-3a5 5 0 0 1-4-5V12a8 8 0 0 1 8-8Zm1 8a2 2 0 0 0-2 2v10h18V14a2 2 0 0 0-2-2H17Zm0 18a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm14 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>',
    routes:'<svg viewBox="0 0 48 48"><path d="M13 36V21a9 9 0 0 1 9-9h13M27 4l9 8-9 8" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="37" r="6" fill="currentColor"/></svg>',
    weather:'<svg viewBox="0 0 48 48"><circle cx="32" cy="15" r="10" fill="currentColor" opacity=".4"/><path fill="currentColor" d="M14 40a10 10 0 0 1-1-20 12 12 0 0 1 23-1 10.5 10.5 0 0 1 0 21Z"/></svg>',
    lost:'<svg viewBox="0 0 48 48"><path fill="currentColor" fill-rule="evenodd" d="M18 4h12a5 5 0 0 1 5 5v5h3a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5h3V9a5 5 0 0 1 5-5Zm1 6v4h10v-4H19Zm-3 13v4h16v-4H16Zm6 8v6h4v-6h-4Z"/></svg>',
    pharmacy:'<svg viewBox="0 0 48 48"><path fill="currentColor" d="M19 4h10a3 3 0 0 1 3 3v9h9a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-9v9a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3v-9H7a3 3 0 0 1-3-3V19a3 3 0 0 1 3-3h9V7a3 3 0 0 1 3-3Z"/></svg>'
  };

  const style=document.createElement('style');
  style.id='elmaServicesLayout';
  style.textContent=`
    #elmaHomeWidgets [data-panel="services"]{--svc-ink:#101114;--svc-muted:#64676e;--svc-rule:#e4e5e8;color:var(--svc-ink);padding-bottom:24px}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{padding:8px 0 22px;border-bottom:1px solid var(--svc-rule)}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{margin:0;font-size:2.5rem;font-weight:780;letter-spacing:-.055em;line-height:1.15}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{margin:8px 0 0;font-size:1rem;font-weight:400;line-height:1.45;color:var(--svc-muted)}
    #elmaHomeWidgets [data-panel="services"] .eg-services-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:1fr;gap:16px 12px;margin-top:24px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card{
      grid-column:auto;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;
      gap:0;min-width:0;min-height:0;padding:0;overflow:hidden;text-align:left;
      border:1px solid #e1e2e6;border-radius:25px;background:#fff;color:var(--svc-ink);
      box-shadow:0 3px 8px #10111406;cursor:pointer;touch-action:manipulation;
      -webkit-tap-highlight-color:transparent;transition:transform .18s ease,box-shadow .18s ease;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon{
      position:relative;isolation:isolate;display:grid!important;place-items:center;
      width:100%!important;height:126px!important;flex:0 0 126px;padding:0!important;
      border:0!important;border-radius:0!important;filter:none!important;
      background:radial-gradient(ellipse at 50% -60%,#686b72 0,#25272c 46%,#111215 80%)!important;
      color:#fff!important;box-shadow:inset 0 1px 0 #ffffff26!important;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon:before{
      content:"";position:absolute;inset:10px;border:1px solid #ffffff12;border-radius:17px;pointer-events:none;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{
      display:block!important;width:57px!important;height:57px!important;
      fill:none!important;stroke:none!important;overflow:visible;
      filter:drop-shadow(0 5px 4px #0005);transition:transform .2s ease;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-copy{
      position:relative;display:flex;flex-direction:column;align-items:flex-start;
      flex:1;min-width:0;gap:5px;padding:15px 13px 16px;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-name{display:flex;align-items:center;min-height:2.6em;width:100%;margin:0;font-size:1rem;line-height:1.3;font-weight:730;letter-spacing:-.03em;color:var(--svc-ink)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-description{display:block;width:100%;font-size:.875rem;line-height:1.4;font-weight:400;color:var(--svc-muted);text-wrap:balance}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:before,
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:none}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{outline:3px solid var(--svc-ink);outline-offset:4px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active{transform:scale(.965)}
    @media(hover:hover){#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover{box-shadow:0 9px 24px #10111416;transform:translateY(-2px)}#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover .eg-service-icon>svg{transform:translateY(-3px)}}
    @media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{gap:12px 10px}#elmaHomeWidgets [data-panel="services"] .eg-service-copy{padding:13px 11px 15px}}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:1.125rem}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-description{font-size:1rem}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card,#elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{transition:none!important;transform:none!important}}
    html[data-reduce-motion="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-card,html[data-reduce-motion="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{transition:none!important;transform:none!important}
  `;
  document.head.appendChild(style);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');if(!grid)return;
    const subtitle=grid.closest('[data-panel="services"]')?.querySelector('.eg-screen-subtitle');
    if(subtitle&&subtitle.textContent!=='Şehirde ihtiyacın olan, tek dokunuşta.')subtitle.textContent='Şehirde ihtiyacın olan, tek dokunuşta.';
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
      if(holder&&holder.dataset.serviceIcon!==key+'-solid4'){holder.dataset.serviceIcon=key+'-solid4';holder.innerHTML=icons[key];holder.setAttribute('aria-hidden','true')}
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
