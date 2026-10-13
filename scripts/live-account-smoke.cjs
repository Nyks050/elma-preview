// Explicit production smoke: creates only an isolated fixture, then removes it.
// Never print passwords, OAuth tokens, ID tokens or session handoff tokens.
const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
async function main(){
  const project=process.env.ELMA_LIVE_SMOKE_PROJECT;
  assert.equal(project,'elma-bd38c');
  const cliAuth=require(path.join(process.env.FIREBASE_CLI_LIB,'auth.js'));
  const account=cliAuth.getGlobalDefaultAccount();
  if(!account?.tokens?.refresh_token)throw Error('Firebase CLI login required');
  const access=await cliAuth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase']);
  const admin=require('../functions/node_modules/firebase-admin');
  const app=admin.initializeApp({projectId:project,credential:{getAccessToken:async()=>({access_token:access.access_token,expires_in:access.expires_in||3600})}});
  const uid='release-smoke-'+crypto.randomUUID(),email=uid+'@example.invalid',password=crypto.randomBytes(24).toString('hex');
  assert.ok(uid.startsWith('release-smoke-'));
  const plist=fs.readFileSync(process.env.ELMA_IOS_FIREBASE_CONFIG,'utf8');
  const apiKey=plist.match(/<key>API_KEY<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
  if(!apiKey)throw Error('iOS Firebase configuration missing');
  const profileURL=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users/${uid}`;
  async function passwordLogin(){
    const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(apiKey),{method:'POST',headers:{'Content-Type':'application/json','X-Ios-Bundle-Identifier':'tr.com.elmago.app'},body:JSON.stringify({email,password,returnSecureToken:true})});
    const body=await response.json();if(!response.ok)throw Error('Password login HTTP '+response.status);assert.equal(body.localId,uid);return body.idToken;
  }
  async function callable(name,token,data){
    const response=await fetch(`https://europe-west1-${project}.cloudfunctions.net/${name}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({data})});
    const text=await response.text();let body;
    try{body=JSON.parse(text);}catch{throw Error(name+' returned HTTP '+response.status+' without a callable response');}
    if (!body.result && body.data) body.result = body.data;
    return{status:response.status,body};
  }
  let created=false;
  try{
    await admin.auth(app).createUser({uid,email,password,emailVerified:true,displayName:'Release smoke fixture'});created=true;
    const profile=await fetch(profileURL,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+access.access_token},body:JSON.stringify({fields:{displayName:{stringValue:'Release smoke fixture'}}})});
    assert.equal(profile.status,200);
    const token=await passwordLogin();console.log('PASS live Firebase password login with iOS configuration');
    const handoff=await callable('nativeSessionToken',token,{});if(handoff.status!==200)throw Error('Native session handoff HTTP '+handoff.status+' '+handoff.body.error?.status);assert.equal(handoff.body.result?.uid,uid);assert.ok(handoff.body.result?.customToken);
    const customResponse=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(apiKey),{method:'POST',headers:{'Content-Type':'application/json','X-Ios-Bundle-Identifier':'tr.com.elmago.app'},body:JSON.stringify({token:handoff.body.result.customToken,returnSecureToken:true})});
    const custom=await customResponse.json();assert.equal(customResponse.status,200);assert.equal((await admin.auth(app).verifyIdToken(custom.idToken)).uid,uid);
    console.log('PASS live native/web handoff preserves Firebase UID');
    const forbidden=await callable('deleteMyAccount',custom.idToken,{confirmation:'DELETE',expectedUid:uid});assert.equal(forbidden.body.error?.status,'FAILED_PRECONDITION');
    const wrongUID=await callable('deleteMyAccount',token,{confirmation:'DELETE',expectedUid:'different-fixture'});assert.equal(wrongUID.body.error?.status,'PERMISSION_DENIED');
    console.log('PASS custom-session and mismatched-UID deletion guards');
    const refreshed=await passwordLogin();
    const deleted=await callable('deleteMyAccount',refreshed,{confirmation:'DELETE',expectedUid:uid});
    assert.equal(deleted.status,200);assert.equal(deleted.body.result?.deleted,true);assert.equal(deleted.body.result?.cleanupPending,false);
    await assert.rejects(admin.auth(app).getUser(uid),error=>error.code==='auth/user-not-found');
    const data=await fetch(profileURL,{headers:{Authorization:'Bearer '+access.access_token}});assert.equal(data.status,404);
    console.log('PASS live account deletion confirms Auth removal and related profile cleanup');
    created=false;
  } finally {
    if(created){await admin.auth(app).deleteUser(uid).catch(error=>{if(error.code!=='auth/user-not-found')throw error;});await fetch(profileURL,{method:'DELETE',headers:{Authorization:'Bearer '+access.access_token}});console.log('Isolated smoke fixture removed after incomplete test');}
    await app.delete();
  }
}
main().catch(error=>{console.error('Live account smoke failed: '+(error.code?error.code+': ':'')+error.message);process.exitCode=1;});

