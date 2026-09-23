(()=>{
  const PANEL='.eg-panel[data-panel="transport-routes"]';
  const DATA_URL='assets/amasya-transit-data.json?v=20260922-map1';
  let lines=[],open='',direction='outbound',query='';
  const panel=()=>document.querySelector(PANEL);
  const root=()=>document.getElementById('elmaRouteCards');
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number=line=>line.id==='4-alt'?'4 ALT':line.id==='4-ust'?'4 ÜST':String(line.number);
  const title=line=>line.id==='4-alt'?'4 Numaralı Hat · Alt':line.id==='4-ust'?'4 Numaralı Hat · Üst':line.number+' Numaralı Hat';
  function halves(line){
    const stop=line.stops?.[line.returnStartIndex];
    const pivot=line.route.findIndex(point=>point[0]===stop?.lat&&point[1]===stop?.lng);
    const middle=pivot>0&&pivot<line.route.length-1?pivot:Math.floor(line.route.length/2);
    return{outbound:line.route.slice(0,middle+1),return:line.route.slice(middle)};
  }
  function path(points,width,height){
    if(!points?.length)return'';
    const xs=points.map(p=>p[1]),ys=points.map(p=>p[0]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const scale=Math.min((width-28)/Math.max(maxX-minX,.00001),(height-28)/Math.max(maxY-minY,.00001));
    const x0=(width-(maxX-minX)*scale)/2,y0=(height-(maxY-minY)*scale)/2;
    const stride=Math.max(1,Math.floor(points.length/310));
    const sampled=points.filter((_,index)=>index%stride===0);
    if(sampled[sampled.length-1]!==points[points.length-1])sampled.push(points[points.length-1]);
    const xy=point=>[(x0+(point[1]-minX)*scale).toFixed(1),(height-y0-(point[0]-minY)*scale).toFixed(1)];
    const [startX,startY]=xy(sampled[0]),[endX,endY]=xy(sampled[sampled.length-1]);
    return'<svg class="erc-trace" viewBox="0 0 '+width+' '+height+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path class="erc-grid" d="M0 '+height/2+'H'+width+' M'+width/2+' 0V'+height+'"/><path class="erc-track" d="'+sampled.map((point,index)=>{const [x,y]=xy(point);return(index?'L':'M')+x+' '+y}).join(' ')+'"/><circle class="erc-point" cx="'+startX+'" cy="'+startY+'" r="4"/><circle class="erc-point" cx="'+endX+'" cy="'+endY+'" r="4"/></svg>';
  }
  function length(points){
    let sum=0;for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],r=Math.PI/180,dLat=(b[0]-a[0])*r,dLng=(b[1]-a[1])*r;
      const v=Math.sin(dLat/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLng/2)**2;
      sum+=12742*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));
    }return sum.toFixed(1).replace('.',',')+' km';
  }
  function card(line){
    const active=open===line.id,parts=halves(line),points=parts[active?direction:'outbound'];
    return'<article class="erc-card'+(active?' is-open':'')+'"><button type="button" class="erc-card-button" data-route="'+escapeHTML(line.id)+'" aria-expanded="'+active+'" aria-controls="erc-detail-'+escapeHTML(line.id)+'"><span class="erc-card-top"><span class="erc-number">'+escapeHTML(number(line))+'</span><span class="erc-title"><strong>'+escapeHTML(title(line))+'</strong><small>AMASYA · ŞEHİR İÇİ</small></span><span class="erc-chevron" aria-hidden="true">⌄</span></span><span class="erc-preview">'+path(line.route,320,100)+'</span><span class="erc-card-bottom"><span><i class="erc-dot"></i> GÜZERGÂH</span><span>'+escapeHTML(length(line.route))+'</span></span></button><div id="erc-detail-'+escapeHTML(line.id)+'" class="erc-detail"'+(active?'':' hidden')+'>'+(active?'<div class="erc-direction" role="group" aria-label="Güzergâh yönü"><button type="button" data-direction="outbound" aria-pressed="'+(direction==='outbound')+'">Gidiş</button><button type="button" data-direction="return" aria-pressed="'+(direction==='return')+'">Dönüş</button></div><div class="erc-large">'+path(points,560,220)+'</div><div class="erc-detail-foot"><span>'+(direction==='outbound'?'GİDİŞ':'DÖNÜŞ')+'</span><strong>'+escapeHTML(length(points))+'</strong></div>':'')+'</div></article>';
  }
  function render(){
    if(!root())return;
    const q=query.trim().toLocaleLowerCase('tr-TR');
    const filtered=lines.filter(line=>!q||[title(line),number(line)].join(' ').toLocaleLowerCase('tr-TR').includes(q));
    root().querySelector('.erc-list').innerHTML=filtered.length?filtered.map(card).join(''):'<div class="erc-empty">Eşleşen güzergâh bulunamadı.</div>';
    root().querySelector('.erc-count').textContent=filtered.length+' HAT';
  }
  function styles(){
    if(document.getElementById('elmaRouteCardsStyle'))return;
    const style=document.createElement('style');style.id='elmaRouteCardsStyle';
    style.textContent=`
      ${PANEL}{padding-bottom:110px!important}
      .erc-back{display:inline-flex;align-items:center;gap:7px;margin:0 0 17px;padding:5px 0;border:0;background:none;color:var(--erc-muted);font:inherit;font-size:13px;font-weight:700;cursor:pointer}
      .erc{--erc-bg:#fff;--erc-ink:#101113;--erc-muted:#777a80;--erc-border:#dedfe2;--erc-soft:#f5f5f5;color:var(--erc-ink);padding:0 16px 24px;font-family:inherit}
      html:not([data-theme="light"]) .erc{--erc-bg:#171719;--erc-ink:#f6f6f6;--erc-muted:#a3a3a8;--erc-border:#39393d;--erc-soft:#222225}
      .erc *{box-sizing:border-box}.erc-head{display:flex;justify-content:space-between;align-items:flex-end;margin:0 0 19px}.erc-eyebrow{display:block;margin-bottom:6px;color:var(--erc-muted);font-size:10px;font-weight:800;letter-spacing:1.7px}.erc h2{margin:0;color:var(--erc-ink);font-size:32px;font-weight:850;letter-spacing:-1.25px;line-height:1.1}.erc-count{padding:7px 9px;border:1px solid var(--erc-border);border-radius:8px;color:var(--erc-muted);font-size:10px;font-weight:800;letter-spacing:.7px}
      .erc-search{display:flex;align-items:center;gap:10px;height:45px;margin-bottom:17px;padding:0 14px;border:1px solid var(--erc-border);border-radius:13px;background:var(--erc-bg);color:var(--erc-muted)}.erc-search svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2}.erc-search input{width:100%;border:0;outline:0;background:transparent;color:var(--erc-ink);font:inherit;font-size:14px}.erc-search input::placeholder{color:var(--erc-muted)}.erc-search:focus-within{border-color:var(--erc-ink)}
      .erc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.erc-card{min-width:0;overflow:hidden;border:1px solid var(--erc-border);border-radius:19px;background:var(--erc-bg);box-shadow:0 5px 18px #00000008}.erc-card.is-open{grid-column:1/-1;border-color:var(--erc-ink)}.erc-card-button{display:block;width:100%;padding:14px;border:0;background:none;color:inherit;text-align:left;cursor:pointer;font:inherit}.erc-card-button:focus-visible,.erc-direction button:focus-visible{outline:2px solid var(--erc-ink);outline-offset:-3px}.erc-card-top{display:flex;align-items:center;gap:10px}.erc-number{display:grid;flex:0 0 43px;height:43px;place-items:center;border-radius:12px;background:var(--erc-ink);color:var(--erc-bg);font-size:16px;font-weight:850;letter-spacing:-.5px}.erc-title{min-width:0;flex:1}.erc-title strong{display:block;overflow:hidden;color:var(--erc-ink);font-size:12px;font-weight:800;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}.erc-title small{display:block;margin-top:4px;color:var(--erc-muted);font-size:8px;font-weight:750;letter-spacing:.5px;white-space:nowrap}.erc-chevron{color:var(--erc-muted);font-size:20px;line-height:1;transition:transform .2s}.is-open .erc-chevron{transform:rotate(180deg)}
      .erc-preview{display:block;height:102px;margin:11px -4px 10px;overflow:hidden;border:1px solid var(--erc-border);border-radius:11px;background:var(--erc-soft)}.erc-trace{display:block;width:100%;height:100%}.erc-grid{fill:none;stroke:var(--erc-border);stroke-width:.65;stroke-dasharray:3 6}.erc-track{fill:none;stroke:var(--erc-ink);stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}.erc-point{fill:var(--erc-bg);stroke:var(--erc-ink);stroke-width:2}.erc-card-bottom,.erc-detail-foot{display:flex;justify-content:space-between;align-items:center;gap:6px;color:var(--erc-muted);font-size:9px;font-weight:800;letter-spacing:.3px}.erc-card-bottom span:last-child{color:var(--erc-ink);white-space:nowrap}.erc-dot{display:inline-block;width:5px;height:5px;margin-right:3px;border-radius:50%;background:var(--erc-ink);vertical-align:2px}
      .erc-detail{padding:0 14px 15px}.erc-detail[hidden]{display:none}.erc-direction{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:3px;border:1px solid var(--erc-border);border-radius:11px;background:var(--erc-soft)}.erc-direction button{height:34px;border:0;border-radius:8px;background:transparent;color:var(--erc-muted);font:inherit;font-size:12px;font-weight:750;cursor:pointer}.erc-direction button[aria-pressed="true"]{background:var(--erc-ink);color:var(--erc-bg)}.erc-large{height:180px;margin:11px 0;border:1px solid var(--erc-border);border-radius:13px;background:var(--erc-soft)}.erc-detail-foot strong{color:var(--erc-ink);font-size:12px}
      .erc-empty{grid-column:1/-1;padding:35px 15px;border:1px dashed var(--erc-border);border-radius:16px;color:var(--erc-muted);text-align:center;font-size:13px}
      @media(max-width:370px){.erc{padding-right:11px;padding-left:11px}.erc-list{gap:8px}.erc-card-button{padding:10px}.erc-number{flex-basis:37px;height:37px;font-size:14px}.erc-title strong{font-size:11px}.erc-preview{height:86px}.erc-card-bottom{font-size:8px}}
    `;document.head.appendChild(style);
  }
  function mount(){
    const target=panel();if(!target||root())return;
    styles();
    const wrap=document.createElement('div');wrap.id='elmaRouteCards';wrap.className='erc';
    wrap.innerHTML='<button class="erc-back" type="button">‹ Ulaşım</button><div class="erc-head"><div><span class="erc-eyebrow">ULAŞIM / AMASYA</span><h2>Güzergâhlar</h2></div><span class="erc-count">—</span></div><label class="erc-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" placeholder="Hat ara" aria-label="Güzergâh ara"></label><div class="erc-list" aria-live="polite"><div class="erc-empty">Güzergâhlar yükleniyor…</div></div>';
    target.appendChild(wrap);
    wrap.querySelector('.erc-back').addEventListener('click',()=>window.elmaSelectMainTab?.('transport'));
    wrap.querySelector('input').addEventListener('input',event=>{query=event.target.value;render()});
    wrap.querySelector('.erc-list').addEventListener('click',event=>{
      const dir=event.target.closest('[data-direction]');
      if(dir){direction=dir.dataset.direction;render();return}
      const button=event.target.closest('[data-route]');
      if(button){open=open===button.dataset.route?'':button.dataset.route;direction='outbound';render()}
    });
    fetch(DATA_URL).then(response=>{if(!response.ok)throw Error(response.status);return response.json()}).then(data=>{
      lines=data.lines.filter(line=>Array.isArray(line.route)&&line.route.length>1);render();
    }).catch(()=>{wrap.querySelector('.erc-list').innerHTML='<div class="erc-empty">Güzergâhlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</div>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  window.addEventListener('elma-home-widgets-ready',mount);
})();
