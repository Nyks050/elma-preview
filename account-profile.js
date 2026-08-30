import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';

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

function start() {
  if (!getApps().length) return setTimeout(start, 50);
  const auth = getAuth(getApp());
  onAuthStateChanged(auth, user => {
    if (renderUser(user)) return;
    const observer = new MutationObserver(() => {
      if (renderUser(user)) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

start();
