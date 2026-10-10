const test = require('node:test');
const assert = require('node:assert/strict');
const { fingerprint, decide, reviewListing } = require('./listing-moderation');

const listing = { kind: 'lost', title: 'Anahtar kayıp', description: 'Anahtarımı kaybettim.', category: 'Diğer', city: 'Amasya', district: 'Merkez', ownerUid: 'u1', updatedAt: { seconds: 42 } };

test('only high-confidence safe listings are auto-published', () => {
  assert.equal(decide({ decision: 'approve', confidence: 0.95 }, listing), 'active');
  assert.equal(decide({ decision: 'approve', confidence: 0.89 }, listing), 'review');
  assert.equal(decide({ decision: 'reject', confidence: 1 }, listing), 'review');
  assert.equal(decide({ decision: 'approve', confidence: 1 }, { ...listing, city: 'İstanbul' }), 'review');
  assert.equal(decide({ decision: 'approve', confidence: 1 }, { ...listing, description: 'Beni 0555 123 45 67 numarasından arayın' }), 'review');
});

test('moderation metadata does not change content fingerprint', () => {
  assert.equal(fingerprint(listing), fingerprint({ ...listing, moderation: { decision: 'approved' } }));
  assert.notEqual(fingerprint(listing), fingerprint({ ...listing, description: 'Farklı metin' }));
});

test('Vertex failure leaves a listing for manual review', async () => {
  await assert.rejects(reviewListing(listing, { projectId: 'example', fetchImpl: async () => ({ ok: false, status: 503 }) }), /auth failed/);
});

test('Vertex request uses EU endpoint and returns structured decision', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1
      ? { ok: true, json: async () => ({ access_token: 'test-token' }) }
      : { ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"decision":"approve","confidence":0.96,"reason":"Safe"}' }] } }] }) };
  };
  assert.equal((await reviewListing(listing, { projectId: 'example', fetchImpl })).decision, 'approve');
  assert.match(calls[1].url, /^https:\/\/aiplatform\.eu\.rep\.googleapis\.com\/v1\/projects\/example\/locations\/eu\//);
  assert.equal(JSON.parse(calls[1].options.body).generationConfig.responseMimeType, 'application/json');
});
