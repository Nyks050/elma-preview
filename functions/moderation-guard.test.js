const test=require('node:test'), assert=require('node:assert/strict'), vm=require('node:vm'), fs=require('node:fs');
async function review({blocked=false,deleting=false}={}) {
  let update;
  const listing={ownerUid:'owner',status:'pending',title:'Cüzdan',mediaPaths:[]};
  const firestore=()=>({collection:name=>({doc:id=>({path:name+'/'+id})}),runTransaction:async action=>action({
    get:async ref=>ref.path.startsWith('lostFoundListings/')?{data:()=>listing}:ref.path.startsWith('adminUserFlags/')?{data:()=>({blocked})}:{exists:deleting},
    update:(_,value)=>{update=value;},
  })});
  firestore.FieldValue={serverTimestamp:()=>123};
  const register=(_,handler)=>handler, functionsV1={runWith:()=>({region:()=>({auth:{user:()=>({onDelete:fn=>fn})}})})};
  const dependencies={
    'firebase-functions/v2/firestore':{onDocumentCreated:register,onDocumentWritten:register},
    'firebase-functions/v2/https':{onCall:register,HttpsError:Error},
    'firebase-functions/params':{defineSecret:()=>({value:()=>''}),defineString:()=>({value:()=>''})},
    'firebase-functions/v1':functionsV1,'firebase-admin':{initializeApp(){},firestore},'@parse/node-apn':{},
    './listing-moderation':{fingerprint:()=> 'same',decide:()=> 'active',reviewListing:async()=>({decision:'approve',confidence:1})},
    './report-email':{deliverReportEmail:async()=>{}},
  };
  const exports={};vm.runInNewContext(fs.readFileSync(__dirname+'/index.js','utf8'),{exports,require:id=>{assert.ok(id in dependencies);return dependencies[id];},process:{env:{}},console});
  await exports.moderateAmasyaListing({data:{after:{data:()=>listing}},params:{listingId:'item'}});
  return update;
}
test('safe listing can publish when account is eligible',async()=>{assert.equal((await review()).status,'active');});
test('AI cannot override a human account block',async()=>{const r=await review({blocked:true});assert.equal(r.status,undefined);assert.equal(r.moderation.decision,'manual-review');});
test('AI cannot publish during account deletion',async()=>{const r=await review({deleting:true});assert.equal(r.status,undefined);assert.equal(r.moderation.decision,'manual-review');});
