import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { EmailAuthProvider, GoogleAuthProvider, OAuthProvider, getAuth, onAuthStateChanged, reauthenticateWithCredential, reauthenticateWithPopup, revokeAccessToken, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js';

let accountDeleteInFlight = null;
let profileObserver = null;
let profileObserverTimer = null;
let latestProfileUser = null;
let accountStarted = false;
let accountStartAttempts = 0;
const isNativeAccount = () => Boolean(window.webkit?.messageHandlers?.elmaRoutePlanner);
const accountError = code => Object.assign(new Error(code), { code });

function bounded(promise, timeoutMs, code = 'auth/network-request-failed') {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(accountError(code)), timeoutMs);
  })]).finally(() => clearTimeout(timer));
}

function askCurrentPassword() {
  return new Promise((resolve, reject) => {
    const layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0006;display:grid;place-items:center;padding:24px';
    layer.innerHTML = '<form style="background:white;color:#111;border-radius:20px;padding:22px;width:min(100%,360px)"><h2 id="egDeletePasswordTitle" style="margin-top:0;font-size:20px">Hesabını doğrula</h2><p>Silme işlemi için mevcut şifreni gir.</p><input aria-label="Mevcut şifre" type="password" autocomplete="current-password" required style="width:100%;box-sizing:border-box;padding:12px;font-size:16px"><div style="display:flex;gap:12px;margin-top:18px"><button type="button">Vazgeç</button><button type="submit">Doğrula</button></div></form>';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'egDeletePasswordTitle');
    const input = layer.querySelector('input');
    let settled = false;
    const finish = (value, error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      input.value = '';
      layer.remove();
      if (error) reject(accountError(error)); else resolve(value);
    };
    const timer = setTimeout(() => finish('', 'auth/timeout'), 90000);
    layer.querySelector('button[type="button"]').onclick = () => finish('', 'auth/cancelled');
    layer.querySelector('form').onsubmit = event => { event.preventDefault(); if (input.value) finish(input.value); };
    layer.onkeydown = event => { if (event.key === 'Escape') finish('', 'auth/cancelled'); };
    document.body.appendChild(layer);
    input.focus();
  });
}

// Native Apple authorization codes are not OAuth access tokens. Match the Firebase
// iOS SDK's accounts:revokeToken request instead of feeding a code to revokeAccessToken.
async function revokeNativeAppleCode(auth, user, code) {
  if (!code || !auth.app.options.apiKey) throw accountError('auth/apple-revocation-required');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const idToken = await bounded(user.getIdToken(), 10000);
    const response = await fetch('https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key=' + encodeURIComponent(auth.app.options.apiKey), {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-Ios-Bundle-Identifier': 'tr.com.elmago.app' },
      body: JSON.stringify({ providerId: 'apple.com', tokenType: '3', token: code, idToken })
    });
    if (!response.ok) throw accountError('auth/apple-revocation-failed');
  } catch (error) {
    if (error?.name === 'AbortError') throw accountError('auth/network-request-failed');
    throw error;
  } finally { clearTimeout(timeout); }
}

