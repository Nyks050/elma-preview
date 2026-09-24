'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const { deleteAccountData } = require('./delete-account-data');
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket('elma-bd38c.firebasestorage.app');
const region = 'europe-west1';
const lockCollection = 'accountDeletionLocks';

exports.deleteMyAccount = onCall({ region, timeoutSeconds: 540, memory: '512MiB' }, async request => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Hesabınla giriş yap.');
  const signedInAt = Number(request.auth.token.auth_time || 0) * 1000;
  if (!signedInAt || Date.now() - signedInAt > 5 * 60 * 1000) {
    throw new HttpsError('failed-precondition', 'Güvenlik için çıkış yapıp yeniden giriş yap.');
  }

  // Rules deny new writes while deletion runs, including writes from another
  // session holding an older token. Keep this minimal lock until those tokens
  // expire, then remove it from the scheduled cleanup below.
  const lock = db.collection(lockCollection).doc(uid);
  await lock.set({ createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  try {
    await deleteAccountData({ db, bucket, uid, FieldValue: admin.firestore.FieldValue });
    await auth.deleteUser(uid);
    return { deleted: true };
  } catch (error) {
    // Do not delete the Auth identity after only partial data cleanup. The
    // caller can sign in again and retry; the lock prevents new app writes.
    console.error('Account deletion failed');
    throw new HttpsError('internal', 'Silme tamamlanamadı. Lütfen tekrar dene.');
  }
});

exports.purgeAccountDeletionLocks = onSchedule({ schedule: 'every 1 hours', region }, async () => {
  const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 2 * 60 * 60 * 1000);
  const snapshot = await db.collection(lockCollection).where('createdAt', '<', cutoff).limit(100).get();
  for (const doc of snapshot.docs) {
    try {
      await auth.getUser(doc.id);
      // A failed deletion keeps its lock, so the user can safely retry.
    } catch (error) {
      if (error.code !== 'auth/user-not-found') throw error;
      await doc.ref.delete();
    }
  }
});
