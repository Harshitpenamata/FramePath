import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),Module=require('node:module'),resolve=Module._resolveFilename;
// session.ts imports the Workers env; give it a stand-in so the pure helpers load in Node.
Module._resolveFilename=function(r,...a){return r==='cloudflare:workers'?path.resolve('tests/workers-stub.cjs'):resolve.call(this,r,...a)};
const {safeReturnTo}=require('../scripts/lib/load-source.cjs')(path.resolve('app/session.ts'));

test('sign-in and sign-out return paths never leave the site', ()=>{
 for(const bad of ['/.//evil.com','/a/..//evil.com','/%2e//evil.com','//evil.com','https://evil.com','evil.com','/auth/google'])
  assert.equal(safeReturnTo(bad),'/',bad);
 assert.equal(safeReturnTo('/workspace?x=1#y'),'/workspace?x=1#y');
 assert.equal(safeReturnTo('/./workspace'),'/workspace');
});