async function verifyAccountForDeletion(auth, user) {
  const token = await bounded(user.getIdTokenResult(), 10000);
  const providers = (user.providerData || []).map(item => item.providerId);
  const hasApple = providers.includes('apple.com');
  const providerId = hasApple ? 'apple.com' : providers.includes(token.signInProvider) ? token.signInProvider : providers[0];
  const authTime = Date.parse(token.authTime || '');
  const recent = Number.isFinite(authTime) && authTime <= Date.now() + 30000 && Date.now() - authTime <= 4 * 60 * 1000;
  // Apple must yield a fresh code even during a recent session so its grant can be revoked.
  if (hasApple || !recent) {
    if (['apple.com', 'google.com', 'password'].includes(providerId) && typeof window.__elmaReauthenticateAccount === 'function') {
      const result = await bounded(window.__elmaReauthenticateAccount(providerId, user.uid), 95000, 'auth/timeout');
      if (auth.currentUser?.uid !== user.uid) throw accountError('auth/user-mismatch');
      if (hasApple) await revokeNativeAppleCode(auth, user, result?.appleAuthorizationCode);
    } else if (providerId === 'password') {
      if (window.webkit?.messageHandlers?.elmaRoutePlanner) throw accountError('auth/native-update-required');
      const password = await askCurrentPassword();
      if (auth.currentUser?.uid !== user.uid) throw accountError('auth/user-mismatch');
      await bounded(reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password)), 15000);
    } else if (providerId === 'google.com' || providerId === 'apple.com') {
      if (window.webkit?.messageHandlers?.elmaRoutePlanner) throw accountError('auth/native-update-required');
      const provider = hasApple ? new OAuthProvider('apple.com') : new GoogleAuthProvider();
      const result = await bounded(reauthenticateWithPopup(user, provider), 95000, 'auth/timeout');
      if (hasApple) {
        const accessToken = OAuthProvider.credentialFromResult(result)?.accessToken;
        if (!accessToken) throw accountError('auth/apple-revocation-required');
        await bounded(revokeAccessToken(auth, accessToken), 15000);
      }
    } else throw accountError('auth/requires-recent-login');
  }
  if (auth.currentUser?.uid !== user.uid) throw accountError('auth/user-mismatch');
  await bounded(user.getIdToken(true), 10000);
}

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
    card.innerHTML = '<span class="eg-user-avatar" aria-hidden="true"></span><span class="eg-user-copy"><strong></strong><small></small></span>';
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
  const providerIds = (user.providerData || []).map(item => item.providerId);
  card.querySelector('small').textContent = (providerIds.includes('apple.com') ? 'Apple' : providerIds.includes('google.com') ? 'Google' : 'E-posta') + ' ile giriş yapıldı';

  const topProfile = document.querySelector('.profile');
  if (topProfile) {
    topProfile.replaceChildren(avatarMarkup(user));
    topProfile.setAttribute('aria-label', name + ' profili');
    topProfile.title = name;
  }
  return true;
}

function renderWhenReady(user) {
  latestProfileUser = user;
  if (isNativeAccount()) return;
  const render = () => {
    const ready = renderUser(latestProfileUser);
    if (ready) ensureDeleteAccount(getAuth(getApp()));
    return ready;
  };
  const stop = () => {
    profileObserver?.disconnect(); profileObserver = null;
    clearTimeout(profileObserverTimer); profileObserverTimer = null;
  };
  if (render()) { stop(); return; }
  if (profileObserver || !document.body) return;
  profileObserver = new MutationObserver(() => { if (render()) stop(); });
  profileObserver.observe(document.body, { childList: true, subtree: true });
  // An absent/replaced account screen must not leave a lifetime DOM observer.
  profileObserverTimer = setTimeout(stop, 10000);
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
  button.onclick = () => deleteCurrentAccountOnce(auth, button, status);
  return true;
}

