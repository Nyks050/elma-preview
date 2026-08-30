(()=>{
  if(window.__elma3dIconSkin)return;
  window.__elma3dIconSkin=true;

  const style=document.createElement('style');
  style.id='elma3dIconSkin';
  style.textContent=`
    .eg-tab[data-tab="home"] .ico,
    .eg-tab[data-tab="services"] .ico,
    .eg-tab[data-tab="account"] .ico,
    .eg-service-card[data-service-target="weather"] .eg-service-icon,
    .eg-service-card[data-service-target="lines"] .eg-service-icon,
    .eg-service-card[data-service-target="routes"] .eg-service-icon,
    .eg-service-card[data-service-target="stops"] .eg-service-icon,
    .eg-pharmacy-card .eg-service-icon,
    #egAccountHelp .eg-account-icon,
    #egAccountSecurity .eg-account-icon,
    #egAccountPreferences .eg-account-icon,
    #egAccountLegal .eg-account-icon,
    .eg-line-bus-icon,
    .eg-row-icon,
    .eg-route-symbol,
    .eg-route6-icon,
    .eg-permission-icon,
    .eg-panel[data-panel="pharmacies"] .eg-weather-icon{
      background-image:url("assets/elma-3d-icons.png?v=20260830-3d");
      background-repeat:no-repeat;
      background-size:400% 400%;
      background-color:transparent!important;
      color:transparent!important;
      padding:0!important;
      border:0!important;
      box-shadow:none!important;
    }
    .eg-tab[data-tab="home"] .ico>svg,
    .eg-tab[data-tab="services"] .ico>svg,
    .eg-tab[data-tab="account"] .ico>svg,
    .eg-service-card .eg-service-icon>svg,
    .eg-account-icon>svg,
    .eg-line-bus-icon>svg,
    .eg-row-icon>svg,
    .eg-route-symbol>svg,
    .eg-route6-icon>svg,
    .eg-permission-icon>svg,
    .eg-panel[data-panel="pharmacies"] .eg-weather-icon>svg{display:none!important}

    .eg-tab[data-tab="home"] .ico{background-position:0 0}
    .eg-tab[data-tab="services"] .ico{background-position:33.333% 0}
    .eg-tab[data-tab="account"] .ico{background-position:66.667% 0}
    .eg-service-card[data-service-target="lines"] .eg-service-icon,
    .eg-line-bus-icon{background-position:100% 0}
    .eg-service-card[data-service-target="weather"] .eg-service-icon{background-position:0 33.333%}
    .eg-service-card[data-service-target="routes"] .eg-service-icon,
    .eg-route-symbol,
    .eg-route6-icon{background-position:33.333% 33.333%}
    .eg-service-card[data-service-target="stops"] .eg-service-icon,
    .eg-row-icon{background-position:66.667% 33.333%}
    .eg-pharmacy-card .eg-service-icon,
    .eg-panel[data-panel="pharmacies"] .eg-weather-icon{background-position:100% 33.333%}
    #egAccountHelp .eg-account-icon{background-position:0 66.667%}
    #egAccountSecurity .eg-account-icon{background-position:33.333% 66.667%}
    #egAccountPreferences .eg-account-icon{background-position:66.667% 66.667%}
    #egAccountLegal .eg-account-icon{background-position:100% 66.667%}
    .eg-permission-icon{background-position:0 100%}

    .eg-tab .ico{width:38px!important;height:38px!important;flex-basis:38px!important}
    .eg-service-icon{width:58px!important;height:58px!important}
    .eg-account-icon{width:44px!important;height:44px!important}
    .eg-line-bus-icon,.eg-row-icon,.eg-route6-icon{width:48px!important;height:48px!important;flex-basis:48px!important}
    .eg-route-symbol{width:62px!important;height:62px!important}
    .eg-permission-icon{width:62px!important;height:62px!important}

    #egWeatherIcon,.eg-day-icon{
      background-image:url("assets/elma-3d-weather.png?v=20260830-3d");
      background-repeat:no-repeat;
      background-size:300% 200%;
      background-color:transparent!important;
      color:transparent!important;
    }
    #egWeatherIcon>svg,.eg-day-icon>svg{display:none!important}
    #egWeatherIcon{width:58px!important;height:58px!important}
    .eg-day-icon{width:48px!important;height:48px!important;margin:5px auto!important}
    [data-weather-3d="sun"]{background-position:0 0}
    [data-weather-3d="partly"]{background-position:50% 0}
    [data-weather-3d="rain"]{background-position:100% 0}
    [data-weather-3d="snow"]{background-position:0 100%}
    [data-weather-3d="storm"]{background-position:50% 100%}
    [data-weather-3d="fog"]{background-position:100% 100%}
  `;
  document.head.appendChild(style);

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
    applyWeatherIcons();
    observer=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(applyWeatherIcons,20);
    });
    observer.observe(widgets,{subtree:true,childList:true,characterData:true});
  }
  mount();
})();
