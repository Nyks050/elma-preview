(()=>{
  if(window.__elma3dIconSkin)return;
  window.__elma3dIconSkin=true;

  const UI_SPRITE='assets/elma-3d-icons.webp?v=20260830-fast2';
  const WEATHER_SPRITE='assets/elma-3d-weather.webp?v=20260830-fast2';

  const style=document.createElement('style');
  style.id='elma3dIconSkin';
  style.textContent=`
    .eg-service-card[data-service-target="weather"] .eg-service-icon,
    .eg-service-card[data-service-target="lines"] .eg-service-icon,
    .eg-service-card[data-service-target="routes"] .eg-service-icon,
    .eg-pharmacy-card .eg-service-icon,
    .eg-lost-card .eg-service-icon,
    #egAccountHelp .eg-account-icon,
    #egAccountSecurity .eg-account-icon,
    #egAccountPreferences .eg-account-icon,
    #egAccountLegal .eg-account-icon,
    .eg-line-bus-icon,
    .eg-row-icon,
    .eg-route-symbol,
    .eg-route6-icon,
    .eg-permission-icon,
    .eg-panel[data-panel="pharmacies"] .eg-weather-icon,
    .eg-panel[data-panel="lost-found"] .eg-lost-head-icon{
      background-image:url("${UI_SPRITE}")!important;
      background-repeat:no-repeat!important;
      background-size:400% 400%!important;
      background-color:transparent!important;
      color:transparent!important;
      padding:0!important;
      border:0!important;
      box-shadow:none!important;
    }
    .eg-service-card .eg-service-icon>svg,
    .eg-account-icon>svg,
    .eg-line-bus-icon>svg,
    .eg-row-icon>svg,
    .eg-route-symbol>svg,
    .eg-route6-icon>svg,
    .eg-permission-icon>svg,
    .eg-panel[data-panel="pharmacies"] .eg-weather-icon>svg,
    .eg-panel[data-panel="lost-found"] .eg-lost-head-icon>svg{display:none!important}

    .eg-service-card[data-service-target="lines"] .eg-service-icon,
    .eg-line-bus-icon{background-position:100% 0!important}
    .eg-service-card[data-service-target="weather"] .eg-service-icon{background-position:0 33.333%!important}
    .eg-service-card[data-service-target="routes"] .eg-service-icon,
    .eg-route-symbol,
    .eg-route6-icon{background-position:33.333% 33.333%!important}
    .eg-row-icon{background-position:66.667% 33.333%!important}
    .eg-pharmacy-card .eg-service-icon,
    .eg-panel[data-panel="pharmacies"] .eg-weather-icon{background-position:100% 33.333%!important}
    .eg-lost-card .eg-service-icon,
    .eg-panel[data-panel="lost-found"] .eg-lost-head-icon{background-position:100% 66.667%!important}
    .eg-service-card[data-service-target="weather"] .eg-service-icon{background-image:url("assets/elma-service-weather-3d-mono.png?v=20260901-services1")!important}
    .eg-service-card[data-service-target="lines"] .eg-service-icon{background-image:url("assets/elma-service-lines-3d-mono.png?v=20260901-services1")!important}
    .eg-service-card[data-service-target="routes"] .eg-service-icon{background-image:url("assets/elma-service-routes-3d-mono.png?v=20260901-services1")!important}
    .eg-lost-card .eg-service-icon,.eg-panel[data-panel="lost-found"] .eg-lost-head-icon{background-image:url("assets/elma-service-lost-3d-mono.png?v=20260901-services1")!important}
    .eg-pharmacy-card .eg-service-icon,.eg-panel[data-panel="pharmacies"] .eg-weather-icon{background-image:url("assets/elma-service-pharmacy-3d-mono.png?v=20260901-services1")!important}
    .eg-service-card[data-service-target="weather"] .eg-service-icon,.eg-service-card[data-service-target="lines"] .eg-service-icon,.eg-service-card[data-service-target="routes"] .eg-service-icon,.eg-lost-card .eg-service-icon,.eg-pharmacy-card .eg-service-icon,.eg-panel[data-panel="lost-found"] .eg-lost-head-icon,.eg-panel[data-panel="pharmacies"] .eg-weather-icon{background-size:contain!important;background-position:center!important}
    #egAccountHelp .eg-account-icon{background-position:0 66.667%!important}
    #egAccountSecurity .eg-account-icon{background-position:33.333% 66.667%!important}
    #egAccountPreferences .eg-account-icon{background-position:66.667% 66.667%!important}
    #egAccountLegal .eg-account-icon{background-position:100% 66.667%!important}
    .eg-permission-icon{background-position:0 100%!important}

    .eg-service-icon{width:58px!important;height:58px!important}
    .eg-account-icon{width:44px!important;height:44px!important}
    .eg-line-bus-icon,.eg-row-icon,.eg-route6-icon{width:48px!important;height:48px!important;flex-basis:48px!important}
    .eg-route-symbol{width:62px!important;height:62px!important}
    .eg-permission-icon{width:62px!important;height:62px!important}

    #egWeatherIcon,.eg-day-icon{
      background-image:url("${WEATHER_SPRITE}")!important;
      background-repeat:no-repeat!important;
      background-size:300% 200%!important;
      background-color:transparent!important;
      color:transparent!important;
    }
    #egWeatherIcon>svg,.eg-day-icon>svg{display:none!important}
    #egWeatherIcon{width:58px!important;height:58px!important}
    .eg-day-icon{width:48px!important;height:48px!important;margin:5px auto!important}
    [data-weather-3d="sun"]{background-position:0 0!important}
    [data-weather-3d="partly"]{background-position:50% 0!important}
    [data-weather-3d="rain"]{background-position:100% 0!important}
    [data-weather-3d="snow"]{background-position:0 100%!important}
    [data-weather-3d="storm"]{background-position:50% 100%!important}
    [data-weather-3d="fog"]{background-position:100% 100%!important}
  `;
  document.head.appendChild(style);


  // Services use the existing SVG icon set with a consistent, accessible layout.
  const servicesStyle=document.createElement('style');
  servicesStyle.id='elmaServicesLayout';
  servicesStyle.textContent=`
    #elmaHomeWidgets [data-panel="services"]{--service-ink:#f4f4f5;--service-muted:#a8abb2;--service-surface:#151517;--service-border:#303036;--service-icon:#242429}
    html[data-theme="light"] #elmaHomeWidgets [data-panel="services"]{--service-ink:#18191d;--service-muted:#606570;--service-surface:#fff;--service-border:#e4e6eb;--service-icon:#f0f2f5}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{padding:8px 0 0}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{font-size:2rem;line-height:1.15;letter-spacing:-.8px;color:var(--service-ink)}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{margin-top:10px;font-size:1rem;line-height:1.5;font-weight:500;color:var(--service-muted)}
    #elmaHomeWidgets .eg-services-grid{gap:12px;margin-top:24px}
    #elmaHomeWidgets .eg-services-grid .eg-service-card{grid-column:1 / -1;display:grid;grid-template-columns:48px minmax(0,1fr) 16px;gap:14px;align-items:center;justify-content:initial;min-height:96px;padding:18px;text-align:left;border:1px solid var(--service-border);border-radius:20px;background:var(--service-surface);color:var(--service-ink);box-shadow:0 2px 6px rgba(0,0,0,.025);cursor:pointer;transition:background .18s,border-color .18s,transform .18s}
    #elmaHomeWidgets .eg-services-grid .eg-service-card::after{content:"";width:7px;height:7px;border-top:1.7px solid currentColor;border-right:1.7px solid currentColor;transform:rotate(45deg);color:var(--service-muted);justify-self:center}
    #elmaHomeWidgets .eg-services-grid .eg-service-icon{display:grid;place-items:center;width:48px!important;height:48px!important;background:var(--service-icon)!important;color:var(--service-ink)!important;border-radius:14px;padding:11px!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-icon>svg{display:block!important;width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}
    #elmaHomeWidgets .eg-services-grid .eg-service-copy{display:flex;flex-direction:column;gap:5px;min-width:0}
    #elmaHomeWidgets .eg-services-grid .eg-service-name{font-size:1rem;font-weight:700;letter-spacing:-.2px;line-height:1.35;overflow-wrap:anywhere}
    #elmaHomeWidgets .eg-services-grid .eg-service-description{font-size:.875rem;line-height:1.45;font-weight:400;color:var(--service-muted)}
    #elmaHomeWidgets .eg-services-grid [data-service-target="lines"],#elmaHomeWidgets .eg-services-grid [data-service-target="routes"]{grid-column:auto;grid-template-columns:minmax(0,1fr);align-content:start;gap:18px;min-height:176px;background:var(--service-icon)}
    #elmaHomeWidgets .eg-services-grid [data-service-target="lines"]::after,#elmaHomeWidgets .eg-services-grid [data-service-target="routes"]::after{display:none}
    #elmaHomeWidgets .eg-services-grid [data-service-target="lines"] .eg-service-icon,#elmaHomeWidgets .eg-services-grid [data-service-target="routes"] .eg-service-icon{background:var(--service-surface)!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-icon{width:54px!important;height:54px!important;border-radius:0!important;padding:0!important;background-color:transparent!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important;filter:drop-shadow(0 5px 7px rgba(0,0,0,.16))}
    #elmaHomeWidgets .eg-services-grid .eg-service-icon>svg{display:none!important}
    #elmaHomeWidgets .eg-services-grid [data-service-target="weather"] .eg-service-icon{background-image:url("assets/elma-service-weather-3d-mono.png?v=20260907-simple3d")!important}
    #elmaHomeWidgets .eg-services-grid [data-service-target="lines"] .eg-service-icon{background-image:url("assets/elma-service-lines-3d-mono.png?v=20260907-simple3d")!important}
    #elmaHomeWidgets .eg-services-grid [data-service-target="routes"] .eg-service-icon{background-image:url("assets/elma-service-routes-3d-mono.png?v=20260907-simple3d")!important}
    #elmaHomeWidgets .eg-services-grid .eg-lost-card .eg-service-icon{background-image:url("assets/elma-service-lost-3d-mono.png?v=20260907-simple3d")!important}
    #elmaHomeWidgets .eg-services-grid .eg-pharmacy-card .eg-service-icon{background-image:url("assets/elma-service-pharmacy-3d-mono.png?v=20260907-simple3d")!important}
    #elmaHomeWidgets .eg-services-grid [data-service-target="lines"] .eg-service-icon,#elmaHomeWidgets .eg-services-grid [data-service-target="routes"] .eg-service-icon{background-color:transparent!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-card:focus-visible{outline:2px solid var(--service-ink);outline-offset:4px}
    #elmaHomeWidgets .eg-services-grid .eg-service-card:active{transform:scale(.985)}
    @media(hover:hover){#elmaHomeWidgets .eg-services-grid .eg-service-card:hover{border-color:var(--service-muted);transform:translateY(-2px)}}
    @media(max-width:359px){#elmaHomeWidgets .eg-services-grid{grid-template-columns:minmax(0,1fr)}#elmaHomeWidgets .eg-services-grid [data-service-target]{grid-column:1 / -1;min-height:96px}}
    html[data-large-text="true"] #elmaHomeWidgets .eg-services-grid{grid-template-columns:minmax(0,1fr)}
    html[data-large-text="true"] #elmaHomeWidgets .eg-services-grid .eg-service-name{font-size:1.2rem}
    html[data-large-text="true"] #elmaHomeWidgets .eg-services-grid .eg-service-description{font-size:1rem}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets .eg-services-grid .eg-service-card{transition:none;transform:none!important}}
    html[data-reduce-motion="true"] #elmaHomeWidgets .eg-services-grid .eg-service-card{transition:none;transform:none!important}

    /* Strict black/white, symmetrical services composition. */
    #elmaHomeWidgets [data-panel="services"]{--service-ink:#fff;--service-surface:#000;--service-border:#fff;--service-icon:#000}
    html[data-theme="light"] #elmaHomeWidgets [data-panel="services"]{--service-ink:#000;--service-surface:#fff;--service-border:#000;--service-icon:#fff}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{text-align:left}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title,#elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{color:var(--service-ink)}
    #elmaHomeWidgets .eg-services-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-card{grid-column:auto!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:12px!important;min-height:154px!important;padding:18px 12px!important;text-align:center!important;border:2px solid var(--service-border)!important;border-radius:22px!important;background:var(--service-surface)!important;color:var(--service-ink)!important;box-shadow:none!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-card::after{display:none!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-copy{align-items:center!important;gap:0!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-name{color:var(--service-ink)!important;font-size:1rem!important;line-height:1.3!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-description{display:none!important}
    #elmaHomeWidgets .eg-services-grid .eg-service-icon{width:62px!important;height:62px!important;background-color:transparent!important;filter:grayscale(1) drop-shadow(0 5px 8px rgba(0,0,0,.20))!important}
    html:not([data-theme="light"]) #elmaHomeWidgets .eg-services-grid .eg-service-icon{filter:grayscale(1) invert(1) drop-shadow(0 5px 8px rgba(255,255,255,.12))!important}
    #elmaHomeWidgets .eg-services-grid [data-service-target="lines"] .eg-service-icon{width:62px!important;height:62px!important}
    @media(max-width:359px){#elmaHomeWidgets .eg-services-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}#elmaHomeWidgets .eg-services-grid .eg-service-card{min-height:140px!important;padding:14px 8px!important}}
    html[data-large-text="true"] #elmaHomeWidgets .eg-services-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}

    #elmaHomeWidgets .eg-services-grid .eg-service-icon.eg-icon-media{background-image:none!important;overflow:visible}
    #elmaHomeWidgets .eg-services-grid .eg-service-icon.eg-icon-media>img{display:block!important;width:100%;height:100%;object-fit:contain}
    #elmaHomeWidgets .eg-services-grid .eg-pharmacy-card .eg-service-icon.eg-icon-media{filter:none!important}\n    #elmaHomeWidgets .eg-services-grid .eg-pharmacy-card .eg-service-icon.eg-icon-media>svg{display:block!important;width:100%;height:100%;fill:#000!important;stroke:none!important}


    #elmaHomeWidgets .eg-services-grid .eg-service-icon{width:60px!important;height:60px!important;filter:grayscale(1) drop-shadow(0 7px 9px rgba(0,0,0,.18))!important}
    #elmaHomeWidgets .eg-services-grid [data-service-target="weather"] .eg-service-icon,#elmaHomeWidgets .eg-services-grid [data-service-target="lines"] .eg-service-icon,#elmaHomeWidgets .eg-services-grid [data-service-target="routes"] .eg-service-icon,#elmaHomeWidgets .eg-services-grid .eg-lost-card .eg-service-icon{background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important}
    #elmaHomeWidgets .eg-services-grid .eg-nearby-card .eg-service-icon{background-image:url("${UI_SPRITE}")!important;background-size:400% 400%!important;background-position:66.667% 33.333%!important;background-repeat:no-repeat!important;color:transparent!important}
    #elmaHomeWidgets .eg-services-grid .eg-nearby-card .eg-service-icon>svg{display:none!important}
    #elmaHomeWidgets .eg-services-grid .eg-pharmacy-card .eg-service-icon{width:58px!important;height:58px!important;filter:none!important}
  `;
  document.head.appendChild(servicesStyle);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');
    if(!grid)return;
    const definitions=[
      ['[data-service-target="lines"]','Hatlar','Hat ve sefer bilgileri'],
      ['[data-service-target="routes"]','Güzergâhlar','Duraklar ve hat rotaları'],
      ['[data-service-target="nearby-stops"]','Yakındaki Duraklar','Konumuna en yakın duraklar'],
      ['[data-service-target="weather"]','Hava Durumu','Güncel hava ve tahminler'],
      ['.eg-lost-card','Kayıp Eşya','Kayıp ve bulunan eşyalar'],
      ['.eg-pharmacy-card','Nöbetçi Eczane','Nöbetçi eczaneler ve konumları']
    ];
    const ordered=[];
    definitions.forEach(([selector,title,description])=>{
      const card=grid.querySelector(selector);
      if(!card)return;
      ordered.push(card);
      if(card.dataset.servicesRefined)return;
      const name=card.querySelector('.eg-service-name');
      if(!name)return;
      card.dataset.servicesRefined='true';
      name.textContent=title;
      const copy=document.createElement('span');
      copy.className='eg-service-copy';
      name.before(copy);
      copy.appendChild(name);
      const detail=document.createElement('span');
      detail.className='eg-service-description';
      detail.textContent=description;
      copy.appendChild(detail);
      card.querySelector('.eg-service-icon')?.setAttribute('aria-hidden','true');
    });
    const iconMedia=[
      ['[data-service-target="lines"]','assets/elma-service-lines-3d-mono.png?v=20260907-visible2','Hatlar'],
      ['[data-service-target="routes"]','assets/elma-service-routes-3d-mono.png?v=20260907-visible2','Güzergâhlar']
    ];
    iconMedia.forEach(([selector,src,label])=>{
      const holder=grid.querySelector(selector+' .eg-service-icon');
      if(!holder)return;
      holder.classList.add('eg-icon-media');
      if(!holder.querySelector('img')){
        holder.innerHTML='<img src="'+src+'" alt="" width="62" height="62" decoding="async">';
        holder.setAttribute('aria-hidden','true');
      }
    });
    const pharmacy=grid.querySelector('.eg-pharmacy-card .eg-service-icon');
    if(pharmacy&&!pharmacy.dataset.trPharmacy){
      pharmacy.dataset.trPharmacy='true';
      pharmacy.classList.add('eg-icon-media');
      pharmacy.innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 5h40v11H25v10h24v11H25v11h29v11H13Z"/></svg>';
    }
    // Move the original buttons so their existing click handlers remain attached.
    ordered.forEach((card,index)=>{
      if(grid.children[index]!==card)grid.insertBefore(card,grid.children[index]||null);
    });
  }

  function weatherKind(text=''){
    const value=text.toLocaleLowerCase('tr-TR');
    if(value.includes('fırtına'))return'storm';
    if(value.includes('kar'))return'snow';
    if(value.includes('sis'))return'fog';
    if(value.includes('yağ')||value.includes('sağanak'))return'rain';
    if(value.includes('açık'))return'sun';
    return'partly';
  }

  function applyWeatherIcons(){
    const current=document.getElementById('egWeatherIcon');
    const currentText=document.getElementById('egWeatherText')?.textContent||'';
    if(current)current.dataset.weather3d=weatherKind(currentText);
    document.querySelectorAll('.eg-day').forEach(day=>{
      const icon=day.querySelector('.eg-day-icon');
      if(icon)icon.dataset.weather3d=weatherKind(day.getAttribute('aria-label')||day.textContent);
    });
  }

  let timer=0,observer=null,tries=0;
  function mount(){
    const widgets=document.getElementById('elmaHomeWidgets');
    if(!widgets){
      if(++tries<=80)setTimeout(mount,100);
      return;
    }
    refineServices();
    applyWeatherIcons();
    observer=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{refineServices();applyWeatherIcons()},20);
    });
    observer.observe(widgets,{subtree:true,childList:true,characterData:true});
  }
  mount();
})();
