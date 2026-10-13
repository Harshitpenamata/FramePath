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
 for(const m of P.curriculumModules)for(const text of [m.outcome,m.assignment,m.evidence,...m.checks,...m.topics])for(const sentence of text.split(/(?<=[.!?])\s+/))assert.ok(sentence.split(/\s+/).length<=20,m.id+': '+sentence);
});

test('every module has three assessment checks and becomes a scoreable lesson',()=>{
 for(const m of P.curriculumModules){const l=P.moduleLesson(m);assert.equal(l.checks.length,3,m.id);assert.ok(l.checks.every(c=>c.length>10));assert.equal(l.do,m.assignment)}
 assert.equal(P.videoPaths.length,3);assert.ok(P.videoPaths.every(p=>p.lessons.length===14));
});

const best=q=>q.options.reduce((b,o,i,a)=>o.score>a[b].score?i:b,0),worst=q=>q.options.reduce((b,o,i,a)=>o.score<a[b].score?i:b,0);
const notSure=q=>q.options.findIndex(o=>o.text==='Not sure');
const mid=q=>q.kind==='check'?0:q.tier==='start'?2:Math.min(2,q.options.length-1);
test('question bank: habit and skill-check questions at every tier for every skill area',()=>{
 assert.equal(P.questionCount,12);
 for(const a of P.skillAreas)for(const kind of ['habit','check'])for(const tier of ['easy','medium','hard'])assert.ok(P.questions.some(q=>q.area===a.id&&q.kind===kind&&q.tier===tier),a.id+' '+kind+' '+tier);
 assert.equal(new Set(P.questions.map(q=>q.id)).size,P.questions.length,'ids are unique');
 for(const q of P.questions.filter(q=>q.kind==='check')){assert.equal(q.options[0].score,Math.max(...q.options.map(o=>o.score)),q.id+' right answer is first in data');assert.ok(notSure(q)>0,q.id+' has Not sure')}
 for(const q of P.questions)for(const o of q.options)for(const sentence of [q.prompt,o.text])assert.ok(sentence.split(/\s+/).length<=20,q.id);
});

test('answer order is shuffled per learner, with "Not sure" kept last',()=>{
 const q=P.questions.find(q=>q.id==='cam-cm');
 const orders=['a','b','c','d','e','f'].map(seed=>P.optionOrder(q,seed));
 for(const o of orders){assert.deepEqual([...o].sort(),[0,1,2,3]);assert.equal(o[o.length-1],notSure(q))}
 assert.ok(new Set(orders.map(o=>o.join())).size>1,'different learners see different orders');
 assert.ok(orders.some(o=>o[0]!==0),'the right answer is not always first');
});

test('adaptive: a brand-new learner gets easy questions and starts at Beginner',()=>{
 const path=answers(worst);assert.equal(path.length,12);
 assert.ok(path.slice(1).every(x=>P.questions.find(q=>q.id===x.q).tier==='easy'));
 const r=P.assess(path);assert.equal(r.level,'beginner');assert.equal(r.checks.right,0);
});

test('adaptive: a real professional gets hard questions and starts at Advanced',()=>{
 const path=answers(best);
 assert.ok(path.slice(1).every(x=>P.questions.find(q=>q.id===x.q).tier==='hard'));
 const r=P.assess(path);assert.equal(r.level,'advanced');assert.equal(r.checks.right,6);
});

test('claiming pro habits but missing the skill checks does not give Advanced',()=>{
 const bluff=answers(q=>q.kind==='check'?notSure(q):best(q));
 const r=P.assess(bluff);assert.notEqual(r.level,'advanced');
 assert.ok(Object.values(r.areas).every(v=>v<70),JSON.stringify(r.areas));
 const guess=answers(q=>q.kind==='check'?1:best(q));assert.notEqual(P.assess(guess).level,'advanced');
});

test('adaptive: some experience and correct checks start at Intermediate',()=>{
 const path=answers(mid);
 assert.equal(P.assess(path).level,'intermediate',JSON.stringify(P.assess(path)));
});

test('adaptive: questions get easier after weak answers',()=>{
 const path=answers(q=>q.id==='start'?best(q):worst(q));
 const tiers=path.map(x=>P.questions.find(q=>q.id===x.q).tier);
 assert.equal(tiers[1],'hard');assert.ok(tiers.slice(-3).every(t=>t==='easy'),tiers.join(','));
 assert.equal(P.assess(path).level,'beginner');
});

