import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import path from 'node:path';import fs from 'node:fs';
const require=createRequire(import.meta.url),load=require('../scripts/lib/load-source.cjs'),root=path.resolve('.');
const P=load(path.join(root,'app/videography/programme.ts')),M=load(path.join(root,'app/videography/media.ts'));
// Walks the adaptive check, always choosing option v (or v(question) when a function).
const answers=v=>{const out=[];for(let q=P.nextQuestion(out);q;q=P.nextQuestion(out))out.push({q:q.id,a:typeof v==='function'?v(q):v});return out};

test('curriculum matches the spreadsheet: 42 modules, 80/144/240 hours, 14 per level',()=>{
 assert.equal(P.curriculumModules.length,42);
 for(const [level,hours] of [['beginner',80],['intermediate',144],['advanced',240]]){const ms=P.modulesFor(level);assert.equal(ms.length,14);assert.equal(ms.reduce((n,m)=>n+m.hours,0),hours);assert.equal(P.rhythm[level].hours,hours)}
 for(const m of P.curriculumModules){for(const f of ['title','outcome','assignment','evidence'])assert.ok(m[f].length>10,m.id+' '+f);assert.ok(m.topics.length>=3,m.id+' topics')}
});

test('module text uses short, simple sentences (20 words or fewer)',()=>{
 for(const m of P.curriculumModules)for(const text of [m.outcome,m.assignment,m.evidence,...m.checks,...m.topics])for(const sentence of text.split(/(?<=[.!?])s+/))assert.ok(sentence.split(/s+/).length<=20,m.id+': '+sentence);
});

test('every module has three assessment checks and becomes a scoreable lesson',()=>{
 for(const m of P.curriculumModules){const l=P.moduleLesson(m);assert.equal(l.checks.length,3,m.id);assert.ok(l.checks.every(c=>c.length>10));assert.equal(l.do,m.assignment)}
 assert.equal(P.videoPaths.length,3);assert.ok(P.videoPaths.every(p=>p.lessons.length===14));
});

test('question bank: start question plus easy, medium and hard questions for every skill area',()=>{
 assert.equal(P.questionCount,12);
 for(const a of P.skillAreas)for(const tier of ['easy','medium','hard'])assert.ok(P.questions.some(q=>q.area===a.id&&q.tier===tier),a.id+' '+tier);
 assert.ok(P.questions.every(q=>q.options.length===4&&q.scores.length===4));
 assert.equal(new Set(P.questions.map(q=>q.id)).size,P.questions.length,'ids are unique');
});

test('adaptive: a brand-new learner only gets easy questions and starts at Beginner',()=>{
 const path=answers(0);assert.equal(path.length,12);
 const tiers=path.slice(1).map(x=>P.questions.find(q=>q.id===x.q).tier);
 assert.ok(tiers.every(t=>t==='easy'),tiers.join(','));
 const r=P.assess(path);assert.equal(r.level,'beginner');assert.equal(r.score,0);
});

test('adaptive: a professional gets hard questions and starts at Advanced',()=>{
 const path=answers(3);
 const tiers=path.slice(1).map(x=>P.questions.find(q=>q.id===x.q).tier);
 assert.ok(tiers.every(t=>t==='hard'),tiers.join(','));
 const r=P.assess(path);assert.equal(r.level,'advanced');assert.ok(Object.values(r.areas).every(v=>v>=95),JSON.stringify(r.areas));
});

test('adaptive: middle answers get medium questions and start at Intermediate',()=>{
 const path=answers(2);
 const tiers=path.slice(1).map(x=>P.questions.find(q=>q.id===x.q).tier);
 assert.ok(tiers.includes('medium'),tiers.join(','));
 assert.equal(P.assess(path).level,'intermediate');
});

