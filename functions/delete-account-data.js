'use strict';

// Keep deletion queries unbounded by UI pagination. Repeating a query after each
// batch also lets a failed attempt resume safely with the same authenticated UID.
async function deleteMatching(db, collection, field, value, deletedIds) {
  for (;;) {
    const snapshot = await db.collection(collection).where(field, '==', value).limit(100).get();
    if (snapshot.empty) return;
    for (const document of snapshot.docs) {
      await db.recursiveDelete(document.ref);
      if (deletedIds) deletedIds.add(document.id);
    }
  }
}

async function deleteAccountData({ db, bucket, uid, FieldValue }) {
  const listings = new Set();
  const contacts = new Set();
  const reports = new Set();
  const announcements = new Set();

  // Other participants' copies of a conversation are the same document tree.
  // recursiveDelete removes every message before removing its parent contact.
  await deleteMatching(db, 'lostFoundContacts', 'ownerUid', uid, contacts);
  await deleteMatching(db, 'lostFoundContacts', 'requesterUid', uid, contacts);
  await deleteMatching(db, 'lostFoundListings', 'ownerUid', uid, listings);
  await deleteMatching(db, 'lostFoundReports', 'reporterUid', uid, reports);
  for (const id of listings) await deleteMatching(db, 'lostFoundReports', 'listingId', id, reports);
  await deleteMatching(db, 'announcements', 'createdBy', uid, announcements);

  await deleteMatching(db, 'adminAudit', 'adminUid', uid);
  await deleteMatching(db, 'adminAudit', 'targetId', uid);
  for (const id of [...listings, ...contacts, ...reports, ...announcements]) {
    await deleteMatching(db, 'adminAudit', 'targetId', id);
  }
  const publicSettings = db.doc('adminSettings/public');
  const settings = await publicSettings.get();
  if (settings.exists && settings.get('updatedBy') === uid) {
    await publicSettings.update({ updatedBy: FieldValue.delete() });
  }
  await db.doc(`adminUserFlags/${uid}`).delete();
  await db.doc(`privacyConsents/${uid}`).delete();
  await db.doc(`userProfiles/${uid}`).delete();
  await bucket.deleteFiles({ prefix: `lost-found/${uid}/`, force: true });
}

module.exports = { deleteAccountData, deleteMatching };
