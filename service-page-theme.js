(()=>{
'use strict';
if(window.__elmaServicePageTheme)return;
window.__elmaServicePageTheme=true;
const detailPanels=new Set(['lines','routes','weather','nearby-stops','pharmacies','lost-found','card-service']);
const style=document.createElement('style');style.id='elmaServicePageTheme';style.textContent=`
body.eg-service-detail{background:#fff!important}
body.eg-service-detail #elmaHomeWidgets{width:100%!important;max-width:520px!important;min-height:100dvh!important;margin:0 auto!important;padding:0!important;background:#fff!important;color:#09090a!important;font-family:-apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif!important}
body.eg-service-detail #elmaHomeWidgets>.eg-panel.active{min-height:100dvh!important;padding:calc(18px + env(safe-area-inset-top)) 6% calc(92px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;background:#fff!important;color:#09090a!important}
body.eg-service-detail .eg-service-back{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;min-width:42px!important;height:42px!important;margin:0 0 18px!important;padding:0 14px!important;border:0!important;border-radius:14px!important;background:#f1f1f2!important;color:#161617!important;font:700 12px/1 -apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif!important}
body.eg-service-detail .eg-screen-head{padding:0 0 18px!important}
body.eg-service-detail .eg-screen-title,body.eg-service-detail .eg-card-page-head h2{margin:0!important;font-size:24px!important;font-weight:800!important;line-height:1.15!important;letter-spacing:-.045em!important;color:#09090a!important}
body.eg-service-detail .eg-screen-subtitle{margin:6px 0 0!important;color:#69696d!important;font-size:13px!important;font-weight:450!important;line-height:1.45!important}
body.eg-service-detail .eg-card-page-head{height:42px!important;margin:0 0 18px!important;grid-template-columns:42px 1fr 42px!important}
body.eg-service-detail .eg-card-page-head button{width:42px!important;height:42px!important;border-radius:14px!important;background:#f1f1f2!important;color:#161617!important}
body.eg-service-detail .eg-card,body.eg-service-detail .eg-lost-shell{border:1px solid #dedee1!important;border-radius:22px!important;background:#fff!important;color:#09090a!important;padding:18px!important;box-shadow:none!important}
body.eg-service-detail .eg-head{align-items:center!important;margin-bottom:16px!important}
body.eg-service-detail .eg-title{font-size:22px!important;font-weight:800!important;line-height:1.2!important;letter-spacing:-.04em!important;color:#09090a!important}
body.eg-service-detail .eg-muted{margin-top:4px!important;color:#69696d!important;font-size:12px!important;line-height:1.45!important}
body.eg-service-detail .eg-nearby-head-icon,body.eg-service-detail .eg-weather-icon,body.eg-service-detail .eg-lost-head-icon{display:grid!important;place-items:center!important;width:52px!important;height:52px!important;flex:0 0 52px!important;padding:12px!important;border-radius:17px!important;background:#f1f1f2!important;color:#09090a!important;filter:none!important;box-sizing:border-box!important}
body.eg-service-detail .eg-nearby-head-icon svg,body.eg-service-detail .eg-weather-icon svg,body.eg-service-detail .eg-lost-head-icon svg{display:block!important;width:100%!important;height:100%!important;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
body.eg-service-detail .eg-row,body.eg-service-detail .eg-pharmacy-item,body.eg-service-detail .eg-lost-item,body.eg-service-detail .eg-card-feature{border:1px solid #dedee1!important;border-radius:18px!important;background:#fff!important;color:#09090a!important;box-shadow:none!important}
body.eg-service-detail .eg-row{min-height:74px!important;padding:14px!important;gap:12px!important}
body.eg-service-detail .eg-row-main b,body.eg-service-detail .eg-pharmacy-item b{font-size:14px!important;font-weight:750!important;color:#09090a!important}
body.eg-service-detail .eg-row-main small,body.eg-service-detail .eg-pharmacy-address{font-size:11px!important;line-height:1.45!important;color:#69696d!important}
body.eg-service-detail .eg-line-bus-icon{display:grid!important;place-items:center!important;width:44px!important;height:44px!important;flex:0 0 44px!important;padding:10px!important;border-radius:15px!important;background:#f1f1f2!important;color:#09090a!important;box-sizing:border-box!important}
body.eg-service-detail .eg-line-tabs{display:grid!important;gap:5px!important;margin:0 0 10px!important;padding:4px!important;border-radius:14px!important;background:#ededee!important}
body.eg-service-detail .eg-line-tab{min-height:38px!important;border:0!important;border-radius:11px!important;background:transparent!important;color:#62656a!important;font-size:10px!important;font-weight:750!important}
body.eg-service-detail .eg-line-tab.active{background:#09090a!important;color:#fff!important}
body.eg-service-detail .eg-line-detail.show{margin:8px 0 14px!important;padding:12px!important;border:1px solid #e3e3e5!important;border-radius:18px!important;background:#fafafa!important}
body.eg-service-detail .eg-line-meta{margin:0 2px 10px!important;color:#69696d!important;font-size:11px!important;line-height:1.4!important}
body.eg-service-detail .eg-line-times{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:7px!important;max-height:300px!important}
body.eg-service-detail .eg-line-time{display:grid!important;place-items:center!important;min-height:40px!important;padding:7px 2px!important;border:1px solid #dcdcdf!important;border-radius:12px!important;background:#fff!important;color:#151516!important;font-size:13px!important;font-weight:750!important;text-decoration:none!important;filter:none!important}
body.eg-service-detail .eg-line-time.is-past{border-color:#e8e8ea!important;background:#f4f4f5!important;color:#8e9095!important;opacity:.6!important;text-decoration:line-through!important;text-decoration-line:line-through!important;text-decoration-thickness:1.5px!important;text-decoration-color:#777a80!important;filter:none!important}
body.eg-service-detail .eg-line-note{margin-top:10px!important;color:#777a80!important;font-size:10px!important;line-height:1.45!important}
body.eg-service-detail button,body.eg-service-detail input,body.eg-service-detail select,body.eg-service-detail textarea{font-family:-apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif!important}
body.eg-service-detail .eg-lost-new,body.eg-service-detail .eg-pharmacy-locate,body.eg-service-detail .eg-nearby-locate{min-height:44px!important;border-radius:14px!important;font-size:12px!important}
body.eg-service-detail .eg-lost-tab,body.eg-service-detail .eg-lost-select,body.eg-service-detail .eg-lost-input,body.eg-service-detail .eg-lost-textarea{font-size:11px!important}
/* Sefer Saatleri: the same light cards and dark accents as the Services landing page. */
body.eg-service-detail #elmaHomeWidgets>.eg-panel[data-panel="lines"]{padding-top:calc(30px + env(safe-area-inset-top))!important}
body.eg-service-detail [data-panel="lines"] .eg-screen-head{padding:0 0 23px!important}
body.eg-service-detail [data-panel="lines"] .eg-screen-title{font-size:clamp(32px,8.5vw,42px)!important;line-height:1.06!important;letter-spacing:-.06em!important}
body.eg-service-detail [data-panel="lines"] .eg-screen-subtitle{margin-top:9px!important;font-size:14px!important;color:#73767c!important;font-weight:500!important}
body.eg-service-detail [data-panel="lines"] .eg-schedule-section{display:flex;align-items:baseline;justify-content:space-between;margin:6px 0 14px}
body.eg-service-detail [data-panel="lines"] .eg-schedule-section h3{margin:0;font-size:22px;font-weight:800;letter-spacing:-.05em}
body.eg-service-detail [data-panel="lines"] .eg-schedule-section span{color:#858891;font-size:10px;font-weight:750;letter-spacing:.09em}
body.eg-service-detail [data-panel="lines"] .eg-list{gap:11px}
body.eg-service-detail [data-panel="lines"] .eg-line-row{min-height:84px!important;padding:16px!important;gap:14px!important;border:1px solid #ececef!important;border-radius:21px!important;background:#f7f7f8!important;box-shadow:none!important;transition:transform .18s ease,background .18s ease}
body.eg-service-detail [data-panel="lines"] .eg-line-row:active{transform:scale(.985);background:#eeeff1!important}
body.eg-service-detail [data-panel="lines"] .eg-line-row:focus-visible{outline:2px solid #17191d;outline-offset:2px}
body.eg-service-detail [data-panel="lines"] .eg-line-bus-icon{width:48px!important;height:48px!important;flex-basis:48px!important;padding:2px!important;border-radius:14px!important;background:#17191d!important;color:#fff!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:1px}
body.eg-service-detail [data-panel="lines"] .eg-line-number{display:block;font-size:23px;line-height:1;font-weight:850;letter-spacing:-.06em}
body.eg-service-detail [data-panel="lines"] .eg-line-bus-icon:after{content:"HAT";display:block;color:#d4d5da;font-size:8px;font-weight:800;line-height:1;letter-spacing:.12em}
body.eg-service-detail [data-panel="lines"] .eg-row-main b{font-size:16px!important;font-weight:800!important;letter-spacing:-.035em!important}
body.eg-service-detail [data-panel="lines"] .eg-row-main small{font-size:11px!important;color:#74777e!important}
body.eg-service-detail [data-panel="lines"] .eg-arrow{width:27px;height:27px;display:grid;place-items:center;border-radius:50%;background:#e9eaed;color:#34363a;font-size:21px;line-height:1}
body.eg-service-detail [data-panel="lines"] .eg-line-detail.show{margin:-2px 0 12px!important;padding:16px!important;border:1px solid #e8e9eb!important;border-radius:20px!important;background:#fff!important;box-shadow:0 9px 25px #1113180d!important}
body.eg-service-detail [data-panel="lines"] .eg-line-tabs{gap:5px!important;margin:0 0 16px!important;padding:4px!important;border-radius:15px!important;background:#f0f0f2!important}
body.eg-service-detail [data-panel="lines"] .eg-line-tab{min-height:43px!important;border-radius:12px!important;color:#62656b!important;font-size:11px!important}
body.eg-service-detail [data-panel="lines"] .eg-line-tab.active{background:#17191d!important;color:#fff!important;box-shadow:0 4px 10px #11131822!important}
body.eg-service-detail [data-panel="lines"] .eg-line-meta{margin:0 0 12px!important;font-size:11px!important;font-weight:650!important;color:#63666c!important}
body.eg-service-detail [data-panel="lines"] .eg-line-times{gap:8px!important;max-height:370px!important}
body.eg-service-detail [data-panel="lines"] .eg-line-time{min-height:47px!important;border:1px solid #e9eaed!important;border-radius:13px!important;background:#f8f8f9!important;color:#17191d!important;font-size:14px!important;font-weight:800!important}
body.eg-service-detail [data-panel="lines"] .eg-line-time.is-past{border-color:#eeeef0!important;background:#f3f3f4!important;color:#858890!important;opacity:.55!important;text-decoration-line:line-through!important;text-decoration-style:solid!important;text-decoration-thickness:2px!important;text-decoration-color:#74777e!important}
body.eg-service-detail [data-panel="lines"] .eg-line-note{margin-top:13px!important;font-size:10px!important;color:#777a80!important}
@media(prefers-reduced-motion:reduce){body.eg-service-detail [data-panel="lines"] .eg-line-row{transition:none}}
@media(max-width:350px){body.eg-service-detail .eg-line-times{grid-template-columns:repeat(3,minmax(0,1fr))!important}body.eg-service-detail #elmaHomeWidgets>.eg-panel.active{padding-left:5%!important;padding-right:5%!important}}
`;
document.head.appendChild(style);
function sync(){const active=document.querySelector('#elmaHomeWidgets>.eg-panel.active');document.body.classList.toggle('eg-service-detail',Boolean(active&&detailPanels.has(active.dataset.panel)))}
const observer=new MutationObserver(sync);observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});sync();
})();
