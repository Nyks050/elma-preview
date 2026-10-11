const test = require('node:test');
const assert = require('node:assert/strict');
const {reportMail, deliverReportEmail} = require('./report-email');
const sample = {listingId:'item',listingTitle:'Cüzdan',reporterUid:'reporter',reason:'Uygunsuz içerik'};
function fixture() {
  let data = {...sample}, calls = 0;
  const ref = {id:'report',update:async change=>{data={...data,...change};}};
  const db = {runTransaction:async action=>action({get:async()=>({exists:true,data:()=>data}),update:(_,change)=>{data={...data,...change};}})};
  return {db,ref,sender:'destek@elmago.com.tr',apiKey:'unit-test-key',now:()=>1000,
    fetchImpl:async(_,options)=>{calls++;assert.equal(options.headers['api-key'],'unit-test-key');return {status:201,json:async()=>({messageId:'provider-id'})};},
    get data(){return data;},get calls(){return calls;}};
}
test('fixed support recipient, bounded plain text, no arbitrary recipient or html',()=>{
  const mail=reportMail('id', {...sample,to:'attacker@example.test',reason:'<script>test</script>'.repeat(200)}, 'support@elmago.com.tr');
  assert.deepEqual(mail.to,[{email:'destek@elmago.com.tr'}]);assert.equal(mail.htmlContent,undefined);
  assert.ok(mail.textContent.length<1600);
  assert.throws(()=>reportMail('id',sample,'other@example.test'));
});
test('private conversation is never fetched; only explicitly submitted evidence is rendered',()=>{
  assert.ok(!reportMail('id',{...sample,messageText:'private'},'support@elmago.com.tr').textContent.includes('private'));
  assert.ok(reportMail('id',{...sample,messageId:'m1',messageText:'selected evidence'},'support@elmago.com.tr').textContent.includes('selected evidence'));
});
test('successful event is deduplicated and recorded as accepted, not delivered',async()=>{
  const f=fixture();await deliverReportEmail(f);await deliverReportEmail(f);
  assert.equal(f.calls,1);assert.equal(f.data.emailDelivery.status,'accepted');assert.equal(f.data.reason,sample.reason);
});
test('failed mail is retained and retries are bounded',async()=>{
  const f=fixture();f.fetchImpl=async()=>({status:503});
  for(let i=0;i<3;i++)await assert.rejects(deliverReportEmail(f),/REPORT_EMAIL_HTTP_503/);
  await deliverReportEmail(f);assert.equal(f.data.emailDelivery.status,'failed');assert.equal(f.data.emailDelivery.attempts,3);
  assert.equal(f.data.reason,sample.reason);
});
test('busy lease retries rather than acknowledging event',async()=>{
  const f=fixture();await f.ref.update({emailDelivery:{status:'sending',attempts:1,leaseUntil:60000}});
  await assert.rejects(deliverReportEmail(f),/EMAIL_DELIVERY_BUSY/);assert.equal(f.calls,0);
});
test('missing key does not mark report as sent or spend retry budget',async()=>{
  const f=fixture();f.apiKey='';await assert.rejects(deliverReportEmail(f),/EMAIL_KEY_NOT_CONFIGURED/);
  assert.equal(f.data.emailDelivery,undefined);
});
