'use strict';

const RECIPIENT = 'destek@elmago.com.tr';
const MAX_ATTEMPTS = 3;
const clean = (value, limit) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, limit);

function reportMail(id, report, sender) {
  if (!/^[^\s@]+@elmago\.com\.tr$/i.test(sender)) throw new Error('EMAIL_SENDER_NOT_CONFIGURED');
  const lines = [
    'Elma Go — yeni şikâyet',
    `Kayıt: ${clean(id, 180)}`,
    `Tür: ${report.kind === 'message' ? 'Mesaj / sohbet' : 'İlan'}`,
    `İlan: ${clean(report.listingTitle, 80)}`,
    `İlan kimliği: ${clean(report.listingId, 180)}`,
    `Bildiren kullanıcı: ${clean(report.reporterUid, 128)}`,
    `Bildirilen kullanıcı: ${clean(report.reportedUid, 128) || 'İlan sahibi'}`,
    '', 'Kullanıcının bildirdiği neden:', clean(report.reason, 500),
  ];
  if (report.conversationId) lines.push('', `Sohbet kimliği: ${clean(report.conversationId, 180)}`);
  // Only the message explicitly submitted through the consent flow is included.
  // Never fetch, decrypt, or append the rest of a private conversation.
  if (report.messageId && report.messageText) lines.push('',
    `Kullanıcının inceleme için paylaştığı mesaj (${clean(report.messageId, 180)}):`,
    clean(report.messageText, 2000));
  lines.push('', 'Bu bir kullanıcı bildirimi, doğrulanmış bir ihlal kararı değildir.',
    'İnsan incelemesi gerekir. Gerekirse ilanı kaldırın veya kullanıcıyı engelleyin; sonucu şikâyet kaydına işleyin.',
    'Bu e-postaya cevap vermek uygulamadaki içeriği veya hesabı otomatik değiştirmez.');
  return {
    sender: {name: 'Elma Go Güvenlik', email: sender},
    to: [{email: RECIPIENT}],
    subject: `Elma Go şikâyet · ${clean(id, 80).replace(/[\r\n]/g, '')}`,
    textContent: lines.join('\n'),
    tags: ['moderation-report'],
  };
}

async function deliverReportEmail({db, ref, apiKey, sender, fetchImpl = fetch, now = Date.now}) {
  // Missing credentials must not consume a report's retry budget.
  if (!apiKey) throw new Error('EMAIL_KEY_NOT_CONFIGURED');
  reportMail('validation', {}, sender);
  const report = await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) return null;
    const data = snapshot.data(), delivery = data.emailDelivery || {};
    if (delivery.status === 'accepted' || delivery.status === 'failed') return null;
    // Retrying (not acknowledging) a busy delivery avoids dropping the report
    // if the worker holding this short lease has crashed.
    if (delivery.leaseUntil > now()) throw new Error('EMAIL_DELIVERY_BUSY');
    const attempts = Number(delivery.attempts) || 0;
    if (attempts >= MAX_ATTEMPTS) {
      tx.update(ref, {emailDelivery: {status: 'failed', attempts, code: 'RETRY_LIMIT'}});
      return null;
    }
    tx.update(ref, {emailDelivery: {status: 'sending', attempts: attempts + 1, leaseUntil: now() + 60000}});
    return {...data, attempt: attempts + 1};
  });
  if (!report) return;
  let code = 'NETWORK_ERROR';
  try {
    const response = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', headers: {'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json'},
      body: JSON.stringify(reportMail(ref.id, report, sender)),
      signal: AbortSignal.timeout(15000),
    });
    code = `HTTP_${response.status}`;
    if (response.status !== 201) throw new Error(code);
    const body = await response.json();
    if (typeof body.messageId !== 'string' || !body.messageId) { code = 'INVALID_RESPONSE'; throw new Error(code); }
    // Accepted by the email provider is NOT proof of inbox delivery.
    await ref.update({emailDelivery: {status: 'accepted', attempts: report.attempt,
      messageId: body.messageId.slice(0, 300), acceptedAt: now()}});
  } catch {
    // Keep the report, including consented evidence, even if mail fails.
    // No provider response body, secret, or private message enters logs.
    try { await ref.update({emailDelivery: {status: report.attempt >= MAX_ATTEMPTS ? 'failed' : 'retry', attempts: report.attempt, code}}); }
    catch { /* The report may have been deleted with the user's account. */ }
    throw new Error(`REPORT_EMAIL_${code}`);
  }
}

module.exports = {reportMail, deliverReportEmail, RECIPIENT};