async function removeCurrentAccount(auth, button, status, confirmed = false) {
  const user = auth.currentUser;
  window.__elmaLastAccountDeleteError = '';
  if (!user) { status.textContent = 'Önce hesabına giriş yap.'; window.__elmaLastAccountDeleteError = 'auth/no-current-user'; return { ok: false, error: 'auth/no-current-user' }; }
  if (!confirmed && prompt('Hesabın ve ilişkili verilerin kalıcı olarak silinecek. Onaylamak için SİL yaz.') !== 'SİL') return { ok: false, error: 'auth/cancelled' };
  button.disabled = true;
  button.textContent = 'Hesap siliniyor…';
  status.textContent = '';
  try {
    const uid = user.uid;
    status.textContent = 'Kimliğin güvenli şekilde doğrulanıyor…';
    await verifyAccountForDeletion(auth, user);
    status.textContent = 'Hesap silme isteği gönderiliyor…';
    const remove = httpsCallable(getFunctions(getApp(), 'europe-west1'), 'deleteMyAccount', { timeout: 20000 });
    const response = await remove({ confirmation: 'DELETE', expectedUid: uid });
    if (response.data?.deleted !== true) throw accountError('functions/invalid-response');
    // Only the server-confirmed deletion signs out. Cleanup remains a durable,
    // retried server job; neither network timeout nor local sign-out means success.
    await bounded(signOut(auth), 5000).catch(() => {});
    try {
      ['elma_ios_push_device_v1', 'elma_e2ee_private_' + uid, 'elmaChatSeen_' + uid, 'elmaBlockedOwners', 'elmaLastListingAt'].forEach(key => localStorage.removeItem(key));
      ['elmaLastMessageText', 'elmaLastMessageAt'].forEach(key => sessionStorage.removeItem(key));
    } catch {}
    status.textContent = 'Hesabın silindi. İlişkili veriler sunucuda temizleniyor.';
    if (!window.webkit?.messageHandlers?.elmaRoutePlanner) {
      alert(status.textContent);
      setTimeout(() => location.replace('/'), 0);
    }
    return { ok: true, cleanupPending: response.data.cleanupPending === true };
  } catch (error) {
    window.__elmaLastAccountDeleteError = error?.code || error?.message || 'unknown';
    const code = window.__elmaLastAccountDeleteError;
    const messages = {
      'auth/requires-recent-login': 'Güvenlik için hesabını yeniden doğrulaman gerekiyor.',
      'auth/user-mismatch': 'Silmek istediğin hesapla aynı hesabı seçmelisin.',
      'auth/cancelled': 'Silme işlemi iptal edildi.',
      'auth/popup-closed-by-user': 'Doğrulama iptal edildi. Hesabın silinmedi.',
      'auth/native-update-required': 'Güvenli hesap doğrulaması için uygulamayı güncelle.',
      'auth/apple-revocation-required': 'Apple yetkisi doğrulanamadı. Hesabın silinmedi.',
      'auth/apple-revocation-failed': 'Apple bağlantısı kaldırılamadı. Hesabın silinmedi; tekrar dene.',
      'functions/deadline-exceeded': 'Sunucudan sonuç alınamadı. Silme başlamış olabilir; bağlantını kontrol edip tekrar dene.',
      'functions/unavailable': 'Silme sonucu doğrulanamadı. Bağlantını kontrol edip tekrar dene.',
      'auth/timeout': 'Doğrulama zaman aşımına uğradı. Hesabın silinmedi.'
    };
    status.textContent = messages[code] || 'Hesap silme işlemi tamamlanamadı. Lütfen tekrar dene.';
    button.disabled = false;
    button.textContent = 'Hesabımı sil';
    return { ok: false, error: window.__elmaLastAccountDeleteError };
  }
}

function deleteCurrentAccountOnce(auth, button, status, confirmed = false) {
  if (accountDeleteInFlight) return accountDeleteInFlight;
  accountDeleteInFlight = removeCurrentAccount(auth, button, status, confirmed).finally(() => { accountDeleteInFlight = null; });
  return accountDeleteInFlight;
}

function start() {
  if (accountStarted) return;
  if (!getApps().length) {
    if (accountStartAttempts++ < 60) setTimeout(start, 500);
    return;
  }
  accountStarted = true;
  const auth = getAuth(getApp());
  window.elmaGetNativeAccountProfile = () => {
    const user = auth.currentUser;
    if (!user) return {};
    const providerIds = (user.providerData || []).map(item => item?.providerId || '');
    const provider = providerIds.includes('apple.com') ? 'Apple' : providerIds.includes('google.com') ? 'Google' : 'E-posta';
    return {
      name: user.displayName || user.email?.split('@')[0] || 'Elma Go kullanıcısı',
      email: user.email || '',
      photoURL: user.photoURL || '',
      provider
    };
  };
  window.elmaDeleteCurrentAccount = () => {
    const button = document.getElementById('egDeleteAccount') || { disabled: false, textContent: '' };
    const status = document.getElementById('egDeleteAccountStatus') || { textContent: '' };
    return deleteCurrentAccountOnce(auth, button, status, true);
  };
  window.elmaClearNativePreferences = () => {
    ['elma_location_onboarding_seen_v1','elma_location_enabled_v1','elma_notifications_v1','elma_large_text_v1','elma_reduce_motion_v1'].forEach(key => localStorage.removeItem(key));
  };
  onAuthStateChanged(auth, user => renderWhenReady(user));
  window.addEventListener('elma-user-profile-updated', event => renderWhenReady(event.detail));
}

window.addEventListener('elma-auth-session-ready', start);
start();

