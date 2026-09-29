const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const apn = require('@parse/node-apn');

admin.initializeApp();
const APNS_KEY_ID = defineSecret('APNS_KEY_ID');
const APNS_TEAM_ID = defineSecret('APNS_TEAM_ID');
const APNS_PRIVATE_KEY = defineSecret('APNS_PRIVATE_KEY');

async function deleteQueryRecursively(db, query) {
  const snapshot = await query.get();
  for (const document of snapshot.docs) {
    await db.recursiveDelete(document.ref);
  }
}

exports.deleteMyAccount = onCall({ region: 'europe-west1' }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Oturum gerekli.');
  const authTime = Number(request.auth.token.auth_time || 0) * 1000;
  if (!authTime || Date.now() - authTime > 5 * 60 * 1000) {
    throw new HttpsError('failed-precondition', 'RECENT_LOGIN_REQUIRED');
  }
  if (request.data?.confirmation !== 'DELETE') {
    throw new HttpsError('invalid-argument', 'Silme onayı eksik.');
  }

  const uid = request.auth.uid;
  const db = admin.firestore();
  const targets = [
    ['lostFoundListings', 'ownerUid'],
    ['lostFoundContacts', 'ownerUid'],
    ['lostFoundContacts', 'requesterUid'],
    ['lostFoundReports', 'reporterUid'],
    ['pushDevices', 'ownerUid']
  ];

  for (const [collectionName, field] of targets) {
    await deleteQueryRecursively(db, db.collection(collectionName).where(field, '==', uid));
  }
  await db.recursiveDelete(db.collection('users').doc(uid));
  await db.recursiveDelete(db.collection('adminUserFlags').doc(uid));
  await admin.storage().bucket().deleteFiles({ prefix: `lost-found/${uid}/` });
  await admin.auth().deleteUser(uid);
  return { deleted: true };
});

exports.notifyAmasyaLostListing = onDocumentWritten({
  document: 'lostFoundListings/{listingId}',
  region: 'europe-west1',
  secrets: [APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY]
}, async event => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!after || after.status !== 'active' || after.kind !== 'lost' || String(after.city).toLocaleLowerCase('tr-TR') !== 'amasya') return;
  if (before?.status === 'active') return;

  const devices = await admin.firestore().collection('pushDevices')
    .where('city', '==', 'Amasya').where('enabled', '==', true).get();
  const tokens = devices.docs.map(item => item.data()).filter(item => item.token && item.ownerUid !== after.ownerUid).map(item => item.token);
  if (!tokens.length) return;

  const provider = new apn.Provider({
    token: { key: APNS_PRIVATE_KEY.value().replace(/\\n/g, '\n'), keyId: APNS_KEY_ID.value(), teamId: APNS_TEAM_ID.value() },
    production: true
  });
  const note = new apn.Notification();
  note.topic = 'tr.com.elmago.app';
  note.title = after.urgent ? 'Acil kayıp ilanı • Amasya' : 'Amasya’da yeni kayıp ilanı';
  note.body = [after.title, after.district].filter(Boolean).join(' • ');
  note.sound = 'default';
  note.payload = { type: 'lostListing', listingId: event.params.listingId };
  note.expiry = Math.floor(Date.now() / 1000) + 86400;
  try { await provider.send(note, tokens); } finally { provider.shutdown(); }
});
