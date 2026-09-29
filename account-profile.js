import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js';

const style = document.createElement('style');
style.textContent = `
  .eg-user-profile{display:none;align-items:center;gap:13px;margin:0 0 14px;padding:14px;border:1px solid #dedee2;border-radius:21px;background:#fff;box-shadow:0 10px 28px rgba(20,20,25,.07)}
  .eg-user-profile.show{display:flex}
  .eg-user-avatar{width:54px;height:54px;flex:0 0 54px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:#111;color:#fff;font:800 20px/1 Inter,-apple-system,BlinkMacSystemFont,sans-serif;border:2px solid #fff;box-shadow:0 0 0 1px #d8d8dc}
  .eg-user-avatar img{width:100%;height:100%;display:block;object-fit:cover}
  .eg-user-copy{min-width:0}
  .eg-user-copy strong{display:block;color:#0b0b0c;font-size:17px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .eg-user-copy small{display:block;margin-top:4px;color:#6b6e74;font-size:12px}
  .profile img{width:100%;height:100%;display:block;object-fit:cover;border-radius:50%}
  .eg-delete-account{width:100%;margin-top:16px;padding:15px;border:1px solid #f1b8b8;border-radius:17px;background:#fff5f5;color:#b42323;font:800 14px/1 Inter,-apple-system,sans-serif}
  .eg-delete-account:disabled{opacity:.5}
  .eg-delete-account-status{min-height:18px;margin:8px 4px 0;color:#b42323;font-size:12px;text-align:center}
`;
document.head.appendChild(style);

function userName(user) {
  return user?.displayName || user?.email?.split('@')[0] || 'Elma Go kullanıcısı';
}

function avatarMarkup(user) {
  const name = userName(user);
  if (user?.photoURL) {
    const image = document.createElement('img');
    image.src = user.photoURL;
    image.alt = '';
    image.referrerPolicy = 'no-referrer';
    return image;
  }
  return document.createTextNode(name.trim().charAt(0).toLocaleUpperCase('tr-TR') || 'E');
}

function ensureProfileCard() {
  const settings = document.querySelector('.eg-panel[data-panel="account"] .eg-settings');
  if (!settings) return null;
  let card = document.getElementById('egUserProfile');
  if (!card) {
    card = document.createElement('section');
    card.id = 'egUserProfile';
    card.className = 'eg-user-profile';
    card.setAttribute('aria-label', 'Kullanıcı profili');
    card.innerHTML = '<span class="eg-user-avatar" aria-hidden="true"></span><span class="eg-user-copy"><strong></strong><small>Google ile giriş yapıldı</small></span>';
    settings.prepend(card);
  }
  return card;
}

function renderUser(user) {
  const card = ensureProfileCard();
  if (!card) return false;
  card.classList.toggle('show', Boolean(user));
  if (!user) return true;
  const avatar = card.querySelector('.eg-user-avatar');
  const name = userName(user);
  avatar.replaceChildren(avatarMarkup(user));
  card.querySelector('strong').textContent = name;

  const topProfile = document.querySelector('.profile');
  if (topProfile) {
    topProfile.replaceChildren(avatarMarkup(user));
    topProfile.setAttribute('aria-label', name + ' profili');
    topProfile.title = name;
  }
  return true;
}

function renderWhenReady(user) {
  if (renderUser(user)) return;
  const observer = new MutationObserver(() => {
    if (renderUser(user)) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function ensureDeleteAccount(auth) {
  const settings = document.querySelector('.eg-panel[data-panel="account"] .eg-settings');
  if (!settings || document.getElementById('egDeleteAccount')) return Boolean(settings);
  const button = document.createElement('button');
  button.id = 'egDeleteAccount';
  button.className = 'eg-delete-account';
  button.type = 'button';
  button.textContent = 'Hesabımı sil';
  const status = document.createElement('div');
  status.id = 'egDeleteAccountStatus';
  status.className = 'eg-delete-account-status';
  settings.append(button, status);
  button.onclick = () => removeCurrentAccount(auth, button, status);
  return true;
}

async function removeCurrentAccount(auth, button, status) {
  const user = auth.currentUser;
  if (!user) { status.textContent = 'Önce hesabına giriş yap.'; return; }
  const lastSignIn = Date.parse(user.metadata?.lastSignInTime || '');
  if (!Number.isFinite(lastSignIn) || Date.now() - lastSignIn > 5 * 60 * 1000) {
    status.textContent = 'Güvenlik için çıkış yapıp tekrar giriş yaptıktan sonra yeniden dene.';
    return;
  }
  if (prompt('Hesabın ve ilişkili verilerin kalıcı olarak silinecek. Onaylamak için SİL yaz.') !== 'SİL') return;
  button.disabled = true;
  button.textContent = 'Hesap siliniyor…';
  status.textContent = '';
  try {
    const functions = getFunctions(getApp(), 'europe-west1');
    await httpsCallable(functions, 'deleteMyAccount')({ confirmation: 'DELETE' });
    await signOut(auth).catch(() => {});
    try { localStorage.removeItem('elma_ios_push_device_v1'); } catch {}
    alert('Hesabın ve ilişkili verilerin kalıcı olarak silindi.');
    location.replace('/');
  } catch (error) {
    const requiresLogin = error?.code === 'functions/failed-precondition' ||
      error?.code === 'auth/requires-recent-login';
    status.textContent = requiresLogin
      ? 'Çıkış yapıp tekrar giriş yaptıktan sonra yeniden dene.'
      : 'Hesap silinemedi. Lütfen tekrar dene.';
    button.disabled = false;
    button.textContent = 'Hesabımı sil';
  }
}

function start() {
  if (!getApps().length) return setTimeout(start, 50);
  const auth = getAuth(getApp());
  onAuthStateChanged(auth, user => { renderWhenReady(user); const observer = new MutationObserver(() => { if (ensureDeleteAccount(auth)) observer.disconnect(); }); if (!ensureDeleteAccount(auth)) observer.observe(document.body, { childList: true, subtree: true }); });
  window.addEventListener('elma-user-profile-updated', event => renderWhenReady(event.detail));
}

start();
