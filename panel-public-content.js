// Public, explicitly projected city content. Never reads admin/private collections.
(() => {
  const URL = 'https://europe-west1-elma-bd38c.cloudfunctions.net/panelPublicContent';
  let pending, cached, fetchedAt = 0;
  function valid(data) {
    return data?.schemaVersion === 1 && Array.isArray(data.events) && data.events.length <= 100 &&
      Array.isArray(data.timetables) && data.timetables.length <= 100;
  }
  window.elmaGetPanelContent = () => {
    if (cached && Date.now() - fetchedAt < 60000) return Promise.resolve(cached);
    if (pending) return pending;
    pending = fetch(URL, {signal: AbortSignal.timeout(8000), credentials:'omit'})
      .then(r => {if (!r.ok) throw Error('public-content-unavailable'); return r.json();})
      .then(data => {if (!valid(data)) throw Error('public-content-invalid'); cached=data;fetchedAt=Date.now();return data;})
      .finally(() => {pending=null;});
    return pending;
  };
  const date = value => new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(value);
  async function events() {
    const root=document.getElementById('elmaEventScreen');
    if(!root || !root.classList.contains('show') || root.dataset.panelLoading) return;
    root.dataset.panelLoading='1';
    let list=root.querySelector('[data-public-events]');
    if(!list){root.replaceChildren();const title=document.createElement('h2');title.textContent='Etkinlikler';list=document.createElement('div');list.dataset.publicEvents='';list.setAttribute('aria-live','polite');root.append(title,list);}
    try {
      const data=await window.elmaGetPanelContent();
      const items=data.events.filter(e=>Number.isFinite(e.startsAt)&&Number.isFinite(e.endsAt)&&e.endsAt>Date.now()).sort((a,b)=>a.startsAt-b.startsAt);
      list.replaceChildren();
      if(!items.length){const p=document.createElement('p');p.textContent='Henüz etkinlik yok.';list.append(p);}
      for(const e of items){const card=document.createElement('article');card.className='eg-public-announcement';
        for(const [tag,value] of [['h3',e.title],['small',date(e.startsAt)+' · '+e.venue],['p',e.description]]){const n=document.createElement(tag);n.textContent=String(value||'');card.append(n);}list.append(card);}
      root.style.overflowY='auto';
    }catch{if(!list.childElementCount){const p=document.createElement('p');p.textContent='Etkinlikler yüklenemedi. Bağlantını kontrol edip tekrar aç.';list.append(p);}}
    finally{delete root.dataset.panelLoading;}
  }
  document.addEventListener('click',event=>{if(event.target.closest?.('[data-elma-tab="event"]')) requestAnimationFrame(events);});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)events();});
  // The native tab bridge may dispatch a tab change without a DOM click.
  let observed;
  const observer=new MutationObserver(()=>{const root=document.getElementById('elmaEventScreen');if(root && observed!==root){observed=root;new MutationObserver(events).observe(root,{attributes:true,attributeFilter:['class']});events();}});
  observer.observe(document.body,{childList:true});
  events();
})();
