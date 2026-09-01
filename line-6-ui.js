(()=>{
  if(window.__elmaLine6UiMounted)return;
  window.__elmaLine6UiMounted=true;
  let loaded=false,mounting=false,dataPromise=null;

  function loadData(){
    if(window.ELMA_TRANSIT?.['6'])return Promise.resolve();
    if(dataPromise)return dataPromise;
    dataPromise=new Promise(ok=>{
      const script=document.createElement('script');
      script.src='line-6-schedule.js?v=20260830-line6';
      script.onload=ok;
      script.onerror=()=>{dataPromise=null;ok()};
      document.head.appendChild(script);
    });
    return dataPromise;
  }

  function addStyles(){
    if(document.getElementById('elmaLine6Style'))return;
    const style=document.createElement('style');
    style.id='elmaLine6Style';
    style.textContent='.eg-line6-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.eg-line6-tabs .eg-line-tab{line-height:1.15;min-height:36px}';
    document.head.appendChild(style);
  }

  function amasyaNow(){
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    const day=parts.weekday==='Sat'?'saturday':parts.weekday==='Sun'?'sunday':'weekday';
    return{day,minute:Number(parts.hour)*60+Number(parts.minute)};
  }

  function renderTimes(detail,key){
    const data=window.ELMA_TRANSIT?.['6'],schedule=data?.schedules?.[key];
    if(!schedule)return;
    const now=amasyaNow();
    const today=now.day==='weekday'&&key==='weekday'||now.day==='saturday'&&key==='saturday'||now.day==='sunday'&&key.startsWith('sunday');
    detail.querySelector('.eg-line-meta').textContent=`${schedule.departure} • ${schedule.times.length} sefer • ${data.stopCount} durak`;
    detail.querySelector('.eg-line-times').innerHTML=schedule.times.map(time=>{
      const [hour,minute]=time.split(':').map(Number),past=today&&hour*60+minute<now.minute;
      return `<div class="eg-line-time${past?' is-past':''}"${past?` aria-label="${time} geçti"`:''}>${time}</div>`;
    }).join('');
    detail.querySelectorAll('.eg-line-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.day===key));
  }

  async function mount(){
    const panel=document.querySelector('.eg-panel[data-panel="lines"] .eg-list');
    if(!panel)return false;
    if(panel.querySelector('.eg-line6')){loaded=true;return true}
    if(mounting)return false;
    mounting=true;
    await loadData();
    const data=window.ELMA_TRANSIT?.['6'];
    if(!data){mounting=false;return false}
    addStyles();
    const wrap=document.createElement('div');
    wrap.innerHTML=`<div class="eg-row eg-line-row eg-line6"><div class="eg-line-bus-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><rect x="7" y="4" width="18" height="21" rx="4"/><path d="M10 9h12M10 14h12M9 20h14M10 25v3M22 25v3"/><circle cx="11" cy="21" r="1.4"/><circle cx="21" cy="21" r="1.4"/></svg></div><div class="eg-row-main"><b>${data.name}</b><small>${data.frequency}</small></div><div class="eg-arrow">›</div></div><div class="eg-line-detail"><div class="eg-line-tabs eg-line6-tabs"><button class="eg-line-tab active" data-day="weekday">Hafta içi</button><button class="eg-line-tab" data-day="saturday">Cumartesi</button><button class="eg-line-tab" data-day="sundayKyk">Pazar • KYK</button><button class="eg-line-tab" data-day="sundayIpekkoy">Pazar • İpekköy</button></div><div class="eg-line-meta"></div><div class="eg-line-times"></div><div class="eg-line-note">Saatler kaynaktaki normal tarifeden alınmıştır. Okullar kapalıyken uygulanan özel saatler bu listeye dahil değildir.</div></div>`;
    const row=wrap.firstElementChild,detail=wrap.lastElementChild;
    panel.append(row,detail);
    row.onclick=()=>{detail.classList.toggle('show');row.querySelector('.eg-arrow').textContent=detail.classList.contains('show')?'⌄':'›'};
    detail.querySelectorAll('.eg-line-tab').forEach(button=>button.onclick=()=>renderTimes(detail,button.dataset.day));
    renderTimes(detail,'weekday');
    loaded=true;
    mounting=false;
    return true;
  }

  let tries=0;
  async function boot(){if(loaded||await mount())return;if(++tries<=40)setTimeout(boot,250)}
  boot();
  setInterval(()=>{
    const detail=document.querySelector('.eg-line6 + .eg-line-detail');
    if(!detail)return;
    renderTimes(detail,detail.querySelector('.eg-line-tab.active')?.dataset.day||'weekday');
  },60000);
})();
