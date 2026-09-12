(()=>{
  if(window.__elma3dIconSkin)return;
  window.__elma3dIconSkin=true;

  const icons={
    nearby:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 35s10-9.1 10-19a10 10 0 1 0-20 0c0 9.9 10 19 10 19Z"/><circle cx="20" cy="16" r="3.5"/><path d="M8 34h7m10 0h7"/></svg>',
    lines:'<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="9" y="5" width="22" height="28" rx="6"/><path d="M13 10h14v11H13zM13 33v3m14-3v3"/><circle cx="14.5" cy="27" r="1.5"/><circle cx="25.5" cy="27" r="1.5"/></svg>',
    routes:'<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="9" cy="30" r="3.5"/><circle cx="31" cy="10" r="3.5"/><path d="M12.5 29c2.2-8.8 9.4-3.7 13.1-10.4 1.7-3.1 2.5-4.6 3.5-5.8"/></svg>',
    weather:'<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="27" cy="12" r="6"/><path d="M27 3v3m0 12v3M18 12h3m12 0h3M20.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1"/><path d="M10 33h17a5.5 5.5 0 0 0 .5-11 8.5 8.5 0 0 0-16.3 1.9A4.7 4.7 0 0 0 10 33Z"/></svg>',
    lost:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 13h22v21H9zM14 13v-3a6 6 0 0 1 12 0v3"/><circle cx="25" cy="26" r="5"/><path d="m28.8 29.8 4.2 4.2"/></svg>',
    pharmacy:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M15 4h10v11h11v10H25v11H15V25H4V15h11z"/></svg>'
  };

  const style=document.createElement('style');
  style.id='elmaServicesLayout';
  style.textContent=`
    #elmaHomeWidgets [data-panel="services"]{--hub-ink:#111214;--hub-muted:#72757b;--hub-line:#dedfe3;--hub-panel:#f6f6f7;--hub-red:#ff2d2d;color:var(--hub-ink);font-family:"Inter",-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif;padding-bottom:22px}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head{position:relative;padding:9px 2px 20px}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-head:before{content:"";display:block;width:28px;height:5px;margin-bottom:15px;border-radius:99px;background:var(--hub-red)}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-title{margin:0;color:var(--hub-ink);font-size:2.15rem;line-height:1.08;font-weight:750;letter-spacing:-.055em}
    #elmaHomeWidgets [data-panel="services"] .eg-screen-subtitle{margin:8px 0 0;color:var(--hub-muted);font-size:.875rem;line-height:1.45;font-weight:420}
    #elmaHomeWidgets [data-panel="services"] .eg-services-grid{
      position:relative;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
      grid-auto-rows:128px;gap:0!important;margin-top:8px!important;overflow:hidden;
      border:1px solid var(--hub-line);border-radius:26px;background:var(--hub-panel);
      box-shadow:0 12px 30px rgba(17,18,20,.055),inset 0 1px 0 #fff;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-card{
      position:relative;grid-column:auto!important;width:100%;height:128px!important;min-height:128px!important;
      display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;
      gap:10px!important;padding:17px!important;overflow:hidden;text-align:left!important;
      border:0!important;border-right:1px solid var(--hub-line)!important;border-bottom:1px solid var(--hub-line)!important;
      border-radius:0!important;background:transparent!important;color:var(--hub-ink)!important;box-shadow:none!important;
      cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
      transition:background .18s ease,color .18s ease,transform .14s ease;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-child(even){border-right:0!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:nth-last-child(-n+2){border-bottom:0!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:before{
      content:attr(data-service-index);position:absolute;top:12px;right:13px;color:#a4a6ab;
      font-size:.56rem;line-height:1;font-weight:700;letter-spacing:.08em;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:after{content:none!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon{
      display:grid!important;place-items:center!important;width:44px!important;height:44px!important;
      flex:0 0 44px!important;padding:4px!important;border:0!important;border-radius:0!important;
      background:none!important;background-image:none!important;color:var(--hub-ink)!important;
      box-shadow:none!important;filter:none!important;transition:transform .2s cubic-bezier(.2,.8,.2,1);
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-icon>svg{
      display:block!important;width:100%!important;height:100%!important;fill:none!important;
      stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round!important;
      stroke-linejoin:round!important;vector-effect:non-scaling-stroke;
    }
    #elmaHomeWidgets [data-panel="services"] .eg-service-copy{display:block!important;width:100%;min-width:0;padding:0!important;text-align:left!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-name{display:block!important;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:inherit!important;font-size:.8125rem!important;line-height:1.25!important;font-weight:650!important;letter-spacing:-.018em!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-description{display:none!important}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:focus-visible{z-index:2;outline:2px solid var(--hub-ink);outline-offset:-3px}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active{background:var(--hub-ink)!important;color:#fff!important;transform:scale(.975)}
    #elmaHomeWidgets [data-panel="services"] .eg-service-card:active:before{color:#ffffff80}
    @media(hover:hover){#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover{background:#fff!important}#elmaHomeWidgets [data-panel="services"] .eg-service-card:hover .eg-service-icon{transform:translateY(-2px)}}
    @media(max-width:359px){#elmaHomeWidgets [data-panel="services"] .eg-services-grid{grid-auto-rows:120px;border-radius:22px}#elmaHomeWidgets [data-panel="services"] .eg-service-card{height:120px!important;min-height:120px!important;padding:15px!important}}
    html[data-large-text="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-name{font-size:.9375rem!important}
    @media(prefers-reduced-motion:reduce){#elmaHomeWidgets [data-panel="services"] .eg-service-card,#elmaHomeWidgets [data-panel="services"] .eg-service-icon{transition:none!important;transform:none!important}}
    html[data-reduce-motion="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-card,html[data-reduce-motion="true"] #elmaHomeWidgets [data-panel="services"] .eg-service-icon{transition:none!important;transform:none!important}
  `;
  document.head.appendChild(style);

  function refineServices(){
    const grid=document.querySelector('#elmaHomeWidgets .eg-services-grid');if(!grid)return;
    const subtitle=grid.closest('[data-panel="services"]')?.querySelector('.eg-screen-subtitle');
    if(subtitle&&subtitle.textContent!=='Şehir araçları, tek merkezde.')subtitle.textContent='Şehir araçları, tek merkezde.';
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
      if(holder&&holder.dataset.serviceIcon!==key+'-hub6'){holder.dataset.serviceIcon=key+'-hub6';holder.innerHTML=icons[key];holder.setAttribute('aria-hidden','true')}
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
