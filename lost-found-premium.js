(()=>{
  if(window.__elmaLostFoundPremium)return;
  window.__elmaLostFoundPremium=true;
  let query='';

  function addStyles(){
    if(document.getElementById('elmaLostPremiumStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLostPremiumStyle';
    style.textContent=`.eg-panel[data-panel="lost-found"]>.eg-service-back{margin-bottom:3px}.eg-panel[data-panel="lost-found"]>.eg-card{padding:0;border:0;background:transparent;box-shadow:none}.eg-lost-shell{gap:0}.eg-lost-hero.premium{position:relative;min-height:238px;overflow:hidden;display:block;border-radius:28px;background:radial-gradient(circle at 86% 17%,#444 0,#1b1b1d 24%,#080809 66%);color:#fff;padding:24px;box-shadow:0 18px 44px #0003}.eg-lost-hero.premium:after{content:"";position:absolute;right:-44px;bottom:-76px;width:190px;height:190px;border:1px solid #ffffff18;border-radius:50%;box-shadow:0 0 0 26px #ffffff08,0 0 0 54px #ffffff05}.eg-lost-kicker{display:inline-flex;align-items:center;gap:7px;border:1px solid #ffffff28;border-radius:99px;background:#ffffff13;padding:7px 10px;font-size:9px;font-weight:800;letter-spacing:.4px;text-transform:uppercase}.eg-lost-kicker:before{content:"";width:6px;height:6px;border-radius:50%;background:#c9ff72;box-shadow:0 0 0 4px #c9ff7226}.eg-lost-hero-title{position:relative;z-index:2;max-width:260px;margin:16px 0 7px;font-size:30px;font-weight:880;line-height:1.02;letter-spacing:-1.2px}.eg-lost-hero-copy{position:relative;z-index:2;max-width:245px;margin:0;color:#c4c5c8;font-size:11px;line-height:1.5}.eg-lost-hero-visual{position:absolute;z-index:1;right:13px;top:18px;width:116px;height:116px;background-image:url("assets/elma-3d-icons.webp?v=20260830-fast2");background-repeat:no-repeat;background-size:400% 400%;background-position:100% 66.667%;filter:drop-shadow(0 15px 20px #0008);transform:rotate(4deg)}.eg-lost-quick{position:relative;z-index:3;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:19px}.eg-lost-quick-btn{min-height:46px;border:1px solid #ffffff2e;border-radius:14px;background:#ffffff12;color:#fff;font-size:11px;font-weight:850;backdrop-filter:blur(8px)}.eg-lost-quick-btn.primary{background:#fff;color:#09090a;border-color:#fff}.eg-lost-new[hidden]{display:none!important}.eg-lost-overview{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.eg-lost-stat{min-width:0;border:1px solid #e3e3e5;border-radius:18px;background:#fff;padding:13px 8px;text-align:center;box-shadow:0 6px 18px #2220000a}.eg-lost-stat strong{display:block;color:#09090a;font-size:20px;letter-spacing:-.7px}.eg-lost-stat span{display:block;overflow:hidden;margin-top:3px;color:#777a80;font-size:8px;font-weight:800;text-overflow:ellipsis;white-space:nowrap;text-transform:uppercase;letter-spacing:.25px}.eg-lost-tabs{margin:2px 0 10px;padding:4px;border:1px solid #e1e1e3;border-radius:17px;background:#eeeef0}.eg-lost-tab{border:0;background:transparent;padding:10px 12px}.eg-lost-tab.active{box-shadow:0 2px 9px #0002}.eg-lost-tools{display:grid;gap:8px;margin-bottom:13px}.eg-lost-search{display:flex;align-items:center;gap:10px;height:48px;border:1px solid #dfdfe2;border-radius:16px;background:#fff;padding:0 13px}.eg-lost-search svg{width:18px;height:18px;fill:none;stroke:#777a80;stroke-width:2;stroke-linecap:round}.eg-lost-search input{min-width:0;width:100%;border:0;background:transparent;color:#09090a;outline:0;font-size:12px}.eg-lost-filters{gap:7px}.eg-lost-select{height:43px;border-radius:14px;background:#f5f5f6;font-weight:700}.eg-lost-section-head{display:flex;align-items:flex-end;justify-content:space-between;margin:4px 2px 9px}.eg-lost-section-head b{font-size:17px;letter-spacing:-.4px}.eg-lost-section-head span{color:#777a80;font-size:9px;font-weight:750}.eg-lost-status{margin:0 2px 9px}.eg-lost-list{gap:13px}.eg-lost-item{position:relative;border-color:#e1e1e3;border-radius:23px;box-shadow:0 10px 26px #2220000c;transition:transform .18s ease,box-shadow .18s ease}.eg-lost-item:active{transform:scale(.992)}.eg-lost-photo,.eg-lost-placeholder{height:205px}.eg-lost-photo{border-bottom:1px solid #e6e6e8}.eg-lost-placeholder{position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle at 50% 35%,#fff,#eeeeef 68%);border-bottom:1px solid #e2e2e4}.eg-lost-placeholder:before,.eg-lost-placeholder:after{content:"";position:absolute;width:130px;height:130px;border:1px solid #0000000b;border-radius:50%}.eg-lost-placeholder:after{width:190px;height:190px}.eg-lost-placeholder svg{position:relative;z-index:2;width:67px;height:67px;fill:none;stroke:#1f2023;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 8px 10px #0002)}.eg-lost-item-body{padding:16px}.eg-lost-badges{margin-bottom:10px}.eg-lost-badge{padding:6px 9px}.eg-lost-item h3{font-size:18px;letter-spacing:-.35px}.eg-lost-desc{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3;font-size:11px}.eg-lost-meta{padding-top:10px;border-top:1px solid #ededee}.eg-lost-meta span{display:inline-flex;align-items:center;gap:4px}.eg-lost-actions{padding-top:3px}.eg-lost-action{flex:1;min-width:78px;min-height:40px;border-radius:13px}.eg-lost-empty{position:relative;overflow:hidden;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:23px;background:linear-gradient(145deg,#fff,#f3f3f4);font-size:12px}.eg-lost-empty:before{content:"?";display:grid;place-items:center;width:58px;height:58px;margin-bottom:13px;border-radius:20px;background:#09090a;color:#fff;font-size:27px;font-weight:900;box-shadow:0 9px 22px #0003}.eg-lost-request{border-radius:20px;padding:16px;box-shadow:0 8px 22px #2220000a}.eg-lost-form-layer{padding:9px}.eg-lost-form{padding:20px;border-radius:29px}.eg-lost-form-head{position:sticky;z-index:4;top:-20px;margin:-20px -20px 15px;padding:20px;background:#fffffff5;backdrop-filter:blur(14px);border-bottom:1px solid #ececee}.eg-lost-form-head b{font-size:23px;letter-spacing:-.7px}.eg-lost-kind{padding:4px;border-radius:17px;background:#eeeef0}.eg-lost-kind button{border:0;background:transparent;padding:12px 6px}.eg-lost-kind button.active{box-shadow:0 2px 10px #0002}.eg-lost-form-section-title{display:flex;align-items:center;gap:8px;margin:18px 0 10px;color:#09090a;font-size:12px;font-weight:900}.eg-lost-form-section-title:before{content:"";width:8px;height:8px;border-radius:50%;background:#09090a}.eg-lost-field{gap:6px}.eg-lost-field label{font-size:10px}.eg-lost-input,.eg-lost-textarea,.eg-lost-select{border-radius:14px;background:#f7f7f8}.eg-lost-input:focus,.eg-lost-textarea:focus,.eg-lost-select:focus{border-color:#09090a;background:#fff;box-shadow:0 0 0 3px #09090a0e}.eg-lost-photo-field{border:1px dashed #c9c9cd;border-radius:17px;background:#f7f7f8;padding:13px}.eg-lost-count{margin-left:auto;color:#8a8d92;font-size:9px}.eg-lost-submit{min-height:52px;border-radius:17px;margin-top:12px;box-shadow:0 9px 22px #0002}.eg-lost-skeleton{overflow:hidden;height:230px;border-radius:23px;background:linear-gradient(100deg,#eeeeef 20%,#fafafa 38%,#eeeeef 56%);background-size:200% 100%;animation:egLostShimmer 1.2s linear infinite}@keyframes egLostShimmer{to{background-position:-200% 0}}@media(max-width:360px){.eg-lost-hero.premium{padding:20px}.eg-lost-hero-title{font-size:27px}.eg-lost-hero-visual{right:-5px;width:100px;height:100px}.eg-lost-photo,.eg-lost-placeholder{height:175px}}`;
    style.textContent+='.eg-lost-quick-btn,.eg-lost-quick-btn.primary{width:auto!important;height:46px!important}.eg-lost-action,.eg-lost-action.primary{width:auto!important;height:auto!important}';
    document.head.appendChild(style);
  }

  function openKind(kind){
    document.getElementById('egLostNew')?.click();
    requestAnimationFrame(()=>document.querySelector('.eg-lost-kind button[data-kind="'+kind+'"]')?.click());
  }

  function placeholder(){
    const element=document.createElement('div');element.className='eg-lost-placeholder';element.setAttribute('aria-hidden','true');element.innerHTML='<svg viewBox="0 0 64 64"><path d="M18 20h28v34H18z"/><path d="M24 20v-4a8 8 0 0 1 16 0v4M25 31h14M25 39h9"/><circle cx="43" cy="45" r="8"/><path d="m49 51 6 6"/></svg>';return element;
  }

  function decorate(){
    document.querySelectorAll('.eg-lost-item').forEach(card=>{if(!card.querySelector('.eg-lost-photo,.eg-lost-placeholder'))card.prepend(placeholder())});
    applySearch();updateOverview();
  }

  function applySearch(){
    const items=[...document.querySelectorAll('.eg-lost-item')];let visible=0;
    items.forEach(item=>{const show=!query||item.textContent.toLocaleLowerCase('tr-TR').includes(query);item.hidden=!show;if(show)visible++});
    const count=document.getElementById('egLostVisibleCount');if(count)count.textContent=visible+' ilan';
  }

  function updateOverview(){
    const cards=[...document.querySelectorAll('.eg-lost-item')],lost=cards.filter(card=>card.querySelector('.kind-lost')).length,found=cards.filter(card=>card.querySelector('.kind-found')).length;
    const total=document.getElementById('egLostStatTotal'),lostNode=document.getElementById('egLostStatLost'),foundNode=document.getElementById('egLostStatFound');
    if(total)total.textContent=cards.length;if(lostNode)lostNode.textContent=lost;if(foundNode)foundNode.textContent=found;
  }

  function syncMode(button){
    const value=button.dataset.mode,tools=document.querySelector('.eg-lost-tools'),overview=document.querySelector('.eg-lost-overview'),title=document.getElementById('egLostSectionTitle');
    if(tools)tools.hidden=value==='requests';if(overview)overview.hidden=value==='requests';
    if(title)title.textContent=value==='requests'?'İletişim talepleri':value==='mine'?'İlanlarım':value==='lost'?'Kayıp ilanları':value==='found'?'Buluntu ilanları':'Son ilanlar';
    setTimeout(decorate,0);
  }

  function enhanceForm(){
    const form=document.getElementById('egLostForm');if(!form||form.dataset.premium)return;form.dataset.premium='1';
    const fields=[...form.querySelectorAll('.eg-lost-field')];
    const section=(text,before)=>{const label=document.createElement('div');label.className='eg-lost-form-section-title';label.textContent=text;form.insertBefore(label,before)};
    section('Eşya bilgileri',fields[0]);section('Nerede ve ne zaman?',fields[3]);section('İlan ve fotoğraf',fields[6]);
    fields.at(-1)?.classList.add('eg-lost-photo-field');
    const description=document.getElementById('egLostDescription');if(description){const count=document.createElement('span');count.className='eg-lost-count';count.textContent='0 / 800';description.parentElement.querySelector('label')?.appendChild(count);description.addEventListener('input',()=>count.textContent=description.value.length+' / 800')}
  }

  function mount(){
    const panel=document.querySelector('.eg-panel[data-panel="lost-found"]');if(!panel)return false;if(panel.dataset.premium)return true;panel.dataset.premium='1';addStyles();
    const hero=panel.querySelector('.eg-lost-hero');
    hero.classList.add('premium');hero.innerHTML='<span class="eg-lost-kicker">Elma Go topluluğu</span><div class="eg-lost-hero-title">Kaybolduysa birlikte bulalım.</div><p class="eg-lost-hero-copy">Otobüste kaybettiğin veya bulduğun eşyayı birkaç adımda paylaş.</p><div class="eg-lost-hero-visual" aria-hidden="true"></div><div class="eg-lost-quick"><button id="egLostQuickLost" class="eg-lost-quick-btn primary" type="button">Bir şey kaybettim</button><button id="egLostQuickFound" class="eg-lost-quick-btn" type="button">Bir şey buldum</button></div>';
    const oldNew=document.getElementById('egLostNew');oldNew.hidden=true;
    const overview=document.createElement('div');overview.className='eg-lost-overview';overview.innerHTML='<div class="eg-lost-stat"><strong id="egLostStatTotal">0</strong><span>Görünen</span></div><div class="eg-lost-stat"><strong id="egLostStatLost">0</strong><span>Kayıp</span></div><div class="eg-lost-stat"><strong id="egLostStatFound">0</strong><span>Buluntu</span></div>';oldNew.after(overview);
    const tabs=panel.querySelector('.eg-lost-tabs'),tools=document.createElement('div');tools.className='eg-lost-tools';tools.innerHTML='<label class="eg-lost-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg><input id="egLostSearch" type="search" placeholder="Eşya, renk veya konum ara"></label>';tools.appendChild(panel.querySelector('.eg-lost-filters'));tabs.after(tools);
    const status=document.getElementById('egLostStatus'),sectionHead=document.createElement('div');sectionHead.className='eg-lost-section-head';sectionHead.innerHTML='<b id="egLostSectionTitle">Son ilanlar</b><span id="egLostVisibleCount">0 ilan</span>';status.before(sectionHead);
    document.getElementById('egLostQuickLost').onclick=()=>openKind('lost');document.getElementById('egLostQuickFound').onclick=()=>openKind('found');
    document.getElementById('egLostSearch').oninput=event=>{query=event.target.value.trim().toLocaleLowerCase('tr-TR');applySearch()};
    panel.querySelectorAll('.eg-lost-tab').forEach(button=>button.addEventListener('click',()=>syncMode(button)));
    const results=document.getElementById('egLostResults');new MutationObserver(decorate).observe(results,{childList:true});
    enhanceForm();decorate();return true;
  }

  let attempts=0;const timer=setInterval(()=>{if(mount()||++attempts>120)clearInterval(timer)},100);mount();
})();
