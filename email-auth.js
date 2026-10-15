import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {installEmailCodeFlow} from './email-code-flow.js?v=20261016-otp2';
import { getAuth, OAuthProvider, signInWithCredential, signInWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';

const style = document.createElement('style');
style.textContent = `.email-auth-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:15px}.email-auth-link{border:0;background:none;color:#85888e;padding:4px 0;font-size:13px;font-weight:700}.email-reset-link{display:block;width:max-content;margin:8px auto 2px;padding:4px 8px;text-align:center;font-size:12px;line-height:1.25;opacity:.9}.email-reset-link:active{opacity:.55}.email-auth-note{text-align:center;color:#777b82;font-size:11px;line-height:1.4;margin:11px 12px 0}.email-code{letter-spacing:10px;text-align:center!important;font-size:25px!important;font-weight:800}html[data-theme="light"] .email-auth-link{color:#4f5258}`;
document.head.appendChild(style);

function setMessage(id,text,success=false){const e=document.getElementById(id);if(!e)return;e.textContent=text||'';e.style.color=success?'#39845c':'';}
function messageFor(error,context='login'){const c=error?.code||'';if(c==='auth/email-not-verified')return'E-posta adresini doğrulaman gerekiyor. Şifreni mi unuttun ekranından kod isteyebilirsin.';if(c==='auth/operation-in-progress')return'Önceki işlemin tamamlanmasını bekle.';if(c==='auth/invalid-email')return'Geçerli bir e-posta adresi gir.';if(c==='auth/weak-password')return'Daha güçlü bir şifre seç.';if(c==='auth/email-already-in-use')return'Bu e-posta zaten kullanılıyor.';if(c==='auth/too-many-requests')return'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.';if(c==='auth/network-request-failed')return'İnternet bağlantını kontrol edip tekrar dene.';return context==='login'?'E-posta veya şifre hatalı.':'Hesap oluşturulamadı. Lütfen tekrar dene.';}
function field(placeholder,id,type='text',autocomplete='off'){const w=document.createElement('div');w.className='field';const i=document.createElement('input');i.id=id;i.type=type;i.placeholder=placeholder;i.autocomplete=autocomplete;w.appendChild(i);return w;}


function createEmailLogin(auth){
 const login=document.getElementById('login');if(!login)return;
 const phoneField=login.querySelector('.phone');
 const submit=document.getElementById('phoneBtn');
 const message=document.getElementById('phoneMsg');
 if(!phoneField||!submit||!message)return;
 login.querySelector('.desc').textContent='E-posta adresin ve şifrenle devam et veya başka bir giriş yöntemi seç.';
 phoneField.className='field';
 phoneField.innerHTML='<input id="emailLoginAddress" type="email" autocomplete="email" inputmode="email" placeholder="E-posta adresi">';
 const passwordField=field('Şifre','emailLoginPassword','password','current-password');
 phoneField.after(passwordField);
 submit.textContent='Giriş yap';
 message.id='emailLoginMsg';
 document.getElementById('recaptcha-container')?.remove();
 const oldEmailButton=[...login.querySelectorAll('.authbtn')].find(button=>button.textContent.includes('E-posta'));
 oldEmailButton?.remove();
 const reset=document.createElement('button');
 reset.id='emailResetPassword';reset.className='email-auth-link email-reset-link';reset.type='button';reset.textContent='Şifreni mi unuttun?';
 submit.after(reset);
 const performLogin=async()=>{
  const email=document.getElementById('emailLoginAddress').value.trim();
  const password=document.getElementById('emailLoginPassword').value;
  setMessage('emailLoginMsg','');
  if(!email||!password)return setMessage('emailLoginMsg','E-posta adresini ve şifreni gir.');
  submit.disabled=true;submit.textContent='Giriş yapılıyor…';
  try{
   if(typeof window.elmaNativeAuthRequest==='function'){
    await window.elmaNativeAuthRequest('signIn',{email,password});
    document.getElementById('emailLoginPassword').value='';login.classList.add('hide');return;
   }
   const credential=await signInWithEmailAndPassword(auth,email,password);
   await credential.user.reload();
   if(!credential.user.emailVerified){await signOut(auth);setMessage('emailLoginMsg','E-posta adresini doğrulaman gerekiyor. Şifreni mi unuttun ekranından kod isteyebilirsin.');return;}
   login.classList.add('hide');
  }catch(e){setMessage('emailLoginMsg',messageFor(e));}
  finally{submit.disabled=false;submit.textContent='Giriş yap';}
 };
 submit.onclick=performLogin;
 document.getElementById('emailLoginPassword').addEventListener('keydown',event=>{if(event.key==='Enter')performLogin();});
 const ab=login.querySelector('.authbtn.apple');if(ab){ab.disabled=false;ab.title='Apple ile giriş';ab.onclick=null;}
}
async function start(){if(!getApps().length)return setTimeout(start,50);const auth=getAuth(getApp());window.elmaHandleAppleSignIn=async result=>{const button=document.querySelector('#login .authbtn.apple');if(button)button.disabled=true;try{if(!result?.identityToken||!result?.rawNonce)throw new Error('Apple kimlik bilgisi alınamadı.');const provider=new OAuthProvider('apple.com');const credential=provider.credential({idToken:result.identityToken,rawNonce:result.rawNonce});const signedIn=await signInWithCredential(auth,credential);const fullName=result.fullName?.trim();if(fullName&&!signedIn.user.displayName)await updateProfile(signedIn.user,{displayName:fullName});document.getElementById('login')?.classList.add('hide');window.dispatchEvent(new CustomEvent('elma-user-profile-updated',{detail:signedIn.user}));}catch{alert('Apple ile giriş tamamlanamadı. Lütfen tekrar dene.');}finally{if(button)button.disabled=false;}};if(auth.currentUser&&!auth.currentUser.emailVerified&&auth.currentUser.providerData.every(item=>item.providerId==='password')){await signOut(auth);document.getElementById('login')?.classList.remove('hide');}createEmailLogin(auth);installEmailCodeFlow(auth);}start();

