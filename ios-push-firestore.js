import { getApp, getApps } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { deleteDoc, doc, getFirestore, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const app = getApps()[0] || getApp();
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = auth.currentUser;
let pendingDevice = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user && pendingDevice) persist(pendingDevice);
});

async function tokenID(token) {
  const bytes = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(value => value.toString(16).padStart(2, '0')).join('');
}

async function persist(device) {
  if (!currentUser || !device?.token || device.city !== 'Amasya') return;
  const id = await tokenID(device.token);
  await setDoc(doc(db, 'pushDevices', id), {
    ownerUid: currentUser.uid,
    token: device.token,
    platform: 'ios',
    city: 'Amasya',
    latitude: device.latitude,
    longitude: device.longitude,
    enabled: true,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

window.addEventListener('elma-ios-push-ready', event => {
  pendingDevice = event.detail;
  persist(pendingDevice).catch(error => console.warn('ElmaGo push device registration failed', error));
});

window.elmaDisableIOSPush = async () => {
  const token = pendingDevice?.token;
  if (!token || !currentUser) return;
  await deleteDoc(doc(db, 'pushDevices', await tokenID(token)));
};
