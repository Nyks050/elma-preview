const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const root = fs.existsSync(path.resolve(__dirname, '../web/account-profile.js'))
  ? path.resolve(__dirname, '../web') : path.resolve(__dirname, '..');
const clientSource = fs.readFileSync(path.join(root, 'account-profile.js'), 'utf8')
  .replace(/^import .*;\r?\n/gm, '').replace(/start\(\);\s*$/, '');
const serverSource = fs.readFileSync(path.join(root, 'functions/index.js'), 'utf8');

function clientHarness({ provider = 'google.com', stale = false, native, callable, fetch: fetchStub } = {}) {
  const calls = [];
  const user = {
    uid: 'test-user', email: 'test@example.invalid', providerData: [{ providerId: provider }],
    getIdTokenResult: async () => ({ signInProvider: provider, authTime: new Date(Date.now() - (stale ? 600000 : 0)).toISOString() }),
    getIdToken: async () => 'firebase-id-token'
  };
  const auth = { currentUser: user, app: { options: { apiKey: 'public-firebase-test-key' } } };
  const context = {
    console, setTimeout, clearTimeout, AbortController, URL, Date,
    window: { addEventListener() {}, webkit: { messageHandlers: { elmaRoutePlanner: {} } }, ...(native ? { __elmaReauthenticateAccount: (...args) => { calls.push(['reauth', ...args]); return native(...args); } } : {}) },
    document: { createElement: () => ({ textContent: '' }), head: { appendChild() {} } },
    localStorage: { removeItem: key => calls.push(['local-remove', key]) }, sessionStorage: { removeItem() {} },
    getApp: () => auth.app, getApps: () => [auth.app], getAuth: () => auth,
    getFunctions: (_app, region) => { assert.equal(region, 'europe-west1'); return {}; },
    httpsCallable: (_functions, name, options) => {
      assert.equal(name, 'deleteMyAccount'); assert.equal(options.timeout, 20000);
      return data => { calls.push(['delete', data]); return callable ? callable(data) : Promise.resolve({ data: { deleted: true, cleanupPending: true } }); };
    },
    signOut: async () => { calls.push(['sign-out']); auth.currentUser = null; },
    fetch: async (url, options) => { calls.push(['revoke', url, JSON.parse(options.body)]); return fetchStub ? fetchStub(url, options) : { ok: true }; },
    EmailAuthProvider: { credential: () => ({}) }, GoogleAuthProvider: class {}, OAuthProvider: class {},
    reauthenticateWithCredential: async () => {}, reauthenticateWithPopup: async () => {}, revokeAccessToken: async () => {},
    prompt: () => 'SİL', alert() {}, location: { replace() {} }
  };
  vm.createContext(context);
  vm.runInContext(clientSource + '\nthis.runDelete = deleteCurrentAccountOnce; this.renderProfile = renderWhenReady;', context);
  const button = { disabled: false, textContent: 'Hesabımı sil' }, status = { textContent: '' };
  return { auth, calls, button, status, context, run: () => context.runDelete(auth, button, status, true) };
}

