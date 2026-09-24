import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js';

const css = document.createElement('style');
css.textContent = `
  .eg-delete-dialog{width:min(420px,calc(100vw - 32px));border:1px solid #dedee2;border-radius:22px;padding:24px;background:#fff;color:#171719;box-shadow:0 22px 65px #0003;font:inherit}
  .eg-delete-dialog::backdrop{background:#0009}
  .eg-delete-dialog h2{margin:0 0 10px;font-size:21px}
  .eg-delete-dialog p{margin:0 0 17px;color:#555960;font-size:13px;line-height:1.5}
  .eg-delete-dialog label{display:block;margin-bottom:7px;font-size:12px;font-weight:700}
  .eg-delete-dialog input{width:100%;height:44px;padding:0 12px;border:1px solid #d6d7dc;border-radius:11px;background:#fff;color:#171719;font:inherit}
  .eg-delete-dialog .eg-delete-error{min-height:19px;margin:8px 0 0;color:#9d2525;font-size:12px}
  .eg-delete-dialog menu{display:flex;gap:8px;margin:15px 0 0;padding:0}
  .eg-delete-dialog menu button{flex:1;min-height:43px;border:1px solid #d6d7dc;border-radius:11px;background:#fff;color:#171719;font-weight:750}
  .eg-delete-dialog menu .eg-delete-confirm{border-color:#171719;background:#171719;color:#fff}
  .eg-delete-dialog menu button:disabled{opacity:.4}
`;
document.head.appendChild(css);

function notice(text) {
  const target = document.getElementById('egAccountNotice');
  if (!target) return;
  target.textContent = text;
  target.classList.add('show');
}

function mount() {
  const button = document.getElementById('egDeleteAccount');
  if (!button || button.dataset.deleteReady) return;
  button.dataset.deleteReady = 'true';
  const dialog = document.createElement('dialog');
  dialog.className = 'eg-delete-dialog';
  dialog.setAttribute('aria-labelledby', 'egDeleteTitle');
  dialog.innerHTML = `<h2 id="egDeleteTitle">Hesabı kalıcı olarak sil</h2>
    <p>İlanların, mesajların, şikâyetlerin ve yüklediğin dosyalar silinecek. Konuşmalar diğer katılımcının hesabından da kalkacak. Bu işlem geri alınamaz.</p>
    <label for="egDeletePhrase">Onaylamak için SİL yaz</label>
    <input id="egDeletePhrase" autocomplete="off" spellcheck="false" aria-label="SİL yaz">
    <p class="eg-delete-error" role="status" aria-live="polite"></p>
    <menu><button class="eg-delete-cancel" type="button">Vazgeç</button><button class="eg-delete-confirm" type="button" disabled>Hesabı sil</button></menu>`;
  document.body.appendChild(dialog);
  const input = dialog.querySelector('input');
  const confirmButton = dialog.querySelector('.eg-delete-confirm');
  const error = dialog.querySelector('.eg-delete-error');
  dialog.querySelector('.eg-delete-cancel').onclick = () => dialog.close();
  input.oninput = () => { confirmButton.disabled = input.value.trim() !== 'SİL'; error.textContent = ''; };
  button.onclick = () => {
    if (!getApps().length || !getAuth(getApp()).currentUser) {
      notice('Hesabını silmek için önce giriş yap.');
      return;
    }
    input.value = '';
    confirmButton.disabled = true;
    error.textContent = '';
    dialog.showModal();
  };
  confirmButton.onclick = async () => {
    if (input.value.trim() !== 'SİL') return;
    confirmButton.disabled = true;
    dialog.querySelector('.eg-delete-cancel').disabled = true;
    confirmButton.textContent = 'Siliniyor…';
    try {
      const auth = getAuth(getApp());
      const remove = httpsCallable(getFunctions(getApp(), 'europe-west1'), 'deleteMyAccount', { timeout: 540000 });
      const result = await remove({});
      if (!result.data?.deleted) throw new Error('Silme tamamlanamadı.');
      await signOut(auth).catch(() => {});
      localStorage.clear();
      sessionStorage.clear();
      dialog.close();
      location.reload();
    } catch (problem) {
      error.textContent = problem.code === 'functions/failed-precondition'
        ? 'Güvenlik için çıkış yapıp yeniden giriş yap; ardından tekrar dene.'
        : 'Hesap silinemedi. Verilerinin silindiği doğrulanmadı; tekrar dene.';
      confirmButton.disabled = false;
      dialog.querySelector('.eg-delete-cancel').disabled = false;
      confirmButton.textContent = 'Hesabı sil';
    }
  };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();
window.addEventListener('elma-home-widgets-ready', mount);
