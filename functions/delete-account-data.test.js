'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { deleteAccountData } = require('./delete-account-data');

function fixture(entries) {
  const records = new Map(Object.entries(entries));
  const ref = path => ({
    id: path.split('/').at(-1), path,
    async get() { const value = records.get(path); return { exists: Boolean(value), get: key => value?.[key] }; },
    async update(value) { Object.assign(records.get(path), value); },
    async delete() { records.delete(path); }
  });
  const db = {
    doc: ref,
    collection: name => ({ where(field, op, value) {
      assert.equal(op, '==');
      return { limit(max) { return { async get() {
        const docs = [...records].filter(([path, data]) =>
          path.startsWith(name + '/') && path.split('/').length === 2 && data[field] === value
        ).slice(0, max).map(([path]) => ({ id: ref(path).id, ref: ref(path) }));
        return { empty: !docs.length, docs };
      } }; } };
    } }),
    async recursiveDelete(target) {
      for (const path of records.keys()) {
        if (path === target.path || path.startsWith(target.path + '/')) records.delete(path);
      }
    }
  };
  return { db, records };
}

test('removes every owner and participant record, nested messages, reports, audit and files', async () => {
  const items = {
    'lostFoundContacts/out': { ownerUid: 'user', requesterUid: 'other' },
    'lostFoundContacts/out/messages/one': { senderUid: 'other' },
    'lostFoundContacts/in': { ownerUid: 'other', requesterUid: 'user' },
    'lostFoundContacts/in/messages/two': { senderUid: 'user' },
    'lostFoundContacts/keep': { ownerUid: 'other', requesterUid: 'third' },
    'lostFoundListings/mine': { ownerUid: 'user' },
    'lostFoundListings/keep': { ownerUid: 'other' },
    'lostFoundReports/my-report': { reporterUid: 'user', listingId: 'keep' },
    'lostFoundReports/about-mine': { reporterUid: 'other', listingId: 'mine' },
    'lostFoundReports/keep': { reporterUid: 'other', listingId: 'keep' },
    'announcements/my-notice': { createdBy: 'user' },
    'adminAudit/by-me': { adminUid: 'user', targetId: 'keep' },
    'adminAudit/for-me': { adminUid: 'other', targetId: 'user' },
    'adminAudit/for-listing': { adminUid: 'other', targetId: 'mine' },
    'adminAudit/keep': { adminUid: 'other', targetId: 'keep' },
    'adminSettings/public': { updatedBy: 'user', maintenance: true },
    'adminUserFlags/user': { blocked: true },
    'privacyConsents/user': { policyVersion: 'v1' },
    'userProfiles/user': { name: 'User' }
  };
  for (let i = 0; i < 125; i++) items[`lostFoundListings/listing-${i}`] = { ownerUid: 'user' };
  const { db, records } = fixture(items);
  const prefixes = [];
  await deleteAccountData({
    db, uid: 'user', FieldValue: { delete: () => undefined },
    bucket: { deleteFiles: async options => prefixes.push(options.prefix) }
  });
  assert.deepEqual(prefixes, ['lost-found/user/']);
  assert.deepEqual([...records.keys()].sort(), [
    'adminAudit/keep', 'adminSettings/public', 'lostFoundContacts/keep',
    'lostFoundListings/keep', 'lostFoundReports/keep'
  ]);
  assert.equal(records.get('adminSettings/public').updatedBy, undefined);
  assert.equal(records.get('adminSettings/public').maintenance, true);
});