test('recent Google account goes directly to server; no client data purge precedes confirmation', async () => {
  const h = clientHarness();
  const result = await h.run();
  assert.equal(result.ok, true); assert.equal(result.cleanupPending, true);
  assert.equal(h.calls[0][0], 'delete'); assert.equal(h.calls[1][0], 'sign-out');
  assert.ok(h.status.textContent.includes('sunucuda temizleniyor'));
  assert.doesNotMatch(clientSource, /deleteUser\(|deleteDoc\(|deleteObject\(/);
});

test('native profile updates do not watch removed account DOM; web uses one bounded observer', () => {
  const h = clientHarness(); let observers = 0; let stopped = 0; let stop;
  h.context.MutationObserver = class { constructor() { observers++; } observe() {} disconnect() { stopped++; } };
  for (let i = 0; i < 10; i++) h.context.renderProfile(h.auth.currentUser);
  assert.equal(observers, 0);
  h.context.window.webkit = null;
  h.context.document.querySelector = () => null; h.context.document.body = {};
  h.context.setTimeout = (callback, duration) => { assert.equal(duration, 10000); stop = callback; return 1; };
  h.context.clearTimeout = () => {};
  for (let i = 0; i < 10; i++) h.context.renderProfile(h.auth.currentUser);
  assert.equal(observers, 1);
  stop(); assert.equal(stopped, 1);
});

test('old Google session reauthenticates exact existing UID without a logout detour', async () => {
  const h = clientHarness({ stale: true, native: async () => ({}) });
  assert.equal((await h.run()).ok, true);
  assert.deepEqual(h.calls[0], ['reauth', 'google.com', 'test-user']);
  assert.equal(h.calls[1][0], 'delete');
});

test('old native email session uses visible secure native reauthentication, not hidden web modal', async () => {
  const h = clientHarness({ provider: 'password', stale: true, native: async () => ({}) });
  assert.equal((await h.run()).ok, true);
  assert.deepEqual(h.calls[0], ['reauth', 'password', 'test-user']);
  const outdated = clientHarness({ provider: 'password', stale: true });
  assert.equal((await outdated.run()).error, 'auth/native-update-required');
  assert.equal(outdated.calls.some(call => call[0] === 'delete'), false);
});

test('native cancelled or different-account reauthentication never submits deletion', async () => {
  for (const code of ['auth/cancelled', 'auth/user-mismatch']) {
    const h = clientHarness({ stale: true, native: async () => { throw Object.assign(new Error(code), { code }); } });
    assert.equal((await h.run()).ok, false);
    assert.equal(h.calls.some(call => call[0] === 'delete'), false);
    assert.equal(h.button.disabled, false);
  }
});

test('changing current account while reauth is open cannot delete either account', async () => {
  let h;
  h = clientHarness({ stale: true, native: async () => { h.auth.currentUser = { uid: 'different-user' }; return {}; } });
  assert.equal((await h.run()).error, 'auth/user-mismatch');
  assert.equal(h.calls.some(call => call[0] === 'delete'), false);
});

test('Apple uses authorization-code revocation, then deletes; never treats code as access token', async () => {
  const h = clientHarness({ provider: 'apple.com', native: async () => ({ appleAuthorizationCode: 'one-time-code' }) });
  assert.equal((await h.run()).ok, true);
  assert.equal(h.calls[0][0], 'reauth'); assert.equal(h.calls[1][0], 'revoke'); assert.equal(h.calls[2][0], 'delete');
  assert.equal(h.calls[1][2].providerId, 'apple.com');
  assert.equal(h.calls[1][2].tokenType, '3'); assert.equal(h.calls[1][2].token, 'one-time-code');
});

test('Apple revoke failure preserves account and data', async () => {
  const h = clientHarness({ provider: 'apple.com', native: async () => ({ appleAuthorizationCode: 'code' }), fetch: async () => ({ ok: false }) });
  assert.equal((await h.run()).error, 'auth/apple-revocation-failed');
  assert.equal(h.calls.some(call => call[0] === 'delete' || call[0] === 'sign-out' || call[0] === 'local-remove'), false);
  assert.equal(h.button.disabled, false);
});

test('duplicate taps share one deletion request', async () => {
  let resolve;
  const h = clientHarness({ callable: () => new Promise(done => { resolve = done; }) });
  const first = h.run(); const second = h.run();
  assert.equal(first, second);
  while (!resolve) await new Promise(done => setImmediate(done));
  resolve({ data: { deleted: true, cleanupPending: true } });
  await first;
  assert.equal(h.calls.filter(call => call[0] === 'delete').length, 1);
});

test('timeout or unsuccessful server response is not presented as success', async () => {
  const h = clientHarness({ callable: async () => { throw Object.assign(new Error('timeout'), { code: 'functions/deadline-exceeded' }); } });
  assert.equal((await h.run()).ok, false);
  assert.equal(h.calls.some(call => call[0] === 'sign-out'), false);
  assert.ok(h.status.textContent.includes('başlamış olabilir'));
});

function serverHarness({ tokenAge = 0, verifiedUID = 'test-user', revoked = false, deleteFailure = false } = {}) {
  const records = new Map(); const calls = []; const configs = {};
  const makeRef = refPath => ({ path: refPath,
    create: async data => { if (records.has(refPath)) throw { code: 6 }; records.set(refPath, data); calls.push(['job-create', refPath]); },
    get: async () => ({ exists: records.has(refPath), data: () => records.get(refPath) }),
    update: async data => { records.set(refPath, { ...records.get(refPath), ...data }); calls.push(['job-update', refPath]); }
  });
  const makeQuery = queryPath => ({ where: () => makeQuery(queryPath), limit: count => ({ get: async () => { assert.equal(count, 100); calls.push(['query', queryPath]); return { empty: true, docs: [] }; } }), doc: id => makeRef(queryPath + '/' + id) });
  const db = { collection: makeQuery, collectionGroup: makeQuery, recursiveDelete: async ref => calls.push(['data-delete', ref.path]) };
  const auth = {
    verifyIdToken: async (_token, checkRevoked) => { calls.push(['verify', checkRevoked]); if (revoked) throw new Error('revoked'); return { uid: verifiedUID, auth_time: Math.floor((Date.now() - tokenAge) / 1000) }; },
    deleteUser: async uid => { calls.push(['auth-delete', uid]); if (deleteFailure) throw new Error('temporary Auth outage'); }
  };
  const firestore = () => db; firestore.FieldValue = { serverTimestamp: () => 'SERVER_TIMESTAMP' };
  const admin = { initializeApp() {}, firestore, auth: () => auth, storage: () => ({ bucket: () => ({ deleteFiles: async args => calls.push(['storage-delete', args.prefix]) }) }) };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const functionsV1 = { runWith: config => { configs.onDelete = config; return { region: () => ({ auth: { user: () => ({ onDelete: handler => handler }) } }) }; } };
  const context = { exports: {}, Date, console, require(name) {
    if (name === 'firebase-admin') return admin;
    if (name === 'firebase-functions/v2/firestore') return { onDocumentCreated: (config, handler) => { configs.worker = config; return handler; }, onDocumentWritten: (_config, handler) => handler };
    if (name === 'firebase-functions/v2/https') return { HttpsError, onCall: (_config, handler) => handler };
    if (name === 'firebase-functions/params') return { defineSecret: () => ({ value: () => '' }) };
    if (name === 'firebase-functions/v1') return functionsV1;
    if (name === './listing-moderation') return {};
    if (name === '@parse/node-apn') return {};
    throw new Error(name);
  } };
  vm.createContext(context); vm.runInContext(serverSource + '\nthis.deletePaged = deleteQueryRecursively;', context);
  return { handlers: context.exports, calls, records, configs, ref: makeRef, deletePaged: context.deletePaged,
    request: { auth: { uid: 'test-user' }, data: { confirmation: 'DELETE', expectedUid: 'test-user' }, rawRequest: { headers: { authorization: 'Bearer test-token' } } } };
}

test('server authorizes a durable job before Auth deletion, with no inline data cleanup', async () => {
  const h = serverHarness(); const result = await h.handlers.deleteMyAccount(h.request);
  assert.equal(result.deleted, true); assert.equal(result.cleanupPending, true);
  assert.deepEqual(h.calls.map(call => call[0]), ['verify', 'job-create', 'auth-delete']);
});

test('cleanup paginates more than 100 records with bounded parallelism and dependent cleanup first', async () => {
  const h = serverHarness(); const remaining = new Set(Array.from({ length: 231 }, (_, i) => String(i)));
  const before = new Set(); let active = 0, peak = 0, reads = 0;
  const db = { recursiveDelete: async ref => {
    assert.equal(before.has(ref.path), true);
    active++; peak = Math.max(peak, active);
    await new Promise(done => setImmediate(done));
    remaining.delete(ref.path); active--;
  } };
  const query = { limit: count => ({ get: async () => {
    assert.equal(count, 100); reads++;
    const docs = [...remaining].slice(0, count).map(id => ({ id, ref: { path: id } }));
    return { empty: !docs.length, docs };
  } }) };
  await h.deletePaged(db, query, async document => { before.add(document.id); });
  assert.equal(remaining.size, 0); assert.equal(reads, 4); assert.ok(peak <= 4);
});

test('stale/revoked/mismatched/no-consent sessions never authorize destructive work', async () => {
  for (const options of [{ tokenAge: 600000 }, { revoked: true }, { verifiedUID: 'other' }, { noConsent: true }, { changedAccount: true }]) {
    const h = serverHarness(options); if (options.noConsent) h.request.data.confirmation = 'NO';
    if (options.changedAccount) h.request.data.expectedUid = 'previous-user';
    await assert.rejects(h.handlers.deleteMyAccount(h.request));
    assert.equal(h.calls.some(call => /delete|create/.test(call[0])), false);
  }
});

test('Auth outage leaves durable authorized job; worker retry is idempotent', async () => {
  const h = serverHarness({ deleteFailure: true });
  await assert.rejects(h.handlers.deleteMyAccount(h.request));
  assert.equal(h.records.get('accountDeletionJobs/test-user').status, 'requested');
  const good = serverHarness();
  await good.handlers.deleteMyAccount(good.request);
  const event = { params: { uid: 'test-user' }, data: { data: () => ({ status: 'requested' }), ref: good.ref('accountDeletionJobs/test-user') } };
  await good.handlers.processAccountDeletion(event);
  assert.equal(good.records.get('accountDeletionJobs/test-user').status, 'completed');
  assert.ok(good.calls.some(call => call[0] === 'data-delete' && call[1] === 'userBlocks/test-user'));
  const count = good.calls.length; await good.handlers.processAccountDeletion(event); assert.equal(good.calls.length, count);
  assert.equal(good.configs.worker.retry, true); assert.equal(good.configs.onDelete.failurePolicy, true);
});

test('console deletion creates same durable cleanup job without resetting completed status', async () => {
  const h = serverHarness();
  await h.handlers.cleanupDeletedUser({ uid: 'test-user' });
  h.records.set('accountDeletionJobs/test-user', { status: 'completed' });
  await h.handlers.cleanupDeletedUser({ uid: 'test-user' });
  assert.equal(h.records.get('accountDeletionJobs/test-user').status, 'completed');
});
