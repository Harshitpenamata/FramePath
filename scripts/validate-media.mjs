import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {validateMedia,canonical} from './lib/media-validation.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url),load=require('./lib/load-source.cjs');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const foundation=read('media/foundation-registry.json'),budgets=read('media/performance-budgets.json');
const scoped=process.argv.includes('--foundation')||process.argv.includes('--onboarding')||process.argv.includes('--lessons');
const onboarding=read('media/onboarding-registry.json');
const lessons=read('media/lessons-registry.json');
const inventory={assets:[...foundation.assets,...onboarding.assets,...lessons.assets],slots:[...foundation.slots,...onboarding.slots,...lessons.slots],videos:[...foundation.videos,...onboarding.videos,...lessons.videos]};
const extraErrors=[];
const Ajv=require('ajv/dist/2020').default,checkSchema=new Ajv({strict:false}).compile(read('media/registry.schema.json'));if(!checkSchema(lessons))extraErrors.push({code:'lesson-registry-schema',details:checkSchema.errors});if(!checkSchema(onboarding))extraErrors.push({code:'onboarding-registry-schema',details:checkSchema.errors});if(!checkSchema(foundation))extraErrors.push({code:'registry-schema',details:checkSchema.errors});
for(const a of inventory.assets)for(const r of a.renditions?.length?a.renditions:[{src:a.canonicalUrl,bytes:a.bytes,sha256:a.sha256}]){const file=path.join(root,'public',r.src);if(!fs.existsSync(file)){extraErrors.push({code:'missing-file',id:a.id,file:r.src});continue;}const b=fs.readFileSync(file);if(hash(b)!==r.sha256||b.length!==r.bytes)extraErrors.push({code:'file-integrity',id:a.id,file:r.src});const limit=a.kind==='audio'?budgets.foundationAudioBytes:budgets.foundationImageRenditionBytes;if(b.length>limit)extraErrors.push({code:'asset-budget-exceeded',file:r.src,bytes:b.length,limit});}
const bank=load(path.join(root,'app/onboarding/question-bank.ts'));for(const a of onboarding.assets.filter(a=>a.kind==='image')){const uses=bank.questionBank.filter(i=>'fp-diagnostic-'+i.image===a.id);if(uses.length!==1||a.ownerSlot!=='diagnostic:'+uses[0]?.id+':image')extraErrors.push({code:'diagnostic-image-ownership',id:a.id});}
const interactiveSource=fs.readFileSync(path.join(root,'app/foundation/interactives.tsx'),'utf8').replaceAll('\r\n','\n');
const imageUsages=[...interactiveSource.matchAll(/<MediaImage id="([^"]+)"/g)].map(m=>m[1]);
for(const id of imageUsages)if(!foundation.assets.find(a=>a.id===id))extraErrors.push({code:'unregistered-component-image',id});
if(new Set(imageUsages).size!==imageUsages.length)extraErrors.push({code:'repeated-component-image'});
const declared=new Set(foundation.assets.flatMap(a=>[a.canonicalUrl,...a.renditions.map(r=>r.src)]));
for(const name of fs.readdirSync(path.join(root,'public/foundation')))if(!declared.has('/foundation/'+name))extraErrors.push({code:'unregistered-foundation-file',file:name});
const diagrams=read('media/diagram-registry.json');
for(const d of diagrams){const start=interactiveSource.indexOf('function '+d.component+'('),end=interactiveSource.indexOf('\n}',start);const source=interactiveSource.slice(start,end<0?undefined:end+2).split('\n\n')[0];if(start<0||hash(source)!==d.sha256)extraErrors.push({code:'diagram-review-required',id:d.id});}
if(!scoped){
 const shared=read('media/shared-registry.json'),clips=read('media/shared-videos.json');
 inventory.assets.push(...shared.assets);inventory.slots.push(...shared.slots);inventory.videos.push(...clips);
 if(!checkSchema(shared))extraErrors.push({code:'shared-registry-schema',details:checkSchema.errors});
 for(const a of shared.assets)for(const r of a.renditions){const file=path.join(root,'public',r.src);if(!fs.existsSync(file)||hash(fs.readFileSync(file))!==r.sha256)extraErrors.push({code:'shared-image-integrity',id:a.id,src:r.src});else if(fs.statSync(file).size>budgets.foundationImageRenditionBytes)extraErrors.push({code:'shared-image-budget',id:a.id});}
 const content=load(path.join(root,'app/lessons/content.ts')),sharedData=load(path.join(root,'app/lessons/shared.ts')),specs=load(path.join(root,'app/lessons/lab-specs.ts')).labSpecs,engine=load(path.join(root,'app/scenario-engine.ts'));
 const clipHashes=new Map();for(const v of clips){const file=path.join(root,'public',v.url),caption=path.join(root,'public',v.captions);if(!fs.existsSync(file)||hash(fs.readFileSync(file))!==v.sha256)extraErrors.push({code:'shared-video-integrity',id:v.videoId});if(!fs.existsSync(caption)||!fs.readFileSync(caption,'utf8').startsWith('WEBVTT'))extraErrors.push({code:'missing-captions',id:v.videoId});if(v.bytes>300000)extraErrors.push({code:'shared-video-budget',id:v.videoId});if(clipHashes.has(v.sha256))extraErrors.push({code:'duplicate-video-file',ids:[clipHashes.get(v.sha256),v.videoId]});clipHashes.set(v.sha256,v.videoId);}
 // Routes reference canonical units; they do not create new media placements.
 // The fixed authored projects keep their previous, individually owned media.
 const bindings=[];for(const c of engine.scenarios)for(const stage of engine.stages){const id='need-'+c.id.toLowerCase()+'-'+stage,p=engine.scenarioPath(id);for(const key of p.keys){const l=content.visualLesson(key);if(!l)extraErrors.push({code:'unconverted-route',key});else if(l.canonicalModule)bindings.push({key,unit:l.canonicalModule});}}
 for(const p of sharedData.sharedPaths)for(const key of p.keys){const l=content.visualLesson(key);if(!l)extraErrors.push({code:'unconverted-skill',key});else bindings.push({key,unit:l.canonicalModule});}
 for(const [id,u] of Object.entries(sharedData.sharedUnits)){if(!specs[u.family])extraErrors.push({code:'missing-interactive',id});if(clips.filter(v=>v.videoId===id).length!==1)extraErrors.push({code:'missing-canonical-video',id});if(u.archetype){const a=shared.assets.find(a=>a.id==='fp-shared-'+u.archetype);if(!a||a.ownerSlot!=='module:'+id+':hook')extraErrors.push({code:'shared-image-owner',id});}}
 for(const b of bindings)if(!sharedData.sharedUnits[b.unit])extraErrors.push({code:'broken-unit-reference',...b});
 const router=fs.readFileSync(path.join(root,'app/framepath.tsx'),'utf8');if(!router.includes('isSharedPath(parts[1])')||router.includes('<BeginnerSession')||router.includes('<BeginnerWeek'))extraErrors.push({code:'retired-selfpaced-route-reachable'});
 const resourcePlayer=fs.readFileSync(path.join(root,'app/resource-player.tsx'),'utf8');if(resourcePlayer.includes('<iframe')||resourcePlayer.includes('<img'))extraErrors.push({code:'optional-resource-clones-owned-media'});
}

