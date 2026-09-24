import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const version = window.ELMAGO_POLICY_VERSION;
const ready = Boolean(version && version !== 'pending');
let lastUser = '';

async function recordConsent(user) {
  if (!ready || !window.ELMAGO_POLICY_READ) throw new Error('Önce gizlilik politikasını oku.');
  if (!user || !getApps().length) throw new Error('Hesabınla giriş yap.');
  await setDoc(doc(getFirestore(getApp()), 'privacyConsents', user.uid), {
    policyVersion: version,
    acceptedAt: serverTimestamp()
  });
  lastUser = user.uid;
  window.ELMAGO_POLICY_ACCEPTED = true;
  document.getElementById('privacy')?.classList.remove('show');
  document.getElementById('login')?.classList.add('hide');
}

function start() {
  if (!getApps().length) return setTimeout(start, 50);
  onAuthStateChanged(getAuth(getApp()), async user => {
    if (!user) { lastUser = ''; window.ELMAGO_POLICY_ACCEPTED = false; document.getElementById('privacy')?.classList.remove('show'); return; }
    if (!ready) return;
    if (lastUser === user.uid) return;
    try {
      const consent = await getDoc(doc(getFirestore(getApp()), 'privacyConsents', user.uid));
      if (getAuth(getApp()).currentUser?.uid !== user.uid) return;
      if (consent.data()?.policyVersion === version) { lastUser = user.uid; window.ELMAGO_POLICY_ACCEPTED = true; return; }
    } catch (error) { console.warn('Gizlilik onayı okunamadı:', error); }
    window.ELMAGO_POLICY_ACCEPTED = false;
    const promptForConsent = () => {
      if (getAuth(getApp()).currentUser?.uid !== user.uid) return;
      if (window.openPrivacy) window.openPrivacy();
      else setTimeout(promptForConsent, 100);
    };
    promptForConsent();
  });
}

window.recordPrivacyConsent = recordConsent;
start();
