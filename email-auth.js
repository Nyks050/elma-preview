import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';

const style = document.createElement('style');
style.textContent = `
  .email-auth-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:15px}
  .email-auth-link{border:0;background:none;color:#85888e;padding:4px 0;font-size:13px;font-weight:700}
  html[data-theme="light"] .email-auth-link{color:#4f5258}
  .email-auth-note{text-align:center;color:#777b82;font-size:11px;line-height:1.4;margin:11px 12px 0}
`;
document.head.appendChild(style);

function messageFor(error, context = 'login') {
  const code = error?.code || '';
  if (code === 'auth/invalid-email') return 'Geçerli bir e-posta adresi gir.';
  if (code === 'auth/weak-password') return 'Daha güçlü bir şifre seç.';
  if (code === 'auth/email-already-in-use') return 'Bu e-posta ile hesap oluşturulamıyor.';
  if (code === 'auth/operation-not-allowed') return 'E-posta ile giriş henüz etkinleştirilmemiş.';
  if (code === 'auth/too-many-requests') return 'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.';
  if (code === 'auth/network-request-failed') return 'İnternet bağlantını kontrol edip tekrar dene.';
  if (code === 'auth/user-disabled') return 'Bu hesap kullanıma kapatılmış.';
  if (context === 'login') return 'E-posta veya şifre hatalı.';
  return 'Hesap oluşturulamadı. Lütfen tekrar dene.';
}

function setMessage(id, text, success = false) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text || '';
  element.style.color = success ? '#39845c' : '';
}

function field(placeholder, id, type, autocomplete) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  wrapper.appendChild(input);
  return wrapper;
}

function configureRegister(auth) {
  const register = document.getElementById('register');
  if (!register) return;
  const inputs = [...register.querySelectorAll('.field input')];
  if (inputs.length < 3) return;

  const [name, second, third] = inputs;
  name.id = 'registerName';
  name.placeholder = 'Ad soyad';
  name.autocomplete = 'name';

  second.id = 'registerEmail';
  second.type = 'email';
  second.placeholder = 'E-posta adresi';
  second.autocomplete = 'email';

  third.id = 'registerPassword';
  third.type = 'password';
  third.placeholder = 'Şifre (en az 8 karakter)';
  third.autocomplete = 'new-password';

  if (!document.getElementById('registerPasswordAgain')) {
    third.closest('.field').insertAdjacentElement(
      'afterend',
      field('Şifreyi tekrar gir', 'registerPasswordAgain', 'password', 'new-password')
    );
  }

  let status = document.getElementById('registerMsg');
  if (!status) {
    status = document.createElement('div');
    status.id = 'registerMsg';
    status.className = 'msg';
    register.querySelector('.back')?.before(status);
  }

  async function registerAccount() {
    const button = document.getElementById('registerBtn');
    const fullName = name.value.trim().replace(/\s+/g, ' ');
    const email = second.value.trim();
    const password = third.value;
    const passwordAgain = document.getElementById('registerPasswordAgain').value;
    const kvkk = document.getElementById('kvkkCheck');
    setMessage('registerMsg', '');

    if (fullName.length < 2) return setMessage('registerMsg', 'Adını ve soyadını gir.');
    if (!email) return setMessage('registerMsg', 'E-posta adresini gir.');
    if (password.length < 8) return setMessage('registerMsg', 'Şifre en az 8 karakter olmalı.');
    if (password !== passwordAgain) return setMessage('registerMsg', 'Şifreler birbiriyle aynı değil.');
    if (!kvkk?.checked) return setMessage('registerMsg', 'KVKK metnini okuyup onayla.');

    button.disabled = true;
    button.textContent = 'Hesap oluşturuluyor…';
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName });
      window.dispatchEvent(new CustomEvent('elma-user-profile-updated', { detail: credential.user }));
      let verificationSent = true;
      try {
        await sendEmailVerification(credential.user);
      } catch (error) {
        verificationSent = false;
      }
      register.classList.remove('show');
      document.getElementById('login')?.classList.add('hide');
      alert(verificationSent
        ? 'Hesabın oluşturuldu. Doğrulama bağlantısını e-posta adresine gönderdik.'
        : 'Hesabın oluşturuldu. Doğrulama e-postası şu anda gönderilemedi.');
    } catch (error) {
      setMessage('registerMsg', messageFor(error, 'register'));
    } finally {
      button.disabled = !kvkk?.checked;
      button.textContent = 'Hesap oluştur';
    }
  }

  window.finishRegister = registerAccount;
  const button = document.getElementById('registerBtn');
  if (button) button.onclick = registerAccount;
}