test('adaptive: questions get harder after strong answers and easier after weak ones',()=>{
 // Strong start, then weak answers: the check should step down to easy questions.
 const path=answers(q=>q.id==='start'?3:0);
 const tiers=path.map(x=>P.questions.find(q=>q.id===x.q).tier);
 assert.equal(tiers[1],'hard');assert.ok(tiers.slice(-3).every(t=>t==='easy'),tiers.join(','));
 assert.equal(P.assess(path).level,'beginner');
});

test('assessment rejects tampered or incomplete answer lists',()=>{
 const good=answers(1);
 assert.throws(()=>P.assess(good.slice(0,11)));
 const swapped=good.map((x,i)=>i===3?{...x,q:'plan-h2'}:x);assert.throws(()=>P.assess(swapped),/Something went wrong/);
 assert.throws(()=>P.assess(good.map((x,i)=>i===5?{...x,a:7}:x)));
 assert.throws(()=>P.assess([1,2,3]));
 // A high level can't be faked by answering the start question low and the rest high.
 const noFilm=answers(q=>q.id==='start'?0:3);assert.equal(P.assess(noFilm).level,'beginner');
});

test('schedule follows the recommended rhythm and only lets learners add hours',()=>{
 const s=P.schedule('beginner',undefined,'2026-11-02');assert.equal(s.weeks,10);assert.equal(s.hoursPerWeek,8);assert.equal(s.endDate,'2027-01-10');
 assert.equal(P.schedule('beginner',4,'2026-11-02').hoursPerWeek,8,'cannot go below recommended');
 const fast=P.schedule('beginner',16,'2026-11-02');assert.equal(fast.weeks,5);assert.ok(fast.endDate<s.endDate);
 assert.equal(P.schedule('advanced',999).hoursPerWeek,P.maxHoursPerWeek);
 assert.equal(P.schedule('intermediate').weeks,16);
});

test('server-side programme build validates input and recomputes derived values',()=>{
 const today=P.today();
 const p=P.buildProgramme({course:'videography',interests:['wildlife','wedding'],answers:answers(2),hoursPerWeek:12,startDate:P.addDays(today,7),daysPerWeek:6});
 assert.equal(p.level,'intermediate');assert.equal(p.primaryPathway,'Documentary');assert.equal(p.schedule.hoursPerWeek,12);assert.equal(p.schedule.weeks,12);assert.equal(p.mode,null);
 assert.throws(()=>P.buildProgramme({course:'photography',interests:['wedding'],answers:answers(1)}));
 assert.throws(()=>P.buildProgramme({course:'videography',interests:[],answers:answers(1)}));
 assert.throws(()=>P.buildProgramme({course:'videography',interests:['not-real'],answers:answers(1)}));
 const far=P.buildProgramme({course:'videography',interests:['travel'],answers:answers(1),startDate:'2099-01-01'});assert.equal(far.schedule.startDate,today,'out-of-range start falls back to today');
 const updated=P.buildProgramme({...p,mode:'self'},p);assert.deepEqual(updated.assessment,p.assessment,'updates keep the saved assessment');
 // Regression: changing hours after the start date has passed must not reset the start date to today.
 const started={...p,schedule:{...p.schedule,startDate:P.addDays(today,-21)}};const moreHours=P.buildProgramme({...started,hoursPerWeek:14,startDate:started.schedule.startDate},started);assert.equal(moreHours.schedule.startDate,P.addDays(today,-21));assert.equal(moreHours.schedule.hoursPerWeek,14);
 assert.equal(P.buildProgramme({...started,startDate:P.addDays(today,-30)},started).schedule.startDate,today,'a new date in the past is not allowed');assert.equal(updated.mode,'self');assert.equal(updated.createdAt,p.createdAt);
});

test('free tier: assignments only on the first two modules of each level',()=>{
 assert.ok(P.isFreeModule('video-beginner-0'));assert.ok(P.isFreeModule('video-advanced-1'));
 assert.ok(!P.isFreeModule('video-beginner-2'));assert.ok(!P.isFreeModule('video-beginner-13'));
 assert.ok(!P.isFreeModule('video-beginner-14'),'out of range is not a module');assert.ok(!P.isFreeModule('product-reel-0'));
 assert.ok(P.isVideoKey('video-intermediate-13'));assert.ok(!P.isVideoKey('video-expert-0'));
});