test('assessment rejects tampered or incomplete answer lists',()=>{
 const good=answers(best);
 assert.throws(()=>P.assess(good.slice(0,11)));
 const swapped=good.map((x,i)=>i===3?{...x,q:'plan-hm'}:x);assert.throws(()=>P.assess(swapped),/Something went wrong/);
 assert.throws(()=>P.assess(good.map((x,i)=>i===5?{...x,a:7}:x)));
 assert.throws(()=>P.assess([1,2,3]));
 const noFilm=answers(q=>q.id==='start'?worst(q):best(q));assert.equal(P.assess(noFilm).level,'beginner');
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
 const p=P.buildProgramme({course:'videography',interests:['wildlife','wedding'],answers:answers(mid),hoursPerWeek:12,startDate:P.addDays(today,7),daysPerWeek:6});
 assert.equal(p.level,'intermediate');assert.equal(p.primaryPathway,'Documentary');assert.equal(p.schedule.hoursPerWeek,12);assert.equal(p.schedule.weeks,12);assert.equal(p.mode,null);
 assert.throws(()=>P.buildProgramme({course:'photography',interests:['wedding'],answers:answers(best)}));
 assert.throws(()=>P.buildProgramme({course:'videography',interests:[],answers:answers(best)}));
 assert.throws(()=>P.buildProgramme({course:'videography',interests:['not-real'],answers:answers(best)}));
 const far=P.buildProgramme({course:'videography',interests:['travel'],answers:answers(best),startDate:'2099-01-01'});assert.equal(far.schedule.startDate,today,'out-of-range start falls back to today');
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
  for(const v of vids)assert.ok(v.youtubeId||v.vimeoId||/^https:/.test(v.url),m.id);
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

const Les=load(path.join(root,'app/videography/lessons.ts'));
test('every module: one lesson per topic, each with an idea and a working tool',()=>{
 for(const m of P.curriculumModules){
  const ls=Les.lessonsFor(m.id);assert.equal(ls.length,m.topics.length,m.id);
  ls.forEach((l,i)=>{assert.equal(l.title,m.topics[i],m.id+' lesson '+(i+1));assert.ok(l.idea.length>20);
   for(const sentence of l.idea.split(/(?<=[.!?])\s+/))assert.ok(sentence.split(/\s+/).length<=20,m.id+': '+sentence);
   const t=l.tool;assert.ok(t.prompt.length>10);
   if(t.kind==='order')assert.ok(t.items.length>=3&&new Set(t.items).size===t.items.length);
   if(t.kind==='sort'){assert.ok(t.groups.length>=2);assert.ok(t.items.every(([,g])=>g>=0&&g<t.groups.length));assert.ok(t.groups.every((_,g)=>t.items.some(([,x])=>x===g)),m.id+' empty group')}
   if(t.kind==='pick')assert.equal(t.options.filter(o=>o[1]).length,1,m.id+' pick needs one right answer');
   if(t.kind==='spot')assert.ok(t.items.some(x=>x[1])&&t.items.some(x=>!x[1]),m.id+' spot');
  });
 }
 assert.ok(Les.lessonVideos('B13',0,'Wedding')[0].title.length>5);
});

test('B01 starts with the Philipp Humm storytelling video, then Directing Without Words',()=>{
 const vs=M.moduleVideos.B01;assert.equal(vs[0].youtubeId,'hNuAv-42jzY');assert.equal(vs[1].youtubeId,'WMcWLFtGnAs');
 assert.deepEqual(Les.lessonVideos('B01',0,'Wedding').slice(0,2).map(v=>v.youtubeId),['hNuAv-42jzY','WMcWLFtGnAs']);
});

test('every task has a short name, and every style has an outcome',()=>{
 for(const m of P.curriculumModules)assert.ok(m.taskName&&m.taskName.length<=32,m.id);
 assert.equal(new Set(P.curriculumModules.map(m=>m.taskName)).size,42);
 for(const p of P.pathways)assert.ok(P.pathwayOutcomes[p].length>20,p);
 for(const l of P.levels)assert.ok(P.finalProject[l].length>10);
});

test('every lesson has its sketchbook clip and poster',()=>{
 for(const m of P.curriculumModules)Les.lessonsFor(m.id).forEach((_,i)=>{for(const ext of ['mp4','webp']){const f=path.join(root,'public/sketches',`${m.id}-${i+1}.${ext}`);assert.ok(fs.existsSync(f),f);assert.ok(fs.statSync(f).size<300000,f+' is too big')}});
});

test('video library: every row is used on a lesson, and every module has library videos',()=>{
 const used=new Set();
 for(const m of P.curriculumModules){
  const refs=Les.lessonVideoRefs[m.id];assert.equal(refs.length,Les.lessonsFor(m.id).length,m.id+' one video list per lesson');
  for(const ref of refs.flat()){if(ref.startsWith('lib:')){const id=ref.slice(4).split('@')[0];assert.ok(M.videoLibrary.some(v=>v.id===id),ref);used.add(id)}else if(ref!=='path')assert.ok(ref.startsWith('pathway')||M.V[ref],m.id+' '+ref)}
 }
 for(const v of M.videoLibrary)if(!v.module.endsWith('13'))assert.ok(used.has(v.id),v.id+' '+v.title+' is not on any lesson');
 for(const m of P.curriculumModules)assert.ok(M.videosFor(m.id,'Wedding').length>0,m.id);
 for(const p of P.pathways)for(const lv of ['B13','I13','A13'])assert.ok(M.pathwayLibrary(lv,p).length>0,lv+' '+p);
 for(const v of M.videoLibrary){assert.ok(v.youtubeId||/^https:\/\//.test(v.url),v.id);assert.ok(v.title&&v.creator,v.id)}
 const timed=Les.lessonVideos('B05',2,'Wedding')[0];assert.equal(timed.start,417);
});

test('a lesson is finished only when every video is watched and the tool is solved',()=>{
 const needs=Les.lessonNeeds('B01',0,'Wedding');assert.ok(needs.length>=2,'B01 lesson 1 has several videos');
 assert.equal(Les.lessonFinished('B01',0,'Wedding',undefined),false);
 assert.equal(Les.lessonFinished('B01',0,'Wedding',{v:needs,t:false}),false,'tool not solved');
 assert.equal(Les.lessonFinished('B01',0,'Wedding',{v:needs.slice(1),t:true}),false,'a video not watched');
 assert.equal(Les.lessonFinished('B01',0,'Wedding',{v:needs,t:true}),true);
 const noVideo=P.modulesFor('beginner').flatMap(m=>Les.lessonsFor(m.id).map((_,i)=>[m.id,i])).find(([id,i])=>Les.lessonNeeds(id,i,'Wedding').length===0);
 assert.ok(noVideo,'some lessons have no video');assert.equal(Les.lessonFinished(noVideo[0],noVideo[1],'Wedding',{v:[],t:true}),true,'tool alone finishes a lesson with no video');
 const marks=Object.fromEntries(Les.lessonsFor('B02').map((_,i)=>[i,{v:Les.lessonNeeds('B02',i,'Wedding'),t:true}]));
 assert.deepEqual(Les.lessonsStatus('B02','Wedding',marks),{total:5,done:5,finished:[true,true,true,true,true]});
 delete marks[2];assert.equal(Les.lessonsStatus('B02','Wedding',marks).done,4);
 assert.ok(Les.lessonNeeds('B13',0,'Wedding').join()!==Les.lessonNeeds('B13',0,'Travel').join(),'style lessons follow the learner’s pathway');
});

test('Reflect: every lesson has 2 or 3 sound questions about the lesson or its videos',()=>{
 const Les=load(path.join(root,'app/videography/lessons.ts'));
 const bank=Object.assign({},...['beginner','intermediate','advanced'].map(l=>JSON.parse(fs.readFileSync(path.join(root,'app/videography/reflect/'+l+'.json'),'utf8'))));
 // Beginner is complete; other modules are checked once drafted (until then they keep their earlier tool).
 for(const [id,lessons] of Object.entries(Les.moduleLessons)){
  if(!bank[id]){assert.ok(!id.startsWith('B'),id+': Beginner needs questions');continue}
  assert.equal(bank[id].length,lessons.length,id+': one question set per lesson');
  bank[id].forEach((qs,i)=>{
   assert.ok(qs.length>=2&&qs.length<=3,id+' lesson '+(i+1)+': 2 or 3 questions');
   for(const q of qs){
    assert.ok(q.q.length>15&&q.why.length>10,id+': question and explanation are written');
    assert.equal(q.options.length,3,id+': three answers');
    assert.equal(new Set(q.options.map(o=>o[0])).size,3,id+': answers differ');
    for(const [text,feedback] of q.options.slice(1))assert.ok(text&&feedback,id+': wrong answers have feedback');
    assert.ok(!q.options.some(o=>/(all|none) of the above/i.test(o[0])),id+': no all/none of the above');
    // The right answer must not stand out by length.
    const lens=q.options.map(o=>o[0].length),others=Math.max(...lens.slice(1));
    assert.ok(lens[0]<=others*1.6+10,id+': right answer is not much longer than the others: '+q.q);
    // It must not repeat the lesson's idea (which the sketch draws).
    assert.ok(!lessons[i].idea.toLowerCase().includes(q.options[0][0].toLowerCase().replace(/\.$/,'')),id+': answer is not the idea sentence');
   }
  });
 }
});
