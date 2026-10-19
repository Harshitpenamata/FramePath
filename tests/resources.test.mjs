import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import path from 'node:path';
const require=createRequire(import.meta.url),load=require('../scripts/lib/load-source.cjs');
const {learningResources:R}=load(path.resolve('app/learning-resources.ts'));
// The Resources page shows a resource for a level when its levels include that level.
const forLevel=l=>R.filter(r=>r.levels?.includes(l)),forDevice=d=>R.filter(r=>r.devices?.includes(d));

test('audit F02: "Intermediate / advanced" resources show under Intermediate and Advanced',()=>{
 const both=R.filter(r=>/intermediate/i.test(r.level)&&/advanced/i.test(r.level));
 assert.ok(both.length>=11,'the 11 Blackmagic resources are labelled Intermediate / advanced');
 for(const r of both){assert.ok(forLevel('intermediate').includes(r),r.id+' intermediate');assert.ok(forLevel('advanced').includes(r),r.id+' advanced')}
});

test('device filter: Android hides iPhone-only and Mac-only guides',()=>{
 const android=forDevice('android').map(r=>r.id);
 for(const id of ['imovie-phone','imovie-mac','iphone-screen','phone-video'])assert.ok(!android.includes(id),id);
 assert.deepEqual(R.find(r=>r.id==='imovie-phone').devices,['ios']);
 assert.deepEqual(R.find(r=>r.id==='imovie-mac').devices,['desktop']);
 assert.ok(android.includes('android-screen'));
});
