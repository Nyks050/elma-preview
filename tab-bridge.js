(()=>{
  function openTab(name){
    if(name!=='services'&&name!=='account')return false;
    const panels=[...document.querySelectorAll('.eg-panel[data-panel]')];
    const target=panels.find(panel=>panel.dataset.panel===name);
    if(!target)return false;
    document.body.classList.remove('elma-white-flow');
    document.querySelectorAll('.elma-search-screen,.elma-map-screen,.elma-event-screen').forEach(screen=>screen.classList.remove('show'));
    panels.forEach(panel=>panel.classList.toggle('active',panel===target));
    const widgets=document.getElementById('elmaHomeWidgets');
    if(widgets){widgets.style.display='block';widgets.classList.remove('home-active')}
    document.querySelectorAll('.hero,.mapwrap').forEach(element=>{element.style.display='none'});
    document.querySelectorAll('.elma-main-tab[data-elma-tab]').forEach(tab=>tab.classList.toggle('active',tab.dataset.elmaTab===name));
    document.querySelectorAll('.eg-tab[data-tab]').forEach(tab=>{
      const active=tab.dataset.tab===name;
      tab.classList.toggle('active',active);
      tab.setAttribute('aria-selected',String(active));
      if(active)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');
    });
    return true;
  }
  window.elmaOpenInstantTab=openTab;
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.elma-main-tab[data-elma-tab]');
    if(!button)return;
    if(openTab(button.dataset.elmaTab)){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);
})();