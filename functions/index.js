const { onDocumentCreated, onDocumentWritten } = require('firebase-functions/v2/firestore');
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

async function deleteQueryRecursively(db, query, beforeDelete) {
  // Page deleted records, not cursor positions: safe to resume after a retry.
  for (;;) {
    const snapshot = await query.limit(100).get();
    if (snapshot.empty) return;
    for (let offset = 0; offset < snapshot.docs.length; offset += 4) {
      await Promise.all(snapshot.docs.slice(offset, offset + 4).map(async document => {
        if (beforeDelete) await beforeDelete(document);
        await db.recursiveDelete(document.ref);
      }));
    }
  }
}

async function cleanupUserData(uid) {
  const db = admin.firestore();
  const targets = [
    ['lostFoundListings', 'ownerUid'],
    ['lostFoundPrivate', 'ownerUid'],
    ['lostFoundContacts', 'ownerUid'],
    ['lostFoundContacts', 'requesterUid'],
    ['lostFoundReports', 'reporterUid'],
    ['lostFoundReports', 'reportedUid'],
    ['pushDevices', 'ownerUid']
  ];

  for (const [collectionName, field] of targets) {
    const reportReference = collectionName === 'lostFoundListings' ? 'listingId' : collectionName === 'lostFoundContacts' ? 'conversationId' : null;
    await deleteQueryRecursively(db, db.collection(collectionName).where(field, '==', uid), reportReference
      ? document => deleteQueryRecursively(db, db.collection('lostFoundReports').where(reportReference, '==', document.id))
      : undefined);
  }
  await Promise.all([
    db.recursiveDelete(db.collection('users').doc(uid)),
    db.recursiveDelete(db.collection('adminUserFlags').doc(uid)),
    db.recursiveDelete(db.collection('listingRateLimits').doc(uid)),
    db.recursiveDelete(db.collection('messageRateLimits').doc(uid)),
    db.recursiveDelete(db.collection('e2eeKeys').doc(uid)),
    db.recursiveDelete(db.collection('userBlocks').doc(uid)),
    deleteQueryRecursively(db, db.collectionGroup('blockedUsers').where('targetUid', '==', uid)),
    admin.storage().bucket().deleteFiles({ prefix: `lost-found/${uid}/` })
  ]);
}

async function deleteAuthUserIfPresent(uid) {
  try { await admin.auth().deleteUser(uid); }
  catch (error) { if (error.code !== 'auth/user-not-found') throw error; }
}

async function ensureDeletionJob(uid) {
  const ref = admin.firestore().collection('accountDeletionJobs').doc(uid);
  try {
    await ref.create({ status: 'requested', requestedAt: admin.firestore.FieldValue.serverTimestamp() });
  } catch (error) {
    // Duplicate delivery/request is safe. Never overwrite a completed tombstone.
    if (error.code !== 6 && error.code !== 'already-exists') throw error;
  }
  return ref;
}

exports.deleteMyAccount = onCall({ region: 'europe-west1', timeoutSeconds: 30 }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Oturum gerekli.');
  if (request.data?.confirmation !== 'DELETE') {
    throw new HttpsError('invalid-argument', 'Silme onayı eksik.');
  }
  // Callable token validation alone does not check revoked/deleted sessions.
  // Validate against Auth before durably authorizing any destructive work.
  const bearer = String(request.rawRequest.headers.authorization || '').match(/^Bearer (\S+)$/i)?.[1];
  if (!bearer) throw new HttpsError('unauthenticated', 'Oturum gerekli.');
  let verified;
  try { verified = await admin.auth().verifyIdToken(bearer, true); }
  catch { throw new HttpsError('unauthenticated', 'Oturum geçersiz.'); }
  const uid = request.auth.uid;
  if (request.data?.expectedUid !== uid) throw new HttpsError('permission-denied', 'Hesap değişti; silme işlemini yeniden onayla.');
  if (verified.uid !== uid) throw new HttpsError('permission-denied', 'Hesap eşleşmedi.');
  const authTime = Number(verified.auth_time || 0) * 1000;
  if (!authTime || authTime > Date.now() + 30000 || Date.now() - authTime > 5 * 60 * 1000) {
    throw new HttpsError('failed-precondition', 'RECENT_LOGIN_REQUIRED');
  }
  // A durable job is written before deleting Auth. Rules deny further access for
  // this UID immediately, including still-unexpired ID tokens on other devices.
  // The trigger can finish even if this process or the client's connection dies.
  await ensureDeletionJob(uid);
  try { await deleteAuthUserIfPresent(uid); }
  catch {
    // The durable job still owns the request; do not imply the account was kept
    // or cancel the job merely because the synchronous response could not finish.
    throw new HttpsError('unavailable', 'Silme isteği alındı; tamamlanma durumu henüz doğrulanamadı.');
  }
  return { deleted: true, cleanupPending: true };
});

exports.processAccountDeletion = onDocumentCreated({
  document: 'accountDeletionJobs/{uid}', region: 'europe-west1', retry: true, timeoutSeconds: 540, maxInstances: 5
}, async event => {
  if (!event.data || event.data.data()?.status !== 'requested') return;
  const uid = event.params.uid;
  const job = event.data.ref;
  const current = await job.get();
  if (current.data()?.status === 'completed') return;
  await deleteAuthUserIfPresent(uid);
  await cleanupUserData(uid);
  // No credentials or personal content are retained in this administrative
  // tombstone. Keep it while old tokens could otherwise recreate data.
  await job.update({ status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp() });
});

// Console/admin deletions get the same durable, retried cleanup path.
exports.cleanupDeletedUser = functionsV1.runWith({ failurePolicy: true }).region('europe-west1').auth.user().onDelete(async user => {
  await ensureDeletionJob(user.uid);
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
