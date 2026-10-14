// Drafts the Reflect questions for every lesson with Claude, then has Claude check each module's set.
// Output: app/videography/reflect/<level>.json  { moduleId: [ lessonQuestions[] ] }, each question
// { q, options: [[text, feedback], ...] (the right answer first; the page shuffles them), why, video }.
// Usage: node scripts/draft-reflect-questions.cjs [B01 I05 ...]   (no ids = every module; existing modules are kept)
const fs=require('fs'),path=require('path');
const load=require('./lib/load-source.cjs');
const Les=load(path.resolve('app/videography/lessons.ts'));
const Anthropic=require('@anthropic-ai/sdk').default;
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>[l.slice(0,l.indexOf('=')),l.slice(l.indexOf('=')+1).trim()]));
const client=new Anthropic({apiKey:env.ANTHROPIC_API_KEY,maxRetries:3,timeout:300000});
const levelOf={B:'beginner',I:'intermediate',A:'advanced'};
const outFile=l=>path.resolve('app/videography/reflect/'+l+'.json');

const question={type:'object',additionalProperties:false,required:['kind','q','right','wrong','why','video'],properties:{
 kind:{type:'string',enum:['applied','video']},
 q:{type:'string',description:'The question. One or two short sentences.'},
 right:{type:'string',description:'The one right answer.'},
 wrong:{type:'array',description:'Exactly two wrong answers, each with feedback.',items:{type:'object',additionalProperties:false,required:['text','feedback'],properties:{text:{type:'string'},feedback:{type:'string',description:'One sentence: why this is not the best answer.'}}}},
 why:{type:'string',description:'One or two sentences shown after the right answer: why it is right.'},
 video:{type:'string',description:'For a video question, the exact title of the video it draws on. Empty for an applied question.'}}};
const schema={type:'object',additionalProperties:false,required:['lessons'],properties:{lessons:{type:'array',description:'One entry per lesson, in order.',items:{type:'object',additionalProperties:false,required:['questions'],properties:{questions:{type:'array',description:'2 or 3 questions.',items:question}}}}}};

const rules=`You write the "Reflect" questions for lessons in Framepath, a videography course for adults in India learning on their own.
Each lesson has a title, a one-line idea, and videos with notes on what to watch for and why. Under the title and idea, the page shows a looping sketch that draws the idea.
For each lesson write 2 or 3 multiple-choice questions:
- One "applied" question: a short, concrete situation a learner could face on a real shoot or edit (Indian settings are welcome: a family function, a street market, a small business, a phone shoot). The learner picks what they would do.
- One or two "video" questions built on what the lesson's videos teach (use the notes on what to watch for and why). Name the video in "video". If a lesson has no videos, write two applied questions instead. If the videos depend on the learner's style, keep the video question about the general skill.
Rules:
- The answer must NOT be given away by the lesson title, the idea sentence or the sketch. Don't reuse the idea's words in the right answer. A learner should have to think about the situation or remember the video.
- Exactly one answer is clearly right to a working videographer. Wrong answers are believable mistakes beginners really make, not jokes.
- Keep all three answers about the same length and in the same style, so length doesn't give the answer away. Never use "all of the above" or "none of the above".
- Plain, simple English: short sentences, everyday words. Explain any technical term the first time. No em dashes.
- Match the level: Beginner (phone or first camera, basic ideas), Intermediate (manual settings, planning, clients), Advanced (professional workflow, judgement under pressure).`;

function lessonText(id){
 return Les.lessonsFor(id).map((l,i)=>{
  const refs=Les.lessonVideoRefs[id]?.[i]||[],styled=refs.some(r=>r==='path'||r.startsWith('pathway'));
  const vids=Les.lessonVideos(id,i,'Wedding').map(v=>`  - "${v.title}" by ${v.creator}${v.section?' (section: '+v.section+')':''}. Watch for: ${v.focus}`);
  return `Lesson ${i+1}: ${l.title}\nIdea: ${l.idea}\nOld practice activity (for content only, don't copy it): ${JSON.stringify(l.tool)}\n${vids.length?'Videos'+(styled?' (these depend on the learner\'s style; this is the Wedding example)':'')+':\n'+vids.join('\n'):'Videos: none'}`;
 }).join('\n\n');
}
async function ask(system,text){
 const r=await client.beta.messages.create({model:'claude-opus-5-5',max_tokens:32000,betas:['server-side-fallback-2026-07-01'],fallbacks:'default',system,thinking:{type:'adaptive'},output_config:{effort:'medium',format:{type:'json_schema',schema}},messages:[{role:'user',content:text}]});
 if(r.stop_reason!=='end_turn')throw new Error('stopped: '+r.stop_reason);
 return JSON.parse(r.content.filter(b=>b.type==='text').map(b=>b.text).join(''));
}
async function draftModule(id){
 const lessons=Les.lessonsFor(id),level=levelOf[id[0]];
 const brief=`Level: ${level}. Module ${id}.\n\n${lessonText(id)}`;
 const draft=await ask(rules,`${brief}\n\nWrite the questions for all ${lessons.length} lessons.`);
 // Second pass: Claude checks the set against the rules and returns a corrected version.
 const checked=await ask(rules+`\n\nYou are now the reviewer. Check every question: Is exactly one answer right? Could a learner answer it from the title, idea or sketch alone? Do lengths or wording give it away? Is it plain English? Is the video named correctly? Return the full set, fixing or replacing any question that fails.`,
  `${brief}\n\nDraft questions:\n${JSON.stringify(draft)}`);
 if(checked.lessons.length!==lessons.length)throw new Error(id+': expected '+lessons.length+' lessons, got '+checked.lessons.length);
 return checked.lessons.map(l=>l.questions.slice(0,3).map(q=>({q:q.q,options:[[q.right,''],...q.wrong.slice(0,2).map(w=>[w.text,w.feedback])],why:q.why,video:q.kind==='video'?q.video:''})));
}
(async()=>{
 const wanted=process.argv.slice(2),ids=Object.keys(Les.moduleLessons).filter(id=>!wanted.length||wanted.includes(id));
 const data={beginner:{},intermediate:{},advanced:{}};
 for(const l of Object.keys(data))if(fs.existsSync(outFile(l)))data[l]=JSON.parse(fs.readFileSync(outFile(l),'utf8'));
 fs.mkdirSync(path.dirname(outFile('beginner')),{recursive:true});
 const queue=[...ids];let failed=0;
 const save=()=>{for(const l of Object.keys(data)){const sorted=Object.fromEntries(Object.entries(data[l]).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true})));fs.writeFileSync(outFile(l),JSON.stringify(sorted,null,1)+'\n')}};
 await Promise.all(Array.from({length:6},async()=>{for(let id;(id=queue.shift());){try{data[levelOf[id[0]]][id]=await draftModule(id);save();console.log('done',id)}catch(e){failed++;console.error('FAILED',id,e.message)}}}));
 console.log(failed?failed+' modules failed':'all modules drafted');process.exit(failed?1:0);
})();
