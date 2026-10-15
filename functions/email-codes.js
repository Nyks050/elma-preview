'use strict';

// Server-only OTP state. Never expose this collection through Firestore rules.
const {randomInt, randomUUID, createHmac, timingSafeEqual} = require('node:crypto');
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {defineSecret} = require('firebase-functions/params');
const admin = require('firebase-admin');
const {codeMail} = require('./email-code-mail');
const RESEND_AUTH_API_KEY = defineSecret('RESEND_AUTH_API_KEY');
const EMAIL_CODE_HMAC_KEY = defineSecret('EMAIL_CODE_HMAC_KEY');
const options = {region: 'europe-west1', invoker: 'public', maxInstances: 2, minInstances: 0,
  concurrency: 8, memory: '256MiB', timeoutSeconds: 45, secrets: [RESEND_AUTH_API_KEY, EMAIL_CODE_HMAC_KEY]};
const TTL = 10 * 60 * 1000;
const FROM = 'Elma Go <noreply@auth.elmago.com.tr>';
const genericError = () => new HttpsError('invalid-argument', 'Kod geçersiz, kullanılmış veya süresi dolmuş. Yeni kod iste.');
function normalizeEmail(value) {
  if (typeof value !== 'string') throw new HttpsError('invalid-argument', 'Geçerli bir e-posta adresi gir.');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'Geçerli bir e-posta adresi gir.');
  }
  return email;
}
function purposeOf(value) {
  if (!['register', 'reset'].includes(value)) throw new HttpsError('invalid-argument', 'Geçersiz işlem.');
  return value;
}
function digest(value) { return createHmac('sha256', EMAIL_CODE_HMAC_KEY.value()).update(value).digest('hex'); }
function matches(a, b) {
  return typeof a === 'string' && a.length === 64 && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
async function findUser(email) {
  try { return await admin.auth().getUserByEmail(email); }
  catch (error) { if (error.code === 'auth/user-not-found') return null; throw error; }
}

exports.requestEmailCode = onCall(options, async request => {
  const email = normalizeEmail(request.data?.email), purpose = purposeOf(request.data?.purpose);
  const db = admin.firestore(), now = Date.now();
  const id = randomUUID(), code = String(randomInt(0, 1000000)).padStart(6, '0');
  const mailbox = digest(`email:${email}`), ip = digest(`ip:${request.rawRequest.ip || 'unknown'}`);
  const current = db.doc(`emailCodeState/${digest(`${email}:${purpose}`)}`);
  const hour = Math.floor(now / 3600000), date = new Date(now).toISOString();
  const refs = [db.doc(`emailCodeLimits/day-${date.slice(0, 10)}`),
    db.doc(`emailCodeLimits/month-${date.slice(0, 7)}`),
    db.doc(`emailCodeLimits/mail-${mailbox}-${hour}`), db.doc(`emailCodeLimits/ip-${ip}-${hour}`)];
  const ceilings = [100, 3000, 3, 10];
  // Reserve quota before any send. Unknown addresses count too, so clients
  // cannot infer account existence from differing rate-limit behavior.
  await db.runTransaction(async tx => {
    const old = await tx.get(current), counts = await tx.getAll(...refs);
    if (old.exists && now - old.data().issuedAt < 60000) throw new HttpsError('resource-exhausted', 'Yeni kod için bir dakika bekle.');
    if (counts.some((s, i) => (s.data()?.count || 0) >= ceilings[i])) {
      throw new HttpsError('resource-exhausted', 'E-posta gönderim sınırına ulaşıldı. Daha sonra tekrar dene.');
    }
    counts.forEach((s, i) => tx.set(refs[i], {count: (s.data()?.count || 0) + 1,
      expiresAt: admin.firestore.Timestamp.fromMillis(now + 35 * 86400000)}));
    tx.set(current, {id, purpose, hash: digest(`${id}:${email}:${purpose}:${code}`), attempts: 0,
      issuedAt: now, expiresAt: admin.firestore.Timestamp.fromMillis(now + TTL), status: 'preparing'});
  });
  const user = await findUser(email);
  const eligible = purpose === 'register' ? !user : !!user && !user.disabled
    && user.providerData.some(provider => provider.providerId === 'password');
  if (eligible) {
    const mail = codeMail(purpose, code);
    try {
      const response = await fetch('https://api.resend.com/emails', {method: 'POST',
        headers: {Authorization: `Bearer ${RESEND_AUTH_API_KEY.value()}`, 'Content-Type': 'application/json',
          'Idempotency-Key': `email-code-${id}`},
        body: JSON.stringify({from: FROM, to: [email], ...mail,
          reply_to: 'destek@elmago.com.tr'}), signal: AbortSignal.timeout(15000)});
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.id !== 'string') throw new Error('DELIVERY_FAILED');
    } catch {
      await db.runTransaction(async tx => {
        const snapshot = await tx.get(current);
        if (snapshot.data()?.id === id) tx.update(current, {status: 'failed', hash: admin.firestore.FieldValue.delete()});
      });
      throw new HttpsError('unavailable', 'Kod e-postası gönderilemedi. Daha sonra tekrar dene.');
    }
  }
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(current);
    if (snapshot.data()?.id === id) tx.update(current, {status: eligible ? 'ready' : 'unavailable', uid: user?.uid || null});
  });
  // Never return the code, delivery result or whether an account exists.
  return {ok: true, challengeId: id, expiresIn: TTL / 1000, resendAfter: 60};
});