function createEmailLogin(auth) {
  if (document.getElementById('emailLogin')) return;
  const section = document.createElement('section');
  section.id = 'emailLogin';
  section.className = 'register';
  section.setAttribute('aria-label', 'E-posta ile giriş');
  section.innerHTML = `
    <div class="box">
      <div class="brand wordmark"><span class="elma">elma</span><span class="go">go</span></div>
      <h1>E-posta ile giriş</h1>
      <p class="desc">E-posta adresin ve şifrenle hesabına devam et.</p>
      <div class="field"><input id="emailLoginAddress" type="email" autocomplete="email" placeholder="E-posta adresi"></div>
      <div class="field"><input id="emailLoginPassword" type="password" autocomplete="current-password" placeholder="Şifre"></div>
      <button id="emailLoginSubmit" class="primary" type="button">Giriş yap</button>
      <div id="emailLoginMsg" class="msg" aria-live="polite"></div>
      <div class="email-auth-actions">
        <button id="emailLoginBack" class="email-auth-link" type="button">← Diğer yöntemler</button>
        <button id="emailResetPassword" class="email-auth-link" type="button">Şifremi unuttum</button>
      </div>
      <p class="email-auth-note">Hesabın yoksa giriş ekranındaki “Üye ol” seçeneğini kullan.</p>
    </div>`;
  document.getElementById('verify')?.before(section);

  const close = () => section.classList.remove('show');
  document.getElementById('emailLoginBack').onclick = close;
  document.getElementById('emailLoginPassword').addEventListener('keydown', event => {
    if (event.key === 'Enter') document.getElementById('emailLoginSubmit').click();
  });

  document.getElementById('emailLoginSubmit').onclick = async () => {
    const button = document.getElementById('emailLoginSubmit');
    const email = document.getElementById('emailLoginAddress').value.trim();
    const password = document.getElementById('emailLoginPassword').value;
    setMessage('emailLoginMsg', '');
    if (!email || !password) return setMessage('emailLoginMsg', 'E-posta adresini ve şifreni gir.');
    button.disabled = true;
    button.textContent = 'Giriş yapılıyor…';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      close();
      document.getElementById('login')?.classList.add('hide');
    } catch (error) {
      setMessage('emailLoginMsg', messageFor(error));
    } finally {
      button.disabled = false;
      button.textContent = 'Giriş yap';
    }
  };

  document.getElementById('emailResetPassword').onclick = async () => {
    const email = document.getElementById('emailLoginAddress').value.trim();
    setMessage('emailLoginMsg', '');
    if (!email) return setMessage('emailLoginMsg', 'Önce e-posta adresini gir.');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('emailLoginMsg', 'Kayıtlıysa şifre yenileme bağlantısı gönderildi.', true);
    } catch (error) {
      if (error?.code === 'auth/invalid-email') setMessage('emailLoginMsg', 'Geçerli bir e-posta adresi gir.');
      else setMessage('emailLoginMsg', 'Şifre yenileme isteği tamamlanamadı.');
    }
  };

  window.openEmailLogin = () => {
    setMessage('emailLoginMsg', '');
    section.classList.add('show');
    setTimeout(() => document.getElementById('emailLoginAddress')?.focus(), 50);
  };

  const emailButton = [...document.querySelectorAll('#login .authbtn')]
    .find(button => button.textContent.includes('E-posta'));
  if (emailButton) {
    emailButton.removeAttribute('onclick');
    emailButton.onclick = window.openEmailLogin;
  }

  const appleButton = document.querySelector('#login .authbtn.apple');
  if (appleButton) {
    appleButton.removeAttribute('onclick');
    appleButton.disabled = true;
    appleButton.setAttribute('aria-disabled', 'true');
    appleButton.title = 'Apple ile giriş yakında';
    appleButton.lastChild.textContent = 'Apple ile devam et · Yakında';
  }
}

function start() {
  if (!getApps().length) return setTimeout(start, 50);
  const auth = getAuth(getApp());
  configureRegister(auth);
  createEmailLogin(auth);
}

start();