const lessonData=load(path.join(root,'app/lessons/content.ts')),videoData=load(path.join(root,'app/lessons/videos.ts'));
const lessonFiles=new Set(lessons.assets.flatMap(a=>[a.canonicalUrl,...a.renditions.map(r=>r.src)]));for(const name of fs.readdirSync(path.join(root,'public/lessons')))if(!lessonFiles.has('/lessons/'+name))extraErrors.push({code:'unregistered-lesson-file',file:name});
for(const l of lessonData.visualLessons){for(const [name,slot] of [[l.image,l.key+':hook'],...(l.activity.image?[[l.activity.image,l.key+':activity-photo']]:[])]){const a=lessons.assets.find(a=>a.id==='fp-lesson-'+name);if(!a||a.ownerSlot!==slot)extraErrors.push({code:'lesson-image-ownership',key:l.key,id:name});}const v=videoData.lessonVideos[l.key],r=lessons.videos.find(v=>v.slot===l.key+':video');if(!v||!r||v.id!==r.videoId||v.start!==r.start||v.end!==r.end||v.end-v.start>240)extraErrors.push({code:'lesson-video-unverified',key:l.key});}
for(const l of lessonData.visualLessons.filter(l=>l.activity.kind==='audio'))for(const variant of ['quiet','noisy']){const url='/lessons/'+(l.activity.audioPrefix||'story-audio')+'-'+variant+'.wav',a=lessons.assets.find(a=>a.canonicalUrl===url);if(!a||a.ownerSlot!==l.key+':audio-'+variant)extraErrors.push({code:'lesson-audio-ownership',key:l.key,url});}
const result=validateMedia(inventory);result.errors.push(...extraErrors);result.passed=result.errors.length===0;result.scope=scoped?'reviewed foundation + onboarding + visual lesson batches ONLY':'whole published curriculum: canonical modules + authored projects; route references are not cloned media placements';result.functionalDiagrams=diagrams.length;result.timestamp=new Date().toISOString();
const output=process.argv.find(x=>x.startsWith('--report='))?.slice(9);if(output){fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2));}
const counts={};for(const e of result.errors)counts[e.code]=(counts[e.code]||0)+1;
console.log(JSON.stringify({scope:result.scope,passed:result.passed,assets:result.assets,slots:result.slots,videos:result.videos,functionalDiagrams:result.functionalDiagrams,errorGroups:counts,nearDuplicates:result.warnings.length},null,2));
if(!result.passed){console.error('Publication blocked. Fix the published curriculum or its registered media before releasing. Historical files are retained but retired from self-paced routes.');process.exitCode=1;}
