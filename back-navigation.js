/* Shared back control: option 1, plain chevron + Geri. */
(()=>{
'use strict';
if(window.__elmaBackNavigation)return;
window.__elmaBackNavigation=true;
const markup='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg><span>Geri</span>';
const selectors=[
'.eg-service-back','.el-dock-back','.erm-back','.est-back',
'.eg-card-page-head button','.eg-chat-back','.eg-announcement-head button',
'#egCityClose','#egLostClose','#egLostDetailClose','#egLostDropClose',
'#jrClose','#jrLoadingClose'
].join(',');
const style=document.createElement('style');
style.id='elmaBackNavigationStyle';
style.textContent=`
html body button.elma-back-control.elma-back-control{
display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:5px!important;
position:static!important;inset:auto!important;transform:none!important;flex:0 0 auto!important;
width:auto!important;min-width:76px!important;max-width:none!important;height:44px!important;min-height:44px!important;
margin:0!important;padding:0!important;border:0!important;border-radius:0!important;
background:transparent!important;color:#111!important;box-shadow:none!important;filter:none!important;
font:600 16px/1 -apple-system,BlinkMacSystemFont,"Inter",Arial,sans-serif!important;
letter-spacing:-.2px!important;text-decoration:none!important;white-space:nowrap!important;
cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
}
html body button.elma-back-control.elma-back-control svg{
display:block!important;width:23px!important;height:23px!important;flex:0 0 23px!important;
margin:0!important;padding:0!important;fill:none!important;stroke:currentColor!important;
stroke-width:2.2!important;stroke-linecap:round!important;stroke-linejoin:round!important;transform:none!important;
}
html body button.elma-back-control.elma-back-control span{font:inherit!important;color:inherit!important}
html body button.elma-back-control.elma-back-control:before,
html body button.elma-back-control.elma-back-control:after{content:none!important}
html body button.elma-back-control.elma-back-control:active{opacity:.55}
html body button.elma-back-control.elma-back-control:focus-visible{outline:2px solid #111!important;outline-offset:4px!important;border-radius:4px!important}
html body .elma-back-header{
display:flex!important;align-items:center!important;gap:12px!important;position:relative;
min-height:60px!important;margin:0 0 16px!important;padding:0!important;
border:0!important;border-bottom:1px solid #ededee!important;background:#fff!important;color:#111!important;
}
html body .elma-back-header>h2{min-width:0;flex:1;margin:0;font-size:18px}
html body .eg-card-page-head.elma-back-header{display:grid!important;grid-template-columns:76px minmax(0,1fr) 76px!important}
html body .eg-chat-head.elma-back-header{padding:8px 16px!important;margin-bottom:0!important}
html body #elmaHomeWidgets>.eg-panel.elma-has-back{padding-top:calc(8px + env(safe-area-inset-top))!important;padding-left:16px!important;padding-right:16px!important}
html body #elmaHomeWidgets>.eg-panel[data-panel="transport-routes"],
html body #elmaHomeWidgets>.eg-panel[data-panel="transport-trips"]{padding-top:0!important;padding-left:0!important;padding-right:0!important}
html body .erm,html body .est{padding-top:calc(8px + env(safe-area-inset-top))!important;padding-left:16px!important;padding-right:16px!important}
html body #elmaHomeWidgets>.eg-panel[data-panel="transport-lines"]{padding-top:calc(8px + env(safe-area-inset-top))!important;padding-left:16px!important;padding-right:16px!important}
html body .eg-announcement-sheet:has(>.elma-back-header),
html body .eg-lost-sheet:has(>.elma-back-header){padding-top:calc(8px + env(safe-area-inset-top))!important;padding-left:16px!important;padding-right:16px!important}
html body .eg-lost-sheet.eg-chat-sheet:has(>.elma-back-header){padding-left:0!important;padding-right:0!important}
`;
document.head.appendChild(style);
function decorate(button){
 if(button.classList.contains('elma-back-control'))return;
 // The original button is retained so its own navigation and cleanup handlers survive.
 button.classList.add('elma-back-control');
 button.innerHTML=markup;
 button.setAttribute('aria-label','Geri');
 const parent=button.parentElement;
 if(parent.matches('.eg-panel,.erm-detail,.est-detail')){
  const header=document.createElement('header');header.className='elma-back-header';
  button.before(header);header.append(button);
  if(parent.matches('.eg-panel'))parent.classList.add('elma-has-back');
 }else if(parent.matches('.el-dock-top,.eg-card-page-head,.eg-chat-head,.eg-lost-sheet-head,.eg-announcement-head,.jr-head')){
  parent.classList.add('elma-back-header');
  if(parent.firstElementChild!==button)parent.prepend(button);
 }
}
function addListBack(list){
 if(list.querySelector(':scope > .elma-back-header'))return;
 const header=document.createElement('header');header.className='elma-back-header';
 const button=document.createElement('button');button.type='button';
 button.onclick=()=>window.elmaSelectMainTab?.('transport');
 header.append(button);list.prepend(header);decorate(button);
}
function scan(){
 // These legacy controls are hidden by their replacement screens. Do not create duplicate headers.
 document.querySelectorAll(selectors).forEach(button=>{
  if(button.matches('.eg-service-back')&&button.parentElement.matches('[data-panel="transport-lines"],[data-panel="transport-trips"],[data-panel="transport-routes"]'))return;
  decorate(button);
 });
 document.querySelectorAll('.erm-list,.est-list').forEach(addListBack);
}
let queued=false;
const observer=new MutationObserver(records=>{
 if(!records.some(record=>record.addedNodes.length))return;
 if(queued)return;queued=true;
 queueMicrotask(()=>{queued=false;scan()});
});
function boot(){scan();observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
