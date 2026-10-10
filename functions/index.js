const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const functionsV1 = require('firebase-functions/v1');
const admin = require('firebase-admin');
const apn = require('@parse/node-apn');
const { fingerprint, decide, reviewListing } = require('./listing-moderation');

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

async function cleanupUserData(uid) {
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
  await Promise.all([
    db.recursiveDelete(db.collection('users').doc(uid)),
    db.recursiveDelete(db.collection('adminUserFlags').doc(uid)),
    db.recursiveDelete(db.collection('listingRateLimits').doc(uid)),
    db.recursiveDelete(db.collection('e2eeKeys').doc(uid)),
    admin.storage().bucket().deleteFiles({ prefix: `lost-found/${uid}/` })
  ]);
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
  await cleanupUserData(uid);
  await admin.auth().deleteUser(uid);
  return { deleted: true };
});

// Konsol veya başka bir yönetim aracı hesabı silerse veri kalıntısı bırakma.
exports.cleanupDeletedUser = functionsV1.region('europe-west1').auth.user().onDelete(async user => {
  await cleanupUserData(user.uid);
});

exports.moderateAmasyaListing = onDocumentWritten({
  document: 'lostFoundListings/{listingId}',
  region: 'europe-west1',
  maxInstances: 2,
  retry: false
}, async event => {
  const after = event.data?.after?.data();
  if (!after || after.status !== 'pending') return;
  const hash = fingerprint(after);
  if (after.moderation?.fingerprint === hash) return;

  let result;
  try {
    result = await reviewListing(after, { projectId: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT });
  } catch (error) {
    console.error('Listing moderation unavailable', { listingId: event.params.listingId, error: String(error) });
    result = { decision: 'review', confidence: 0, reason: 'AI unavailable; manual review required' };
  }
  const nextStatus = decide(result, after);
  const ref = admin.firestore().collection('lostFoundListings').doc(event.params.listingId);
  await admin.firestore().runTransaction(async transaction => {
    const current = await transaction.get(ref);
    const listing = current.data();
    if (!listing || listing.status !== 'pending' || fingerprint(listing) !== hash) return;
    transaction.update(ref, {
      ...(nextStatus === 'active' ? { status: 'active', approvedAt: admin.firestore.FieldValue.serverTimestamp(), approvedBy: 'ai-moderation' } : {}),
      moderation: {
        fingerprint: hash,
        decision: nextStatus === 'active' ? 'approved' : 'manual-review',
        confidence: Number(result.confidence) || 0,
        reason: String(result.reason || '').slice(0, 240),
        model: 'gemini-3.5-flash-lite',
        reviewedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });
  });
});

exports.notifyAmasyaLostListing = onDocumentWritten({
  document: 'lostFoundListings/{listingId}',
  region: 'europe-west1',
  secrets: [APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY]
}, async event => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!after || after.status !== 'active' || !['lost', 'found'].includes(after.kind) || String(after.city).toLocaleLowerCase('tr-TR') !== 'amasya') return;
  if (before?.status === 'active') return;

  const devices = await admin.firestore().collection('pushDevices')
    .where('city', '==', 'Amasya').where('enabled', '==', true).get();
  // Registrations are opt-in. This bounding box is only an approximate filter;
  // client-reported coordinates do not prove that a device is inside Amasya.
  const tokens = [...new Set(devices.docs.map(item => item.data()).filter(item =>
    item.platform === 'ios' && item.token && item.ownerUid !== after.ownerUid &&
    Number(item.latitude) >= 39.85 && Number(item.latitude) <= 41.05 &&
    Number(item.longitude) >= 34.85 && Number(item.longitude) <= 36.65
  ).map(item => item.token))];
  if (!tokens.length) return;

  const provider = new apn.Provider({
    token: { key: APNS_PRIVATE_KEY.value().replace(/\\n/g, '\n'), keyId: APNS_KEY_ID.value(), teamId: APNS_TEAM_ID.value() },
    production: true
  });
  const note = new apn.Notification();
  note.topic = 'tr.com.elmago.app';
  note.title = after.kind === 'found' ? 'Amasya’da bulunan eşya' : after.urgent ? 'Acil kayıp ilanı • Amasya' : 'Amasya’da yeni kayıp ilanı';
  note.body = [after.title, after.district].filter(Boolean).join(' • ');
  note.sound = 'default';
  note.payload = { type: 'lostListing', listingId: event.params.listingId };
  note.expiry = Math.floor(Date.now() / 1000) + 86400;
  try {
    for (let index = 0; index < tokens.length; index += 100) {
      const outcome = await provider.send(note, tokens.slice(index, index + 100));
      if (outcome.failed?.length) console.warn('Listing push partial failure', { listingId: event.params.listingId, failed: outcome.failed.length });
    }
  } finally { provider.shutdown(); }
});