exports.completeEmailCode = onCall({...options, secrets: [EMAIL_CODE_HMAC_KEY]}, async request => {
  const email = normalizeEmail(request.data?.email), purpose = purposeOf(request.data?.purpose);
  const {challengeId, code, password} = request.data || {};
  if (typeof challengeId !== 'string' || !/^[0-9a-f-]{36}$/.test(challengeId)
    || typeof code !== 'string' || !/^\d{6}$/.test(code)) throw genericError();
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new HttpsError('invalid-argument', 'Şifre 8–128 karakter olmalı.');
  }
  const name = typeof request.data.name === 'string' ? request.data.name.trim().replace(/\s+/g, ' ') : '';
  if (purpose === 'register' && (name.length < 2 || name.length > 100 || request.data.consent !== true)) {
    throw new HttpsError('invalid-argument', 'Ad soyad ve gizlilik onayı gerekli.');
  }
  const db = admin.firestore(), current = db.doc(`emailCodeState/${digest(`${email}:${purpose}`)}`);
  const claim = await db.runTransaction(async tx => {
    const snapshot = await tx.get(current), value = snapshot.data();
    if (!value || value.id !== challengeId || value.status !== 'ready' || value.attempts >= 5
      || value.expiresAt.toMillis() <= Date.now()) return null;
    if (!matches(value.hash, digest(`${challengeId}:${email}:${purpose}:${code}`))) {
      tx.update(current, {attempts: value.attempts + 1, ...(value.attempts >= 4 ? {status: 'locked'} : {})});
      return null;
    }
    // Consume before the Auth mutation; simultaneous requests cannot reuse it.
    tx.update(current, {status: 'consumed', hash: admin.firestore.FieldValue.delete()});
    return {uid: value.uid};
  });
  if (!claim) throw genericError();
  try {
    if (purpose === 'register') {
      // Never verify, overwrite or reset a pre-existing account via registration.
      await admin.auth().createUser({email, password, displayName: name, emailVerified: true});
    } else {
      const user = await admin.auth().getUser(claim.uid);
      if (user.email?.toLowerCase() !== email || user.disabled
        || !user.providerData.some(provider => provider.providerId === 'password')) throw genericError();
      const deletion = await db.doc(`accountDeletionJobs/${user.uid}`).get();
      if (deletion.exists) throw genericError();
      // This code has also proved ownership of the account's current mailbox.
      await admin.auth().updateUser(user.uid, {password, emailVerified: true});
      await admin.auth().revokeRefreshTokens(user.uid);
    }
    return {ok: true, completed: true};
  } catch {
    // No password, token, code, email or provider error body enters logs.
    throw new HttpsError('failed-precondition', 'İşlem tamamlanamadı. Yeni kod isteyip tekrar dene.');
  }
});

