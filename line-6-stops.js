(()=>{
  if(window.__elmaLine6StopsMounted)return;
  window.__elmaLine6StopsMounted=true;

  const directions={outbound:{label:'Gidiş',stops:[[40.650918,35.793865],[40.649455,35.795002],[40.649835,35.795909],[40.650478,35.79769],[40.651829,35.801252],[40.652863,35.803676],[40.654988,35.80513],[40.654975,35.80859],[40.653631,35.81058],[40.653049,35.812613],[40.650741,35.812812],[40.647395,35.813558],[40.644957,35.810779],[40.642661,35.807839],[40.638985,35.808284],[40.632563,35.813225],[40.61771,35.814539],[40.608367,35.812023],[40.604672,35.811176],[40.601721,35.80954]]},inbound:{label:'Dönüş',stops:[[40.601934,35.81014],[40.604459,35.811642],[40.606639,35.812232],[40.602421,35.819056],[40.60402,35.817195],[40.604528,35.815698],[40.607633,35.812259],[40.61322,35.81338],[40.617553,35.815237],[40.619953,35.81911],[40.632747,35.81345],[40.644662,35.811186],[40.646016,35.811272],[40.647621,35.810006],[40.655135,35.808831],[40.655915,35.806203],[40.654974,35.804899],[40.65285,35.803352],[40.652199,35.801673],[40.651316,35.799806],[40.650726,35.797934],[40.649932,35.795584],[40.649576,35.794825]]}};
  let currentDirection='outbound',block=null;

  function addStyles(){
    if(document.getElementById('elmaLine6StopsStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLine6StopsStyle';
    style.textContent='.eg-line6-stops{margin-top:18px;padding-top:17px;border-top:1px solid #dedee1}.eg-line6-stops-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 2px 11px}.eg-line6-stops-head b{display:block;color:#09090a;font-size:15px}.eg-line6-stops-head small{display:block;color:#62656a;font-size:11px;margin-top:3px}.eg-line6-stops-count{min-width:44px;border-radius:99px;background:#09090a;color:#fff;padding:7px 10px;text-align:center;font-size:10px;font-weight:800}.eg-line6-stops-tabs{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:9px;padding:4px;border-radius:13px;background:#ececee}.eg-line6-stops-tab{border:0;border-radius:10px;background:transparent;color:#62656a;padding:9px;font-size:10px;font-weight:850}.eg-line6-stops-tab.active{background:#09090a;color:#fff}.eg-line6-stops-list{display:grid;gap:7px;max-height:62vh;overflow:auto;padding-right:2px}.eg-line6-stop{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid #dedee1;border-radius:15px;background:#f5f5f6;color:#09090a;text-decoration:none}.eg-line6-stop-number{width:30px;height:30px;border-radius:10px;background:#09090a;color:#fff;display:grid;place-items:center;flex:0 0 30px;font-size:10px;font-weight:850}.eg-line6-stop-copy{flex:1;min-width:0}.eg-line6-stop-copy b{display:block;font-size:12px}.eg-line6-stop-arrow{color:#777a80;font-size:18px}';
    document.head.appendChild(style);
  }

  function renderDirection(key){
    currentDirection=key;
    if(!block)return;
    const selected=directions[key];
    block.querySelectorAll('.eg-line6-stops-tab').forEach(button=>button.classList.toggle('active',button.dataset.direction===key));
    block.querySelector('.eg-line6-stops-count').textContent=selected.stops.length+' durak';
    block.querySelector('.eg-line6-stops-list').innerHTML=selected.stops.map(function(position,index){const lat=position[0].toFixed(6),lon=position[1].toFixed(6),url='https://www.google.com/maps/search/?api=1&query='+lat+','+lon;return '<a class="eg-line6-stop" href="'+url+'" target="_blank" rel="noopener" aria-label="6 numaralı hat '+selected.label.toLowerCase()+' '+(index+1)+'. durağını Google Maps üzerinde aç"><span class="eg-line6-stop-number">'+(index+1)+'</span><span class="eg-line6-stop-copy"><b>'+(index+1)+'. Durak</b></span><span class="eg-line6-stop-arrow">›</span></a>'}).join('');
  }

  function mount(){
    const card=document.querySelector('.eg-panel[data-panel="stops"] .eg-card');
    const line1=card?.querySelector('.eg-line1-stops');
    if(!card||!line1)return false;
    if(card.querySelector('.eg-line6-stops'))return true;
    addStyles();
    block=document.createElement('section');
    block.className='eg-line6-stops';
    block.setAttribute('aria-label','6 numaralı hat gidiş ve dönüş durakları');
    block.innerHTML='<div class="eg-line6-stops-head"><span><b>6 Numaralı Hat</b><small>Gidiş ve dönüş yönündeki sıralı duraklar</small></span><span class="eg-line6-stops-count">20 durak</span></div><div class="eg-line6-stops-tabs" role="tablist" aria-label="6 numaralı hat durak yönü"><button class="eg-line6-stops-tab active" type="button" data-direction="outbound">Gidiş</button><button class="eg-line6-stops-tab" type="button" data-direction="inbound">Dönüş</button></div><div class="eg-line6-stops-list"></div>';
    line1.insertAdjacentElement('afterend',block);
    block.querySelectorAll('.eg-line6-stops-tab').forEach(button=>button.onclick=()=>renderDirection(button.dataset.direction));
    renderDirection(currentDirection);
    return true;
  }

  let tries=0;
  function boot(){if(mount())return;if(++tries<=60)setTimeout(boot,200)}
  boot();
})();

