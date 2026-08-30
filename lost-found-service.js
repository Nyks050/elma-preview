(()=>{
  if(window.__elmaLostFoundMounted)return;
  window.__elmaLostFoundMounted=true;

  const APP_CONFIG={apiKey:'AIzaSyBWic36WVTPG5oWUtSCJ-6MWrKWbO_w9aQ',authDomain:'elma-bd38c.firebaseapp.com',projectId:'elma-bd38c',storageBucket:'elma-bd38c.firebasestorage.app',messagingSenderId:'675060354080',appId:'1:675060354080:web:cef2e0c3145440e2d40045'};
  const APP_URL='https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
  const AUTH_URL='https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
  const DB_URL='https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
  const STORAGE_URL='https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js';
  const listingIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 5h16v22H8z"/><path d="M12 10h8M12 15h8M12 20h5"/><circle cx="22.5" cy="22.5" r="4.5"/><path d="m26 26 3 3"/></svg>';
  const categories=['Çanta','Cüzdan','Telefon','Anahtar','Belge/Kart','Giyim','Elektronik','Diğer'];
  let api=null,user=null,listings=[],requests=[],unsubscribeListings=null,unsubscribeRequests=null,mode='all',editing=null;

  const $=selector=>document.querySelector(selector);
  const escapeText=value=>String(value??'');
  const dateValue=value=>value?.toDate?.()||value instanceof Date&&value||value?.seconds&&new Date(value.seconds*1000)||null;
  const trDate=value=>{const date=dateValue(value)||new Date(value);return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(date)};
  const activeListing=item=>item.status!=='solved'&&(!dateValue(item.expiresAt)||dateValue(item.expiresAt)>new Date());

  function addStyles(){
    if(document.getElementById('elmaLostFoundStyle'))return;
    const style=document.createElement('style');
    style.id='elmaLostFoundStyle';
    style.textContent=`.eg-lost-card{min-height:134px}.eg-lost-shell{display:grid;gap:13px}.eg-lost-hero{display:flex;align-items:center;justify-content:space-between;gap:12px}.eg-lost-head-icon{width:58px;height:58px;flex:0 0 58px}.eg-lost-new{border:0;border-radius:14px;background:#09090a;color:#fff;padding:12px 14px;font-size:12px;font-weight:850}.eg-lost-tabs{display:flex;gap:6px;overflow:auto;padding:2px 0;scrollbar-width:none}.eg-lost-tabs::-webkit-scrollbar{display:none}.eg-lost-tab{flex:0 0 auto;border:1px solid #dedee1;border-radius:99px;background:#fff;color:#5f6267;padding:9px 12px;font-size:10px;font-weight:800}.eg-lost-tab.active{background:#09090a;border-color:#09090a;color:#fff}.eg-lost-filters{display:grid;grid-template-columns:1fr 1fr;gap:8px}.eg-lost-select,.eg-lost-input,.eg-lost-textarea{width:100%;border:1px solid #dedee1;border-radius:13px;background:#fff;color:#09090a;outline:0;padding:11px 12px;font-size:12px}.eg-lost-textarea{min-height:92px;resize:vertical;line-height:1.45}.eg-lost-status{min-height:17px;color:#66696e;font-size:10px;line-height:1.45}.eg-lost-status.error{color:#b42318}.eg-lost-list{display:grid;gap:10px}.eg-lost-item{overflow:hidden;border:1px solid #dedee1;border-radius:19px;background:#fff}.eg-lost-photo{display:block;width:100%;height:176px;object-fit:cover;background:#f1f1f2}.eg-lost-item-body{padding:14px}.eg-lost-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px}.eg-lost-badge{border-radius:99px;background:#ededee;color:#55585d;padding:5px 8px;font-size:9px;font-weight:800}.eg-lost-badge.kind-lost{background:#09090a;color:#fff}.eg-lost-badge.kind-found{background:#dfeee4;color:#17643a}.eg-lost-item h3{margin:0 0 6px;color:#09090a;font-size:16px}.eg-lost-desc{margin:0;color:#55585d;font-size:11px;line-height:1.5;white-space:pre-wrap}.eg-lost-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;color:#777a80;font-size:9px}.eg-lost-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.eg-lost-action{min-height:36px;border:1px solid #d7d7da;border-radius:11px;background:#f4f4f5;color:#09090a;padding:8px 10px;font-size:10px;font-weight:800}.eg-lost-action.primary{background:#09090a;border-color:#09090a;color:#fff}.eg-lost-action.danger{color:#a32920}.eg-lost-empty{border:1px dashed #d5d5d8;border-radius:18px;padding:28px 16px;text-align:center;color:#777a80;font-size:11px;line-height:1.5}.eg-lost-request{border:1px solid #dedee1;border-radius:17px;background:#fff;padding:13px}.eg-lost-request b{display:block;color:#09090a;font-size:13px}.eg-lost-request small{display:block;margin-top:5px;color:#66696e;font-size:10px;line-height:1.4}.eg-lost-form-layer{position:fixed;inset:0;z-index:1300;display:none;align-items:flex-end;justify-content:center;background:#0008;backdrop-filter:blur(10px);padding:12px}.eg-lost-form-layer.show{display:flex}.eg-lost-form{width:100%;max-width:470px;max-height:91dvh;overflow:auto;border:1px solid #d9d9dc;border-radius:27px;background:#fff;color:#09090a;padding:18px;box-shadow:0 26px 80px #0006}.eg-lost-form-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.eg-lost-form-head b{font-size:20px}.eg-lost-close{width:36px;height:36px;border:0;border-radius:50%;background:#ededee;color:#09090a;font-size:20px}.eg-lost-kind{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}.eg-lost-kind button{border:1px solid #d8d8dc;border-radius:13px;background:#fff;color:#5d6065;padding:11px 6px;font-size:11px;font-weight:800}.eg-lost-kind button.active{background:#09090a;color:#fff;border-color:#09090a}.eg-lost-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.eg-lost-field{display:grid;gap:5px;margin-bottom:9px}.eg-lost-field label{color:#62656a;font-size:10px;font-weight:750}.eg-lost-photo-note{color:#777a80;font-size:9px;line-height:1.4}.eg-lost-submit{width:100%;min-height:48px;border:0;border-radius:15px;background:#09090a;color:#fff;font-weight:850;margin-top:5px}.eg-lost-submit:disabled{opacity:.55}@media(max-width:350px){.eg-lost-grid,.eg-lost-filters{grid-template-columns:1fr}.eg-lost-photo{height:150px}}`;
    document.head.appendChild(style);
  }

  function showPanel(panel){
    document.querySelectorAll('.eg-panel').forEach(item=>item.classList.toggle('active',item===panel));
    document.querySelectorAll('.eg-tab').forEach(tab=>{const active=tab.dataset.tab==='services';tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active))});
    const hero=$('.hero'),map=$('.mapwrap'),widgets=$('#elmaHomeWidgets');
    if(hero)hero.style.display='none';
    if(map)map.style.display='none';
    widgets?.classList.remove('home-active');
  }

  function goServices(){const panel=$('.eg-panel[data-panel="services"]');if(panel)showPanel(panel)}
  function setStatus(text,error=false){const element=$('#egLostStatus');if(element){element.textContent=text;element.classList.toggle('error',error)}}

  async function connectFirebase(){
    if(api)return api;
    const [appModule,authModule,dbModule,storageModule]=await Promise.all([import(APP_URL),import(AUTH_URL),import(DB_URL),import(STORAGE_URL)]);
    for(let i=0;i<30&&!appModule.getApps().length;i++)await new Promise(resolve=>setTimeout(resolve,50));
    const app=appModule.getApps()[0]||appModule.initializeApp(APP_CONFIG);
    const auth=authModule.getAuth(app),db=dbModule.getFirestore(app),storage=storageModule.getStorage(app);
    api={...authModule,...dbModule,...storageModule,auth,db,storage};
    authModule.onAuthStateChanged(auth,next=>{user=next;subscribeRequests();render();prefillUser()});
    subscribeListings();
    return api;
  }

  function subscribeListings(){
    if(!api||unsubscribeListings)return;
    const source=api.query(api.collection(api.db,'lostFoundListings'),api.orderBy('createdAt','desc'),api.limit(80));
    unsubscribeListings=api.onSnapshot(source,snapshot=>{listings=snapshot.docs.map(item=>({id:item.id,...item.data()}));setStatus(listings.length?listings.length+' ilan yüklendi.':'Henüz ilan yok.');render()},error=>setStatus(error.code==='permission-denied'?'Kayıp ilanları için Firebase veritabanı izni gerekli.':'İlanlar alınamadı. Daha sonra tekrar dene.',true));
  }

  function subscribeRequests(){
    unsubscribeRequests?.();unsubscribeRequests=null;requests=[];
    if(!api||!user){render();return}
    const source=api.query(api.collection(api.db,'lostFoundContacts'),api.where('ownerUid','==',user.uid));
    unsubscribeRequests=api.onSnapshot(source,snapshot=>{requests=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>(dateValue(b.createdAt)||0)-(dateValue(a.createdAt)||0));render()},()=>{});
  }

  function currentItems(){
    const category=$('#egLostCategoryFilter')?.value||'all',line=$('#egLostLineFilter')?.value||'all';
    return listings.filter(item=>{
      if(mode==='lost'&&item.kind!=='lost')return false;
      if(mode==='found'&&item.kind!=='found')return false;
      if(mode==='mine'&&item.ownerUid!==user?.uid)return false;
      if(mode!=='mine'&&!activeListing(item))return false;
      if(category!=='all'&&item.category!==category)return false;
      if(line!=='all'&&item.line!==line)return false;
      return true;
    });
  }

  function render(){
    const list=$('#egLostResults');if(!list)return;
    list.replaceChildren();
    if(mode==='requests')return renderRequests(list);
    if(mode==='mine'&&!user)return empty(list,'Kendi ilanlarını görmek için hesabınla giriş yap.');
    const items=currentItems();
    if(!items.length)return empty(list,mode==='mine'?'Henüz bir ilan vermedin.':'Bu filtrelere uygun aktif ilan yok.');
    items.forEach(item=>list.appendChild(listingCard(item)));
  }

  function empty(container,text){const element=document.createElement('div');element.className='eg-lost-empty';element.textContent=text;container.appendChild(element)}

  function listingCard(item){
    const card=document.createElement('article');card.className='eg-lost-item';
    if(item.photoUrl){const image=document.createElement('img');image.className='eg-lost-photo';image.src=item.photoUrl;image.alt=escapeText(item.title);image.loading='lazy';card.appendChild(image)}
    const body=document.createElement('div');body.className='eg-lost-item-body';
    const badges=document.createElement('div');badges.className='eg-lost-badges';
    [['eg-lost-badge kind-'+item.kind,item.kind==='found'?'Bulundu':'Kayıp'],['eg-lost-badge',item.category||'Diğer'],['eg-lost-badge',item.line==='bus'?'Otobüste':item.line==='other'?'Diğer':item.line?'Hat '+item.line:'Konum belirtilmedi']].forEach(([className,text])=>{const badge=document.createElement('span');badge.className=className;badge.textContent=text;badges.appendChild(badge)});
    if(!activeListing(item)){const badge=document.createElement('span');badge.className='eg-lost-badge';badge.textContent=item.status==='solved'?'Çözüldü':'Arşivlendi';badges.appendChild(badge)}
    const title=document.createElement('h3');title.textContent=item.title||'İsimsiz eşya';
    const description=document.createElement('p');description.className='eg-lost-desc';description.textContent=item.description||'';
    const meta=document.createElement('div');meta.className='eg-lost-meta';
    [item.location,item.happenedAt&&trDate(item.happenedAt),item.ownerName&&'İlan: '+item.ownerName].filter(Boolean).forEach(text=>{const span=document.createElement('span');span.textContent=text;meta.appendChild(span)});
    const actions=document.createElement('div');actions.className='eg-lost-actions';
    if(item.ownerUid===user?.uid){
      if(activeListing(item))actions.append(action('Çözüldü','primary',()=>solve(item)),action('Düzenle','',()=>openForm(item)));
      actions.append(action('Sil','danger',()=>removeListing(item)));
    }else if(activeListing(item)){
      actions.append(action('İletişim isteği','primary',()=>openContact(item)));
      actions.append(action('Şikâyet et','',()=>report(item)));
    }
    body.append(badges,title,description,meta,actions);card.appendChild(body);return card;
  }

  function action(label,className,handler){const button=document.createElement('button');button.type='button';button.className='eg-lost-action'+(className?' '+className:'');button.textContent=label;button.onclick=handler;return button}

  function renderRequests(container){
    if(!user)return empty(container,'İletişim taleplerini görmek için hesabınla giriş yap.');
    if(!requests.length)return empty(container,'İlanlarına henüz iletişim isteği gelmedi.');
    requests.forEach(request=>{
      const item=document.createElement('article');item.className='eg-lost-request';
      const title=document.createElement('b');title.textContent=request.listingTitle||'Kayıp eşya ilanı';
      const copy=document.createElement('small');copy.textContent=(request.requesterName||'Kullanıcı')+' • '+(request.requesterContact||'İletişim bilgisi yok')+' • '+trDate(request.createdAt);
      const actions=document.createElement('div');actions.className='eg-lost-actions';
      const contact=escapeText(request.requesterContact).trim();
      if(contact){const isMail=contact.includes('@'),link=document.createElement('a');link.className='eg-lost-action primary';link.textContent=isMail?'E-posta gönder':'Ara';link.href=(isMail?'mailto:':'tel:')+(isMail?contact:contact.replace(/[^\d+]/g,''));actions.appendChild(link)}
      if(request.status!=='done')actions.append(action('Tamamlandı','',()=>api.updateDoc(api.doc(api.db,'lostFoundContacts',request.id),{status:'done'})));
      item.append(title,copy,actions);container.appendChild(item);
    });
  }

  function prefillUser(){
    const name=$('#egLostOwnerName');if(name&&!name.value)name.value=user?.displayName||user?.email?.split('@')[0]||'';
    const contact=$('#egLostContactValue');if(contact&&!contact.value)contact.value=user?.phoneNumber||user?.email||'';
  }

  function openForm(item=null){
    if(!user){setStatus('İlan vermek için hesabınla giriş yap.',true);return}
    editing=item;const layer=$('#egLostFormLayer'),form=$('#egLostForm');form.reset();
    const kind=item?.kind||'lost';setFormKind(kind);
    $('#egLostFormTitle').textContent=item?'İlanı düzenle':'Yeni ilan';
    $('#egLostTitle').value=item?.title||'';$('#egLostCategory').value=item?.category||'Diğer';$('#egLostLine').value=item?.line||'bus';$('#egLostLocation').value=item?.location||'';$('#egLostWhen').value=item?.happenedAt?localDateTime(item.happenedAt):localDateTime(new Date());$('#egLostDescription').value=item?.description||'';$('#egLostOwnerName').value=item?.ownerName||user.displayName||user.email?.split('@')[0]||'';
    $('#egLostPhoto').required=false;$('#egLostSubmit').textContent=item?'Değişiklikleri kaydet':'İlanı yayımla';layer.classList.add('show');
  }

  function closeForm(){editing=null;$('#egLostFormLayer')?.classList.remove('show')}
  function localDateTime(value){const date=dateValue(value)||new Date(value),offset=date.getTimezoneOffset();return new Date(date.getTime()-offset*60000).toISOString().slice(0,16)}
  function setFormKind(kind){$('#egLostKind').value=kind;document.querySelectorAll('.eg-lost-kind button').forEach(button=>button.classList.toggle('active',button.dataset.kind===kind))}

  async function compressImage(file){
    if(!file)return null;if(file.size>8*1024*1024)throw new Error('Fotoğraf en fazla 8 MB olabilir.');
    const bitmap=await createImageBitmap(file),scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();return new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.82));
  }

  async function submitListing(event){
    event.preventDefault();if(!user)return setStatus('İlan vermek için giriş yap.',true);
    const wasEditing=Boolean(editing);
    const button=$('#egLostSubmit');button.disabled=true;button.textContent='Kaydediliyor…';
    try{
      const payload={kind:$('#egLostKind').value,title:$('#egLostTitle').value.trim(),category:$('#egLostCategory').value,line:$('#egLostLine').value,location:$('#egLostLocation').value.trim(),happenedAt:api.Timestamp.fromDate(new Date($('#egLostWhen').value)),description:$('#egLostDescription').value.trim(),ownerUid:user.uid,ownerName:$('#egLostOwnerName').value.trim()||'Elma Go kullanıcısı',updatedAt:api.serverTimestamp()};
      if(!payload.title||!payload.location||!payload.description)throw new Error('Başlık, konum ve açıklama zorunlu.');
      const reference=editing?api.doc(api.db,'lostFoundListings',editing.id):api.doc(api.collection(api.db,'lostFoundListings'));
      const file=$('#egLostPhoto').files?.[0];
      if(file){const blob=await compressImage(file),path='lost-found/'+user.uid+'/'+reference.id+'.jpg',storageRef=api.ref(api.storage,path);await api.uploadBytes(storageRef,blob,{contentType:'image/jpeg'});payload.photoUrl=await api.getDownloadURL(storageRef);payload.photoPath=path}
      if(editing)await api.updateDoc(reference,payload);else await api.setDoc(reference,{...payload,status:'active',createdAt:api.serverTimestamp(),expiresAt:api.Timestamp.fromDate(new Date(Date.now()+30*86400000))});
      closeForm();setStatus(wasEditing?'İlan güncellendi.':'İlan yayımlandı.');
    }catch(error){setStatus(error.message||'İlan kaydedilemedi.',true)}finally{button.disabled=false;button.textContent=wasEditing?'Değişiklikleri kaydet':'İlanı yayımla'}
  }

  async function solve(item){if(!confirm('Bu ilan çözüldü olarak işaretlensin mi?'))return;try{await api.updateDoc(api.doc(api.db,'lostFoundListings',item.id),{status:'solved',updatedAt:api.serverTimestamp()})}catch(error){setStatus('İlan güncellenemedi.',true)}}
  async function removeListing(item){if(!confirm('İlan kalıcı olarak silinsin mi?'))return;try{await api.deleteDoc(api.doc(api.db,'lostFoundListings',item.id));if(item.photoPath)await api.deleteObject(api.ref(api.storage,item.photoPath)).catch(()=>{})}catch(error){setStatus('İlan silinemedi.',true)}}

  function openContact(item){
    if(!user)return setStatus('İletişim isteği için hesabınla giriş yap.',true);
    $('#egLostContactListing').value=item.id;$('#egLostContactTitle').textContent=item.title;$('#egLostContactValue').value=user.phoneNumber||user.email||'';$('#egLostContactLayer').classList.add('show');
  }

  async function submitContact(event){
    event.preventDefault();const listing=listings.find(item=>item.id===$('#egLostContactListing').value),contact=$('#egLostContactValue').value.trim();if(!listing||!contact)return;
    try{await api.setDoc(api.doc(api.db,'lostFoundContacts',listing.id+'_'+user.uid),{listingId:listing.id,listingTitle:listing.title,ownerUid:listing.ownerUid,requesterUid:user.uid,requesterName:user.displayName||user.email?.split('@')[0]||'Elma Go kullanıcısı',requesterContact:contact,status:'new',createdAt:api.serverTimestamp()});$('#egLostContactLayer').classList.remove('show');setStatus('İletişim isteğin ilan sahibine gönderildi.')}catch(error){setStatus('İletişim isteği gönderilemedi.',true)}
  }

  async function report(item){if(!user)return setStatus('Şikâyet göndermek için hesabınla giriş yap.',true);const reason=prompt('Şikâyet nedenini kısaca yaz.');if(!reason?.trim())return;try{await api.addDoc(api.collection(api.db,'lostFoundReports'),{listingId:item.id,listingTitle:item.title,reporterUid:user.uid,reason:reason.trim().slice(0,500),createdAt:api.serverTimestamp()});setStatus('Şikâyetin inceleme için kaydedildi.')}catch(error){setStatus('Şikâyet gönderilemedi.',true)}}

  function mount(){
    const widgets=$('#elmaHomeWidgets'),grid=widgets?.querySelector('.eg-services-grid');if(!widgets||!grid)return false;if($('.eg-lost-card'))return true;
    addStyles();
    const card=document.createElement('button');card.className='eg-service-card eg-lost-card';card.type='button';card.innerHTML='<span class="eg-service-icon">'+listingIcon+'</span><span class="eg-service-name">Kayıp</span>';
    const panel=document.createElement('div');panel.className='eg-panel';panel.dataset.panel='lost-found';
    panel.innerHTML='<button class="eg-service-back" type="button">‹ Hizmetler</button><div class="eg-card eg-lost-shell"><div class="eg-lost-hero"><div><div class="eg-title">Kayıp & Buluntu</div><div class="eg-muted">Otobüslerde kaybolan ve bulunan eşyalar</div></div><div class="eg-lost-head-icon">'+listingIcon+'</div></div><button id="egLostNew" class="eg-lost-new" type="button">+ İlan ver</button><div class="eg-lost-tabs"><button class="eg-lost-tab active" data-mode="all">Tümü</button><button class="eg-lost-tab" data-mode="lost">Kayıp</button><button class="eg-lost-tab" data-mode="found">Buluntu</button><button class="eg-lost-tab" data-mode="mine">İlanlarım</button><button class="eg-lost-tab" data-mode="requests">Talepler</button></div><div class="eg-lost-filters"><select id="egLostCategoryFilter" class="eg-lost-select"><option value="all">Tüm eşyalar</option>'+categories.map(value=>'<option>'+value+'</option>').join('')+'</select><select id="egLostLineFilter" class="eg-lost-select"><option value="all">Tüm konumlar</option><option value="1">1 numaralı hat</option><option value="2">2 numaralı hat</option><option value="6">6 numaralı hat</option><option value="bus">Otobüste</option><option value="other">Diğer</option></select></div><div id="egLostStatus" class="eg-lost-status">İlanlar hazırlanıyor…</div><div id="egLostResults" class="eg-lost-list" aria-live="polite"></div></div>';
    const formLayer=document.createElement('div');formLayer.id='egLostFormLayer';formLayer.className='eg-lost-form-layer';formLayer.innerHTML='<form id="egLostForm" class="eg-lost-form"><div class="eg-lost-form-head"><b id="egLostFormTitle">Yeni ilan</b><button id="egLostClose" class="eg-lost-close" type="button">×</button></div><input id="egLostKind" type="hidden" value="lost"><div class="eg-lost-kind"><button type="button" data-kind="lost" class="active">Eşyamı kaybettim</button><button type="button" data-kind="found">Eşya buldum</button></div><div class="eg-lost-field"><label for="egLostTitle">İlan başlığı</label><input id="egLostTitle" class="eg-lost-input" maxlength="80" placeholder="Örn. Siyah cüzdan" required></div><div class="eg-lost-grid"><div class="eg-lost-field"><label for="egLostCategory">Eşya türü</label><select id="egLostCategory" class="eg-lost-select">'+categories.map(value=>'<option>'+value+'</option>').join('')+'</select></div><div class="eg-lost-field"><label for="egLostLine">Hat veya yer</label><select id="egLostLine" class="eg-lost-select"><option value="1">1 numaralı hat</option><option value="2">2 numaralı hat</option><option value="6">6 numaralı hat</option><option value="bus" selected>Otobüste</option><option value="other">Diğer</option></select></div></div><div class="eg-lost-field"><label for="egLostLocation">Yaklaşık konum</label><input id="egLostLocation" class="eg-lost-input" maxlength="120" placeholder="Örn. Üniversite yönü, otobüsün arka kısmı" required></div><div class="eg-lost-field"><label for="egLostWhen">Tarih ve saat</label><input id="egLostWhen" class="eg-lost-input" type="datetime-local" required></div><div class="eg-lost-field"><label for="egLostDescription">Açıklama ve ayırt edici özellikler</label><textarea id="egLostDescription" class="eg-lost-textarea" maxlength="800" placeholder="Rengi, markası ve ayırt edici özellikleri…" required></textarea></div><div class="eg-lost-field"><label for="egLostOwnerName">İlanda görünecek ad</label><input id="egLostOwnerName" class="eg-lost-input" maxlength="50" required></div><div class="eg-lost-field"><label for="egLostPhoto">Fotoğraf (isteğe bağlı)</label><input id="egLostPhoto" class="eg-lost-input" type="file" accept="image/jpeg,image/png,image/webp"><span class="eg-lost-photo-note">Fotoğrafta telefon, adres veya kimlik bilgisi görünmemeli.</span></div><button id="egLostSubmit" class="eg-lost-submit" type="submit">İlanı yayımla</button></form>';
    const contactLayer=document.createElement('div');contactLayer.id='egLostContactLayer';contactLayer.className='eg-lost-form-layer';contactLayer.innerHTML='<form id="egLostContactForm" class="eg-lost-form"><div class="eg-lost-form-head"><b>İletişim isteği</b><button id="egLostContactClose" class="eg-lost-close" type="button">×</button></div><p id="egLostContactTitle" class="eg-lost-desc"></p><input id="egLostContactListing" type="hidden"><div class="eg-lost-field"><label for="egLostContactValue">İlan sahibinin sana ulaşacağı telefon veya e-posta</label><input id="egLostContactValue" class="eg-lost-input" maxlength="100" required></div><p class="eg-lost-photo-note">Bu bilgi ilanda görünmez; yalnızca ilan sahibinin Talepler ekranında gösterilir.</p><button class="eg-lost-submit" type="submit">İsteği gönder</button></form>';
    const pharmacy=grid.querySelector('.eg-pharmacy-card');if(pharmacy)grid.insertBefore(card,pharmacy);else grid.appendChild(card);
    widgets.insertBefore(panel,widgets.querySelector('.eg-panel[data-panel="account"]'));document.body.append(formLayer,contactLayer);
    card.onclick=()=>{showPanel(panel);connectFirebase().catch(()=>setStatus('İlan sistemi başlatılamadı.',true))};panel.querySelector('.eg-service-back').onclick=goServices;$('#egLostNew').onclick=()=>openForm();
    panel.querySelectorAll('.eg-lost-tab').forEach(button=>button.onclick=()=>{mode=button.dataset.mode;panel.querySelectorAll('.eg-lost-tab').forEach(item=>item.classList.toggle('active',item===button));$('.eg-lost-filters').hidden=mode==='requests';render()});
    $('#egLostCategoryFilter').onchange=render;$('#egLostLineFilter').onchange=render;$('#egLostForm').onsubmit=submitListing;$('#egLostClose').onclick=closeForm;formLayer.onclick=event=>{if(event.target===formLayer)closeForm()};formLayer.querySelectorAll('.eg-lost-kind button').forEach(button=>button.onclick=()=>setFormKind(button.dataset.kind));
    $('#egLostContactForm').onsubmit=submitContact;$('#egLostContactClose').onclick=()=>contactLayer.classList.remove('show');contactLayer.onclick=event=>{if(event.target===contactLayer)contactLayer.classList.remove('show')};
    return true;
  }

  let attempts=0;const timer=setInterval(()=>{if(mount()||++attempts>100)clearInterval(timer)},100);mount();
})();
