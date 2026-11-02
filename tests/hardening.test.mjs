import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),Module=require('node:module'),resolve=Module._resolveFilename;
// session.ts reads the Workers env; a stand-in secret lets the signing helpers run in Node.
Module._resolveFilename=function(r,...a){return r==='cloudflare:workers'?path.resolve('tests/workers-env-stub.cjs'):resolve.call(this,r,...a)};
const S=require('../scripts/lib/load-source.cjs')(path.resolve('app/session.ts'));
const exp=()=>Math.floor(Date.now()/1000)+600;

test('only a real session signs a learner in', async()=>{
 const session=await S.createSession({userId:'google:1',email:'a@example.test',fullName:'A'});
 assert.equal((await S.readSession(session))?.userId,'google:1');
 // Older sessions (no typ) still work.
 assert.equal((await S.readSession(await S.sign({userId:'google:1',email:'a@example.test',fullName:null,exp:exp()})))?.userId,'google:1');
 // Other signed tokens don't: the sign-in flow cookie and unsubscribe links.
 assert.equal(await S.readSession(await S.sign({state:'s',verifier:'v',nonce:'n',returnTo:'/',exp:exp()})),null);
 assert.equal(await S.readSession(await S.sign({u:'google:1',p:'unsub',exp:exp()})),null);
 assert.equal(await S.readSession(await S.sign({userId:'google:1',email:'a@example.test',typ:'flow',exp:exp()})),null);
});
