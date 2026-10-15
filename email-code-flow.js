import {signInWithEmailAndPassword} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';

const API = 'https://europe-west1-elma-bd38c.cloudfunctions.net/';
const REQUEST_TIMEOUT = 40000;
async function call(name, data) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(API + name, {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({data}), signal: controller.signal});
    const result = await response.json();
    if (!response.ok || result.error || !result.result?.ok) {
      throw new Error(result.error?.message || 'İşlem tamamlanamadı. Daha sonra tekrar dene.');
    }
    return result.result;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('İşlem zaman aşımına uğradı. Yeni kod isteyerek tekrar dene.');
    throw error;
  } finally { clearTimeout(timer); }
}

// Uses the existing login/register shell and native sign-in bridge. Codes and
// passwords stay in memory; no browser storage, analytics or console logging.
export function installEmailCodeFlow(auth) {
  const register = document.getElementById('register'), login = document.getElementById('login');
  const inputs = register ? [...register.querySelectorAll('.field input')] : [];
  if (!register || !login || inputs.length < 3) return;
  const [name, email, password] = inputs;
  name.id = 'registerName'; name.placeholder = 'Ad soyad'; name.autocomplete = 'name';
  email.id = 'registerEmail'; email.type = 'email'; email.autocomplete = 'email'; email.placeholder = 'E-posta adresi';
  password.id = 'registerPassword'; password.type = 'password'; password.autocomplete = 'new-password';
  password.placeholder = 'Şifre (en az 8 karakter)'; password.maxLength = 128;
  let again = document.getElementById('registerPasswordAgain');
  if (!again) {
    const wrapper = document.createElement('div'); wrapper.className = 'field';
    again = document.createElement('input'); again.id = 'registerPasswordAgain'; again.type = 'password';
    again.autocomplete = 'new-password'; again.placeholder = 'Şifreyi tekrar gir'; again.maxLength = 128;
    wrapper.append(again); password.closest('.field').after(wrapper);
  }
  let registerMessage = document.getElementById('registerMsg');
  if (!registerMessage) {
    registerMessage = document.createElement('div'); registerMessage.id = 'registerMsg';
    registerMessage.className = 'msg'; register.querySelector('.back')?.before(registerMessage);
  }
  const logoStyle = document.createElement('style');
  logoStyle.textContent = '#emailCodeVerify .email-code-logo{width:220px!important;max-width:65vw!important;height:78px!important;margin:0 auto 24px!important}';
  document.head.append(logoStyle);
  const verify = document.createElement('section'); verify.id = 'emailCodeVerify'; verify.className = 'register';
  verify.innerHTML = `<div class="box"><div class="brand wordmark email-code-logo" role="img" aria-label="Elma Go"><span class="elma">elma</span><span class="go">go</span></div>
    <h1 id="emailCodeTitle">E-postanı doğrula</h1><p class="desc" id="emailCodeDesc"></p>
    <div class="field"><input id="emailCodeInput" class="email-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="6 haneli doğrulama kodu" placeholder="000000"></div>
    <div id="emailCodePasswords" hidden><div class="field"><input id="emailCodeNewPassword" type="password" autocomplete="new-password" maxlength="128" placeholder="Yeni şifre (en az 8 karakter)" aria-label="Yeni şifre"></div>
    <div class="field"><input id="emailCodeNewPasswordAgain" type="password" autocomplete="new-password" maxlength="128" placeholder="Yeni şifreyi tekrar gir" aria-label="Yeni şifreyi tekrar gir"></div></div>
    <button id="emailCodeSubmit" class="primary" type="button">Kodu doğrula</button>
    <div id="emailCodeMsg" class="msg" role="status" aria-live="polite"></div>
    <div class="email-auth-actions"><button id="emailCodeBack" class="email-auth-link" type="button">← Geri dön</button><button id="emailCodeResend" class="email-auth-link" type="button">Kodu tekrar gönder</button></div></div>`;
  register.after(verify);
  const get = id => document.getElementById(id);
  let pending = null, busy = false, generation = 0, resendTimer;
  const message = text => { get('emailCodeMsg').textContent = text; };
  function clearSecrets() {
    password.value = ''; again.value = ''; get('emailCodeInput').value = '';
    get('emailCodeNewPassword').value = ''; get('emailCodeNewPasswordAgain').value = '';
  }
  function countdown(seconds) {
    clearInterval(resendTimer);
    const until = Date.now() + seconds * 1000;
    function render() {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      const button = get('emailCodeResend'); button.disabled = busy || remaining > 0;
      button.textContent = remaining ? `Tekrar gönder (${remaining} sn)` : 'Kodu tekrar gönder';
      if (!remaining) clearInterval(resendTimer);
    }
    render(); resendTimer = setInterval(render, 1000);
  }
  function show(purpose, address, response, fullName = '') {
    pending = {purpose, email: address, fullName, challengeId: response.challengeId};
    const reset = purpose === 'reset';
    get('emailCodeTitle').textContent = reset ? 'Şifreni yenile' : 'E-postanı doğrula';
    get('emailCodeDesc').textContent = reset
      ? `${address} adresiyle şifreli hesabın varsa kod gönderildi. Kodu ve yeni şifreni gir.`
      : `${address} adresi kayıt için uygunsa kod gönderildi. Gelen 6 haneli kodu gir.`;
    get('emailCodePasswords').hidden = !reset;
    get('emailCodeSubmit').textContent = reset ? 'Şifremi yenile' : 'Kodu doğrula';
    message(''); login.classList.add('hide'); register.classList.remove('show'); verify.classList.add('show');
    get('emailCodeInput').focus(); countdown(response.resendAfter || 60);
  }
  async function requestRegistration() {
    if (busy) return;
    const address = email.value.trim().toLowerCase(), fullName = name.value.trim().replace(/\s+/g, ' ');
    registerMessage.textContent = '';
    if (fullName.length < 2 || fullName.length > 100) { registerMessage.textContent = 'Adını ve soyadını gir.'; return; }
    if (!email.checkValidity() || !address) { registerMessage.textContent = 'Geçerli bir e-posta adresi gir.'; return; }
    if (password.value.length < 8 || password.value.length > 128) { registerMessage.textContent = 'Şifre 8–128 karakter olmalı.'; return; }
    if (password.value !== again.value) { registerMessage.textContent = 'Şifreler birbiriyle aynı değil.'; return; }
    if (!get('privacyCheck')?.checked) { registerMessage.textContent = 'Gizlilik Politikasını okuyup onayla.'; return; }
    busy = true; const revision = ++generation, button = get('registerBtn');
    button.disabled = true; button.textContent = 'Kod gönderiliyor…';
    try {
      const response = await call('requestEmailCode', {email: address, purpose: 'register'});
      if (revision !== generation) return;
      show('register', address, response, fullName);
    } catch (error) { registerMessage.textContent = error.message; }
    finally { busy = false; button.disabled = !get('privacyCheck')?.checked; button.textContent = 'Hesap oluştur'; }
  }
  window.finishRegister = requestRegistration; get('registerBtn').onclick = requestRegistration;
  const reset = get('emailResetPassword');
  if (reset) reset.onclick = async () => {
    if (busy) return;
    const input = get('emailLoginAddress'), address = input.value.trim().toLowerCase();
    if (!address || !input.checkValidity()) { get('emailLoginMsg').textContent = 'Önce geçerli e-posta adresini gir.'; return; }
    busy = true; reset.disabled = true; const revision = ++generation;
    get('emailLoginMsg').textContent = 'Kod gönderiliyor…';
    try {
      const response = await call('requestEmailCode', {email: address, purpose: 'reset'});
      if (revision !== generation) return;
      get('emailLoginPassword').value = ''; show('reset', address, response);
    } catch (error) { get('emailLoginMsg').textContent = error.message; }
    finally { busy = false; reset.disabled = false; }
  };
  get('emailCodeInput').oninput = event => { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6); };
  get('emailCodeBack').onclick = () => {
    if (busy) return;
    const wasRegister = pending?.purpose === 'register'; ++generation; pending = null;
    clearInterval(resendTimer); clearSecrets(); verify.classList.remove('show');
    if (wasRegister) register.classList.add('show'); else login.classList.remove('hide');
  };
  get('emailCodeResend').onclick = async () => {
    if (!pending || busy) return;
    busy = true; get('emailCodeResend').disabled = true; message('Kod gönderiliyor…');
    try {
      const response = await call('requestEmailCode', {email: pending.email, purpose: pending.purpose});
      pending.challengeId = response.challengeId; get('emailCodeInput').value = ''; message('Yeni kod gönderildi.');
      countdown(response.resendAfter || 60);
    } catch (error) { message(error.message); get('emailCodeResend').disabled = false; }
    finally { busy = false; }
  };
  get('emailCodeSubmit').onclick = async () => {
    if (!pending || busy) return;
    const code = get('emailCodeInput').value, reset = pending.purpose === 'reset';
    const nextPassword = reset ? get('emailCodeNewPassword').value : password.value;
    const repeated = reset ? get('emailCodeNewPasswordAgain').value : again.value;
    if (!/^\d{6}$/.test(code)) { message('6 haneli kodu gir.'); return; }
    if (nextPassword.length < 8 || nextPassword.length > 128) { message('Şifre 8–128 karakter olmalı.'); return; }
    if (nextPassword !== repeated) { message('Şifreler birbiriyle aynı değil.'); return; }
    if (!reset && !get('privacyCheck')?.checked) { message('Gizlilik Politikasını okuyup onayla.'); return; }
    busy = true; const button = get('emailCodeSubmit'); button.disabled = true; message('Doğrulanıyor…');
    let completed = false;
    try {
      await call('completeEmailCode', {...pending, name: pending.fullName, code, password: nextPassword, consent: true});
      completed = true;
      const address = pending.email;
      if (!reset) {
        if (typeof window.elmaNativeAuthRequest === 'function') {
          await window.elmaNativeAuthRequest('signIn', {email: address, password: nextPassword});
        } else {
          const result = await signInWithEmailAndPassword(auth, address, nextPassword);
          window.dispatchEvent(new CustomEvent('elma-user-profile-updated', {detail: result.user}));
        }
      }
      clearSecrets(); pending = null; clearInterval(resendTimer); verify.classList.remove('show');
      if (reset) {
        login.classList.remove('hide'); get('emailLoginPassword').value = '';
        get('emailLoginMsg').textContent = 'Şifren yenilendi. Yeni şifrenle giriş yapabilirsin.';
      } else login.classList.add('hide');
    } catch (error) {
      if (completed) {
        clearSecrets(); pending = null; clearInterval(resendTimer); verify.classList.remove('show'); login.classList.remove('hide');
        get('emailLoginMsg').textContent = reset ? 'Şifren yenilendi. Yeni şifrenle giriş yap.' : 'Hesabın doğrulandı. E-posta ve şifrenle giriş yap.';
      } else message(error.message);
    } finally { busy = false; button.disabled = false; }
  };
  verify.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); get('emailCodeSubmit').click(); } });
}

