(()=>{
  if(window.__elmaLine1StopsMounted)return;
  window.__elmaLine1StopsMounted=true;

  const stops=[[40.6686539,35.8371237],[40.6686671,35.8381533],[40.6682327,35.842059],[40.6678584,35.8450148],[40.6675328,35.8479626],[40.6663284,35.849293],[40.6657343,35.8473993],[40.6645421,35.8445079],[40.6636428,35.8432634],[40.6624994,35.8421771],[40.6612437,35.8411844],[40.6591601,35.8395778],[40.6574652,35.8382206],[40.6558653,35.8370258],[40.6539811,35.836256],[40.6523328,35.8353521],[40.6513743,35.8331741],[40.6504688,35.8300239],[40.6498635,35.8270959],[40.649781,35.8247406],[40.6499052,35.8222918],[40.6499683,35.8196096],[40.6491258,35.8167074],[40.6474489,35.8136175],[40.645021,35.8110077],[40.6427233,35.8079312],[40.6393305,35.8082263],[40.6206543,35.8188991],[40.6176941,35.814688],[40.6132941,35.8128561],[40.6082607,35.8120729],[40.601895,35.8096267],[40.5959719,35.8044012],[40.5637318,35.7900134],[40.564987,35.7927386]];

  function addStyles(){
    if(document.getElementById('elmaLine1StopsStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLine1StopsStyle';
    style.textContent='.eg-line1-stops{margin-top:2px}.eg-line1-stops-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 2px 11px}.eg-line1-stops-head b{display:block;color:#09090a;font-size:15px}.eg-line1-stops-head small{display:block;color:#62656a;font-size:11px;margin-top:3px}.eg-line1-stops-count{min-width:44px;border-radius:99px;background:#09090a;color:#fff;padding:7px 10px;text-align:center;font-size:10px;font-weight:800}.eg-line1-stops-list{display:grid;gap:7px;max-height:62vh;overflow:auto;padding-right:2px}.eg-line1-stop{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid #dedee1;border-radius:15px;background:#f5f5f6;color:#09090a;text-decoration:none}.eg-line1-stop-number{width:30px;height:30px;border-radius:10px;background:#09090a;color:#fff;display:grid;place-items:center;flex:0 0 30px;font-size:10px;font-weight:850}.eg-line1-stop-copy{flex:1;min-width:0}.eg-line1-stop-copy b{display:block;font-size:12px}.eg-line1-stop-arrow{color:#777a80;font-size:18px}';
    document.head.appendChild(style);
  }

  function mount(){
    const card=document.querySelector('.eg-panel[data-panel="stops"] .eg-card');
    if(!card)return false;
    if(card.querySelector('.eg-line1-stops'))return true;
    addStyles();
    const oldList=card.querySelector('.eg-list');
    const block=document.createElement('section');
    block.className='eg-line1-stops';
    block.setAttribute('aria-label','1 numaralı hat gidiş durakları');
    block.innerHTML='<div class="eg-line1-stops-head"><span><b>1 Numaralı Hat</b><small>Gidiş yönündeki sıralı duraklar</small></span><span class="eg-line1-stops-count">'+stops.length+' durak</span></div><div class="eg-line1-stops-list">'+stops.map(function(position,index){const lat=position[0].toFixed(7),lon=position[1].toFixed(7),url='https://www.google.com/maps/search/?api=1&query='+lat+','+lon;return '<a class="eg-line1-stop" href="'+url+'" target="_blank" rel="noopener" aria-label="'+(index+1)+'. durağı Google Maps üzerinde aç"><span class="eg-line1-stop-number">'+(index+1)+'</span><span class="eg-line1-stop-copy"><b>'+(index+1)+'. Durak</b></span><span class="eg-line1-stop-arrow">›</span></a>'}).join('')+'</div>';
    if(oldList)oldList.replaceWith(block);else card.appendChild(block);
    return true;
  }

  let tries=0;
  function boot(){if(mount())return;if(++tries<=50)setTimeout(boot,200)}
  boot();
})();
