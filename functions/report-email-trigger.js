// Pending setup: intentionally not exported by index.js until the verified
// sender and secret exist. Other security fixes must remain deployable first.
const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {defineSecret, defineString} = require('firebase-functions/params');
const admin = require('firebase-admin');
const {deliverReportEmail} = require('./report-email');
const BREVO_API_KEY = defineSecret('BREVO_API_KEY');
const REPORT_EMAIL_FROM = defineString('REPORT_EMAIL_FROM', {default: ''});

exports.emailLostFoundReport = onDocumentCreated({
  document: 'lostFoundReports/{reportId}', region: 'europe-west1',
  secrets: [BREVO_API_KEY], retry: true, timeoutSeconds: 60, maxInstances: 2,
}, async event => {
  if (!event.data) return;
  try {
    await deliverReportEmail({db: admin.firestore(), ref: event.data.ref,
      apiKey: BREVO_API_KEY.value(), sender: REPORT_EMAIL_FROM.value()});
  } catch (error) {
    console.error('Report email pending', {reportId: event.params.reportId, code: error.message});
    throw error;
  }
});