test('every module has videos and an existing illustration; pathway modules follow the interest',()=>{
 for(const m of P.curriculumModules){
  const vids=M.videosFor(m.id,'Wedding');assert.ok(vids.length>=1,m.id+' has videos');
  for(const v of vids)assert.ok(v.youtubeId||v.vimeoId,m.id);
  const img=M.moduleImages[m.id];assert.ok(img,m.id+' image');
  for(const w of [480,960,1440])assert.ok(fs.existsSync(path.join(root,'public',img.base+'-'+w+'.webp')),img.base+'-'+w);
 }
 for(const p of P.pathways)assert.ok(M.pathwayVideos[p].length>=2,p);
 assert.notDeepEqual(M.videosFor('B13','Wedding'),M.videosFor('B13','Travel'));
 for(const i of P.interests)assert.ok(P.pathways.includes(i.pathway),i.id);
});

test('course carousel: only Videography is active in phase 1',()=>{
 assert.deepEqual(P.courses.filter(c=>c.active).map(c=>c.id),['videography']);
 for(const name of ['Photography','Filmmaking','Motion Graphics','Gaming'])assert.ok(P.courses.some(c=>c.title.includes(name)),name);
});

test('hand-in: written tasks need an answer; media tasks need a file or link and a note',()=>{
 const textModule=P.curriculumModules.find(m=>m.id==='B02'),mediaModule=P.curriculumModules.find(m=>m.id==='B04');
 assert.equal(textModule.handIn,'text');assert.equal(mediaModule.handIn,'media');
 const base={answer:'',notes:'',url:'',uploadIds:[],ratings:[3,3,3],reflections:{well:'The plan was clear.',change:'Add more close-up shots.'}};
 assert.ok(P.handInMissing(textModule,base).some(x=>x.includes('write your answer')));
 assert.deepEqual(P.handInMissing(textModule,{...base,answer:'x'.repeat(80)}),[],'no upload needed for a written task');
 assert.ok(P.handInMissing(mediaModule,{...base,notes:'I filmed three shots.'}).some(x=>x.includes('upload your work')));
 assert.deepEqual(P.handInMissing(mediaModule,{...base,notes:'I filmed three shots today.',url:'https://example.com/v'}),[]);
 assert.ok(P.handInMissing(mediaModule,{...base,notes:'I filmed three shots today.',uploadIds:['a','b','c','d']}).some(x=>x.includes('up to 3')));
});

test('self-check: beginner modules 1–3 skip it; it starts at beginner module 4 and is always on for higher levels',()=>{
 for(const i of [0,1,2])assert.equal(P.needsSelfCheck('video-beginner-'+i),false,'beginner module '+(i+1));
 for(const i of [3,4,13])assert.equal(P.needsSelfCheck('video-beginner-'+i),true,'beginner module '+(i+1));
 assert.equal(P.needsSelfCheck('video-intermediate-0'),true);assert.equal(P.needsSelfCheck('video-advanced-0'),true);
 const m=P.curriculumModules.find(x=>x.id==='B01');const work={answer:'',notes:'I put six photos in order.',url:'https://example.com/v',uploadIds:[],ratings:[],reflections:{well:'',change:''}};
 assert.deepEqual(P.handInMissing(m,work,false),[],'no ratings or reflections needed when self-check is off');
 assert.ok(P.handInMissing(m,work,true).some(x=>x.includes('rate your work')));
});

test('free plan: only the first two modules of each level have open tasks',()=>{
 for(const level of P.levels){assert.ok(P.isFreeModule('video-'+level+'-0'));assert.ok(P.isFreeModule('video-'+level+'-1'));assert.ok(!P.isFreeModule('video-'+level+'-2'))}
});
