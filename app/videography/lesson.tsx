'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowUp,ArrowLeft,ArrowRight,ChevronDown,BookOpen,ThumbsUp,ThumbsDown,Check,Clapperboard,Clock,FileText,Flag,LockKeyhole,MessageCircle,RotateCcw,Sparkles,Upload,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import './lesson.css';
import {useLearning,Go,Action,Panel,Badge,Gate,UploadField} from '../ui';
import {blockingModule,moduleHref,moduleInfo} from '../learning-rules';
import {partsFor,partDone,type TaskPart,type PartsData} from './task-parts';
import {parseVideoKey,moduleLesson,projectLabel,modulesFor,moduleKey,ratingScale,reflectionQuestions,maxHandInFiles,handInMissing,needsSelfCheck,type HandIn,plansOf,planTitle,maxPlans} from './programme';
import {LessonsTab,LessonSketch,PathwayStrip,canPractise,taskLabel,useDeadVideos} from './module-context';
import {taskFaq,noGear} from './task-faq';
import {waitingTips,lessonsFor,lessonsStatus,requireLessonsForTask} from './lessons';
import {LevelClosure} from './closure';
import {ReportProblem} from '../support';
import {track} from '../track';

type FileRef={id:string;name:string;type:string};
type Draft={answer:string;notes:string;url:string;files:FileRef[];ratings:number[];reflections:{well:string;change:string};text:Record<string,string>;partFiles:Record<string,FileRef[]>};
const emptyDraft=():Draft=>({answer:'',notes:'',url:'',files:[],ratings:[-1,-1,-1],reflections:{well:'',change:''},text:{},partFiles:{}});
const draftKey=(key:string)=>'fp-handin-'+key;
function readDraft(key:string):Draft{try{const d=JSON.parse(localStorage.getItem(draftKey(key))||'null');if(d)return {...emptyDraft(),...d}}catch{}return emptyDraft()}
function writeDraft(key:string,d:Draft){try{localStorage.setItem(draftKey(key),JSON.stringify(d))}catch{}}
// A module with task parts hands in each part separately; the server writes the text parts into the answer.
const toHandIn=(d:Draft,moduleId?:string):HandIn=>{
 const list=moduleId?partsFor(moduleId):[];
 if(!list.length)return {answer:d.answer,notes:d.notes,url:d.url,uploadIds:d.files.map(f=>f.id),ratings:d.ratings,reflections:d.reflections};
 const files=Object.fromEntries(list.filter(x=>x.kind==='media').map(x=>[x.id,(d.partFiles[x.id]||[]).map(f=>f.id)]));
 return {answer:'',notes:d.notes,url:d.url,uploadIds:[...new Set(Object.values(files).flat())],ratings:d.ratings,reflections:d.reflections,parts:{text:d.text,files}};
};

// A Videography module: Lessons (Watch + Reflect each), then the Task (hand in), then Feedback (AI review).
// The last module of a level also has Finish, which closes the level.
const oldTabs:Record<string,string>={watch:'lessons',make:'task',reflect:'feedback'};
// A green arrow in the bottom-right corner: it points down while there is more page below (and scrolls one screen),
// and turns into "Back to top" at the bottom. Hidden when the page fits on one screen.
function ScrollCue(){
 const [state,setState]=useState<'down'|'top'|'none'>('none');
 useEffect(()=>{const check=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setState(max<40?'none':window.scrollY>=max-24?'top':'down')};
  check();window.addEventListener('scroll',check,{passive:true});window.addEventListener('resize',check);const t=setInterval(check,1000);
  return ()=>{window.removeEventListener('scroll',check);window.removeEventListener('resize',check);clearInterval(t)}},[]);
 if(state==='none')return null;
 const top=state==='top';
 return <button type="button" className={'scroll-cue'+(top?' top':'')} aria-label={top?'Back to the top of the page':'Scroll down for more'} onClick={()=>window.scrollTo({top:top?0:window.scrollY+window.innerHeight*0.8,behavior:'smooth'})}>{top?<><ArrowUp size={20} aria-hidden/><span>Back to top</span></>:<ArrowDown size={22} aria-hidden/>}</button>;
}

export function VideoLesson({moduleKey:key}:{moduleKey:string}){
 const {s,loaded,mutate}=useLearning();
 const parsed=parseVideoKey(key)!;
 // Learners only see modules from their own plans. Opening a module of another of their plans opens that plan.
 const plans=plansOf(s),own=plans.find(p=>p.id===s.programme?.id&&p.level===parsed.level)||plans.find(p=>p.level===parsed.level);
 const switching=loaded&&!!own&&own.id!==s.programme?.id;
 useEffect(()=>{if(switching)void mutate('plan_open',{id:own!.id})},[switching]);
 const [tab,setTab]=useState('lessons');
 const [lessonAt,setLessonAt]=useState<{index:number;count:number}|null>(null);
 // Next module appears once the learner reaches the last lesson of this module (or has handed in its task).
 const atLastLesson=!!lessonAt&&lessonAt.index>=lessonAt.count-1;
 const [reviewNow,setReviewNow]=useState('');
 const mods=modulesFor(parsed.level),lesson=moduleLesson(parsed.module,projectLabel(s.programme));
 const last=parsed.index===mods.length-1;
 // A stage is done when every module of it at this level is finished.
 const stagesDone=[...new Set(mods.map(x=>x.stageLabel))].filter(st=>mods.every((x,i)=>x.stageLabel!==st||!!s.progress?.[moduleKey(parsed.level,i)]));
 useEffect(()=>{const q=new URLSearchParams(window.location.search).get('tab')||'';const t=oldTabs[q]||q;if(['task','feedback'].includes(t)||t==='finish'&&last)setTab(t)},[]);
 // Watch, Make and Reflect each have their own address (?tab=watch|make|reflect) so they can be linked and shared.
 useEffect(()=>{const name={lessons:'watch',task:'make',feedback:'reflect',finish:'finish'}[tab];const u=new URL(window.location.href);if(u.searchParams.get('tab')!==name){u.searchParams.set('tab',name!);window.history.replaceState(null,'',u)}},[tab]);
 const prev=parsed.index>0?moduleKey(parsed.level,parsed.index-1):null,next=parsed.index<mods.length-1?moduleKey(parsed.level,parsed.index+1):null;
 if(loaded&&!own)return <Panel className="vg-empty"><span className="eyebrow">MY COURSES</span><h1>This module isn’t in your plans</h1><p className="lede">You can open modules from the plans you’ve made. Make a plan at this level to see it.</p><div className="button-row"><Go href="/workspace">My courses</Go>{plans.length<maxPlans&&<Go href="/start" outline>Make a plan</Go>}</div></Panel>;
 if(!loaded||switching)return <Panel><p role="status">Opening your plan…</p></Panel>;
 return <div className="vg-lesson">
  <div className="breadcrumbs"><a href="/workspace">My courses</a><span>/</span><a href={'/workspace/'+own!.id}>{planTitle(own!)}</a></div>
  {/* Video-first module page (23 Oct 2026): a compact title, then one toolbar with the tabs on the left and
      where this module sits in making a video on the right, so the player fits in the first screen. */}
  <header className="mv-head"><h1>{lesson.title}</h1><p className="ls-meta">Module {parsed.index+1} of {mods.length} <span>·</span> {parsed.module.hours} h <span>·</span> {parsed.module.stageLabel}</p></header>
  <Tabs value={tab} onValueChange={setTab}>
   <div className="mv-toolbar">
    <PathwayStrip current={parsed.module.stageLabel} done={stagesDone}/>
    <TabsList className={'learning-tabs'+(last?' four':'')}><TabsTrigger value="lessons">Watch</TabsTrigger><TabsTrigger value="task">Make</TabsTrigger><TabsTrigger value="feedback">Reflect</TabsTrigger>{last&&<TabsTrigger value="finish">Finish</TabsTrigger>}</TabsList>
   </div>
   <TabsContent value="lessons"><LessonsTab moduleKey={key} onTask={()=>{setTab('task');window.scrollTo({top:0,behavior:'smooth'})}} onLesson={(index,count)=>setLessonAt({index,count})}/></TabsContent>
   <TabsContent value="task">{loaded&&<TaskTab moduleKey={key} onHandedIn={id=>{setReviewNow(id);setTab('feedback')}}/>}</TabsContent>
   <TabsContent value="feedback">{loaded&&<FeedbackTab moduleKey={key} requestFor={reviewNow} onRetry={()=>{setTab('task');window.scrollTo({top:0,behavior:'smooth'})}} onFinish={last?()=>setTab('finish'):undefined}/>}</TabsContent>
   {last&&<TabsContent value="finish">{loaded&&<LevelClosure level={parsed.level}/>}</TabsContent>}
  </Tabs>
  <ScrollCue/>
  <div className="ls-support"><ReportProblem moduleKey={key} lesson={tab==='lessons'&&lessonAt?lessonAt.index+1:undefined} variant="ghost" label="Report a problem with this module"/></div>
  <div className="button-row between">{prev?<Go outline href={moduleHref(prev)}><ArrowLeft size={16}/>Previous module</Go>:<span/>}{next&&(atLastLesson||s.progress?.[key])?<Go outline href={moduleHref(next)}>Next module<ArrowRight size={16}/></Go>:<span/>}</div>
 </div>;
}

// "Before you start": what to hand in, common mistakes, no gear, handing in again (pilot of 24 Oct 2026).
function TaskFaq({moduleId}:{moduleId:string}){
 const f=taskFaq[moduleId];if(!f)return null;
 const qs:[string,React.ReactNode][]=[
  ['What exactly do I hand in?',<p>{f.handIn}</p>],
  ['Common mistakes',<ul>{f.mistakes.map(x=><li key={x}>{x}</li>)}</ul>],
  ['What if I don’t have the gear or the people?',<p>{noGear}</p>],
  ['Can I hand in again?',<p>Yes. Each hand-in is saved as a new piece in My Work, so nothing is lost. Each module includes 2 AI reviews, so read the review before you try again.</p>],
 ];
 return <section className="vg-task-faq" aria-labelledby="task-faq-title"><h3 id="task-faq-title">Before you start</h3>
  {qs.map(([q,a],i)=><details key={q} open={i<2}><summary>{q}<ChevronDown size={16} aria-hidden/></summary><div>{a}</div></details>)}
 </section>;
}

function TaskTab({moduleKey:key,onHandedIn}:{moduleKey:string;onHandedIn:(id:string)=>void}){
 const {s,mutate,busy}=useLearning();
 const m=parseVideoKey(key)!.module,lesson=moduleLesson(m,projectLabel(s.programme));
 const [draft,setDraft]=useState<Draft>(emptyDraft);
 useEffect(()=>setDraft(readDraft(key)),[key]);
 const update=(patch:Partial<Draft>)=>setDraft(prev=>{const next={...prev,...patch};writeDraft(key,next);return next});
 const blocker=blockingModule(s,key);
 const entitled=canPractise(s,key);
 const handedIn=s.submissions.filter((x:any)=>x.key===key).length;
 const selfCheck=needsSelfCheck(key),missing=handInMissing(m,toHandIn(draft,m.id),selfCheck);
 if(!entitled)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Choose Self-paced to do this task.</h2><p>On the Free plan, only the tasks in the first two modules are open. Choose the Self-paced plan (₹999/year) to unlock this task and every task after it, with AI reviews and your portfolio. You can still watch this module for free.</p><div className="button-row"><Go href={'/membership?return_to='+encodeURIComponent(moduleHref(key)+'?tab=task')}>Choose Self-paced</Go><Go outline href="/mentors">Learn with a mentor</Go></div></Panel>;
 if(blocker)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Hand in the module before this one first.</h2><p>Finish “{moduleInfo(blocker).lesson.title}” to unlock this task. You can still watch this module.</p><Go href={moduleHref(blocker)+'?tab=task'}>Go to that module</Go></Panel>;
 // The task opens once every lesson in this module is finished (videos watched, practice tools solved).
 const dead=useDeadVideos();
 const lessons=lessonsFor(m.id,s.programme?.primaryPathway),lessonState=lessonsStatus(m.id,s.programme?.primaryPathway||'Documentary',s.lessonProgress?.[key],dead);
 if(requireLessonsForTask&&lessonState.done<lessonState.total)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Finish the lessons to unlock this task.</h2><p>{lessonState.done} of {lessonState.total} lessons done. In each lesson, watch the videos and answer the Reflect questions.</p>
  <ol className="vg-unlock-list">{lessons.map((l,i)=><li key={l.title} className={lessonState.finished[i]?'ok':''}>{lessonState.finished[i]?<Check size={16}/>:<span>{i+1}</span>}<a className="text-link" href={moduleHref(key)+'?lesson='+(i+1)}>{l.title}</a></li>)}</ol></Panel>;
 async function handIn(){
  const h=toHandIn(draft,m.id),state=await mutate('video_submit',{key,answer:h.answer,notes:h.notes,url:h.url,uploadIds:h.uploadIds,parts:h.parts,ratings:draft.ratings,reflections:draft.reflections});
  if(!state)return;
  const piece=state.submissions.find((x:any)=>x.key===key);
  try{localStorage.removeItem(draftKey(key))}catch{}
  setDraft(emptyDraft());onHandedIn(piece?.id||'');
 }
 return <Gate><div className="vg-make">
  <section className="vg-task-brief"><LessonSketch src={'/sketches/'+m.id+'-1'} title={m.taskName}/><span className="eyebrow">{taskLabel(m.id)}</span><h2>{m.taskName}</h2><p className="vg-task-do">{lesson.do}</p>
   <div className="vg-task-meta"><div><strong>Good work looks like this</strong><p>{m.evidence}</p></div><div><strong>How it’s checked</strong><ul>{lesson.checks.map(c=><li key={c}>{c}</li>)}</ul></div></div>
   <TaskFaq moduleId={m.id}/>
   {handedIn>0&&<p className="small">You have handed this in {handedIn} time{handedIn>1?'s':''}.</p>}</section>

  {partsFor(m.id).length>0&&<PartsPanel moduleKey={key} list={partsFor(m.id)} draft={draft} update={update}/>}
  {!partsFor(m.id).length&&(<Panel className="vg-form-block vg-handin"><h2><FileText size={18}/> {m.handIn==='text'?'1. Write your answer':'1. Hand in your work'}</h2>
   {m.handIn==='text'&&<label>Your answer <span className="small">({draft.answer.trim().length}/80 characters minimum)</span><textarea rows={9} maxLength={6000} value={draft.answer} onChange={e=>update({answer:e.target.value})} placeholder="Write your answer here. You don’t need to upload a document."/></label>}
   <div className="vg-files"><span className="vg-label">{m.handIn==='text'?'Add photos or files (optional)':'Upload your work: up to 3 photos or videos, or add a link'}</span>
    {draft.files.length>0&&<ul>{draft.files.map(f=><li key={f.id}><Upload size={14}/>{f.name}<button type="button" aria-label={'Remove '+f.name} onClick={()=>update({files:draft.files.filter(x=>x.id!==f.id)})}><X size={14}/></button></li>)}</ul>}
    {draft.files.length<maxHandInFiles&&<UploadField lessonKey={key} value={null} onUpload={(f:any)=>update({files:[...draft.files,{id:f.id,name:f.name,type:f.type}]})}/>}
    <p className="small">Need more than 3 pictures? Put them into one image (a collage), or add a link to a folder.</p>
    <label>Link to your work (YouTube, Google Drive, or a Google Doc for written work)<input type="url" value={draft.url} onChange={e=>update({url:e.target.value})} placeholder="https://"/></label>
    <p className="small">Google Doc: click Share and set General access to “Anyone with the link”, or the AI can’t open it. YouTube videos must be Public or Unlisted.</p>
   </div>
   <label>{m.handIn==='text'?'Anything else to add? (optional)':'Tell us about your work'}<textarea rows={3} maxLength={2000} value={draft.notes} onChange={e=>update({notes:e.target.value})} placeholder="What did you make? What did you try?"/></label>
  </Panel>)}

  {selfCheck&&<><Panel className="vg-form-block"><h2>2. Rate your own work</h2><p className="small">Be honest. In Feedback, you’ll see how the AI rates the same checks.</p>
   {lesson.checks.map((check,i)=><fieldset key={check} className="vg-rate"><legend>{check}</legend><div>{ratingScale.map((label,v)=><button type="button" key={label} className={draft.ratings[i]===v?'selected':''} aria-pressed={draft.ratings[i]===v} onClick={()=>update({ratings:draft.ratings.map((r,j)=>j===i?v:r)})}><strong>{v}</strong>{label}</button>)}</div></fieldset>)}
  </Panel>

</>}

  {missing.length>0&&<p className="small" role="status">To hand in: {missing.join(' · ')}.</p>}
  <Action disabled={missing.length>0||busy} onClick={handIn}>Hand in my work</Action>
  <p className="small">Your work is saved in My Work automatically. You can remove it there at any time.</p>
 </div></Gate>;
}

// A task with parts: one field or upload slot for each, with a live count of what is still missing.
function PartsPanel({moduleKey,list,draft,update}:{moduleKey:string;list:TaskPart[];draft:Draft;update:(p:Partial<Draft>)=>void}){
 const data:PartsData={text:draft.text,files:Object.fromEntries(list.filter(x=>x.kind==='media').map(x=>[x.id,(draft.partFiles[x.id]||[]).map(f=>f.id)]))};
 const hasLink=!!draft.url.trim(),n=list.filter(p=>partDone(p,data,hasLink)).length,total=Object.values(draft.partFiles).reduce((c,l)=>c+l.length,0);
 return <Panel className="vg-form-block vg-handin vg-parts"><h2><FileText size={18}/> 1. What to hand in</h2>
  <div className="vg-parts-top"><p role="status"><strong>{n} of {list.length}</strong> parts added{n<list.length?'. Add the rest, then hand in.':'. Ready to hand in.'}</p><div className="vg-parts-bar" aria-hidden="true"><span style={{width:Math.round(n/list.length*100)+'%'}}/></div></div>
  <ol className="vg-parts-list">{list.map((p,i)=>{const ok=partDone(p,data,hasLink),files=draft.partFiles[p.id]||[];return <li key={p.id} className={ok?'done':''}>
   <div className="vg-pp-head"><span className="vg-part-tick" aria-hidden="true">{ok?<Check size={14}/>:i+1}</span><strong>{p.label}</strong><span className="sr-only">{ok?'Added':'Not added yet'}</span></div>
   {p.hint&&<p className="small">{p.hint}</p>}
   {p.kind==='text'?<textarea rows={3} maxLength={2000} value={draft.text[p.id]||''} aria-label={p.label} onChange={e=>update({text:{...draft.text,[p.id]:e.target.value}})} placeholder="Write it here"/>
    :<div className="vg-files">{files.length>0&&<ul>{files.map(f=><li key={f.id}><Upload size={14}/>{f.name}<button type="button" aria-label={'Remove '+f.name} onClick={()=>update({partFiles:{...draft.partFiles,[p.id]:files.filter(x=>x.id!==f.id)}})}><X size={14}/></button></li>)}</ul>}
     {files.length<4&&total<maxHandInFiles&&<UploadField lessonKey={moduleKey} value={null} onUpload={(f:any)=>update({partFiles:{...draft.partFiles,[p.id]:[...files,{id:f.id,name:f.name,type:f.type}]}})}/>}</div>}
  </li>})}</ol>
  <label>Or one link for your files (YouTube, Google Drive, or a Google Doc)<input type="url" value={draft.url} onChange={e=>update({url:e.target.value})} placeholder="https://"/></label>
  <p className="small">A link counts for every file slot. Google Doc: click Share and set General access to “Anyone with the link”, or the AI can’t open it. YouTube videos must be Public or Unlisted.</p>
  <label>Anything else for the reviewer? (optional)<textarea rows={2} maxLength={2000} value={draft.notes} onChange={e=>update({notes:e.target.value})} placeholder="What did you try? What are you unsure about?"/></label>
 </Panel>;
}

// While a review runs: a bar that fills over the expected time (about a minute for each 8 clips or photos, checked
// together, plus the writing),
// slowing near the end rather than promising a finish time.
function WaitingTips({media=0}:{media?:number}){
 const [i,setI]=useState(()=>Math.floor(Math.random()*waitingTips.length)),[t,setT]=useState(0);
 useEffect(()=>{const a=setInterval(()=>setI(n=>(n+1)%waitingTips.length),7000),b=setInterval(()=>setT(s=>s+1),1000);return ()=>{clearInterval(a);clearInterval(b)}},[]);
 const expected=40+Math.ceil(media/8)*60,share=t<expected?t/expected*0.9:0.9+0.08*(1-Math.exp(-(t-expected)/60));
 const step=media>0&&t<expected-25?`Checking your ${media} ${media===1?'clip or photo':'clips and photos'}`:'Writing your review';
 return <Panel className="vg-waiting"><p role="status"><span className="vg-spinner" aria-hidden="true"/>{step}…</p>
  <div className="vg-wait-bar" role="progressbar" aria-label="Review progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share*100)}><span style={{width:Math.round(share*100)+'%'}}/></div>
  <p className="small">{t>expected+30?'This one is taking longer than usual. It is still working, so please keep this page open.':'Please keep this page open. Your review will appear here.'}</p><p className="vg-tip"><span className="eyebrow">While you wait</span>{waitingTips[i]}</p></Panel>;
}

type Flag={reason:string;status:'open'|'fine'|'refunded';note:string};
// A check's 0 to 4 rating in words: 0-1 Not yet, 2 Getting there, 3-4 Solid.
const levelOf=(r:number|null|undefined)=>r==null||r<0?'none':r<=1?'low':r===2?'mid':'high';
const levelName=(r:number|null|undefined)=>({none:'Not scored',low:'Not yet',mid:'Getting there',high:'Solid'})[levelOf(r)];
type Review={id:string;flag?:Flag|null;rating?:{helpful:number;comment:string}|null;submissionId?:string;createdAt:number;review:{total:number|null;summary:string;strength:string;improvement:string;nextStep:string;evidenceLimit:string;revisit?:number|null;revisitWhy?:string;progress?:string;criteria:{label:string;rating:number|null;feedback:string}[]}};
// After the review: what went well and what to change next time, written with the feedback in front of you.
function ReflectNotes({piece}:{piece:any}){
 const {mutate,busy}=useLearning();
 const [notes,setNotes]=useState({well:piece.reflections?.well||'',change:piece.reflections?.change||''}),[saved,setSaved]=useState(false);
 useEffect(()=>{setNotes({well:piece.reflections?.well||'',change:piece.reflections?.change||''});setSaved(false)},[piece.id]);
 const changed=notes.well!==(piece.reflections?.well||'')||notes.change!==(piece.reflections?.change||'');
 return <Panel className="vg-form-block vg-reflect-notes"><h2>Think about it</h2>
  {Array.isArray(piece.selfRatings)&&<p className="small">Your own rating: {piece.selfRatings.reduce((n:number,r:number)=>n+(r>0?r:0),0)} of {piece.selfRatings.length*4}</p>}
  <p className="small">With the review in front of you. Optional, saved with this piece in My Work.</p>
  {reflectionQuestions.map(q=><label key={q.id}>{q.label}<textarea rows={2} maxLength={600} value={notes[q.id]} onChange={e=>{setNotes({...notes,[q.id]:e.target.value});setSaved(false)}}/></label>)}
  <div className="button-row"><Button variant="outline" disabled={busy||!changed} onClick={async()=>{if(await mutate('video_reflect',{id:piece.id,...notes}))setSaved(true)}}>Save</Button>{saved&&<span className="small" role="status"><Check size={14}/> Saved</span>}</div>
 </Panel>;
}

function FeedbackTab({moduleKey:key,requestFor,onRetry,onFinish}:{moduleKey:string;requestFor:string;onRetry?:()=>void;onFinish?:()=>void}){
 const {s}=useLearning();
 const piece=s.submissions.find((x:any)=>x.key===key);
 const [reviews,setReviews]=useState<Review[]|null>(null),[allowance,setAllowance]=useState<any>(null),[status,setStatus]=useState(''),[error,setError]=useState('');
 const started=useRef('');
 async function load(){try{const r=await fetch('/api/review?key='+encodeURIComponent(key));const d:any=await r.json();if(!r.ok)throw Error(d.error);setReviews(d.reviews);setAllowance(d.allowance);return d}catch(e:any){setError(e.message||'Reviews could not load.');return null}}
 async function requestReview(submissionId:string){
  if(started.current===submissionId)return;started.current=submissionId;setError('');setStatus('reviewing');
  try{const r=await fetch('/api/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonKey:key,submissionId,requestId:crypto.randomUUID()})});const d:any=await r.json();if(!r.ok)throw Error(d.error);await load()}
  catch(e:any){setError(e.message||'AI review is not available right now.');started.current=''}finally{setStatus('')}
 }
 useEffect(()=>{if(piece)load()},[piece?.id]);
 // Straight after a hand-in, ask for the AI review automatically.
 // Only when a review is left; otherwise the learner sees why this piece has no review.
 useEffect(()=>{if(requestFor&&piece?.id===requestFor&&reviews&&allowance?.eligible&&allowance.used<allowance.limit&&!reviews.some(r=>r.submissionId===requestFor))requestReview(requestFor)},[requestFor,reviews,allowance]);
 // Pilot tracker: the learner opened their review (once per review).
 const shownId=piece?reviews?.find(r=>r.submissionId===piece.id)?.id:undefined;
 useEffect(()=>{if(shownId)track('review_opened',{module:key},shownId)},[shownId]);
 if(!piece)return <Panel className="empty"><h2>Nothing to review yet.</h2><p>Hand in your work in Task. Then your AI review shows here.</p></Panel>;
 const review=reviews?.find(r=>r.submissionId===piece.id);
 // The review of the hand-in before this one, to show what changed; and the module's lesson titles for 'Rewatch'.
 const prev=review?reviews!.find(r=>r.submissionId!==piece.id&&r.createdAt<review.createdAt):undefined;
 const lessonTitles=lessonsFor(parseVideoKey(key)!.module.id,s.programme?.primaryPathway).map((l:any)=>l.title);
 const canReview=allowance?.eligible&&allowance.used<allowance.limit;
 const rated=Array.isArray(piece.selfRatings);
 return <div className="vg-reflect">
  {status&&<WaitingTips media={piece?.media||0}/>}
  {!review&&allowance?.queued>0&&<p className="notice" role="status">Your AI review is in the queue. AI is paused for a short while, so it will run soon and show up here, usually within a few hours. You don’t need to do anything.</p>}
  {review?<Panel className="vg-ai-review">
   <div className="row between"><h2><Sparkles size={20}/> AI review</h2>{(()=>{const rs=review.review.criteria.map(c=>c.rating),all=rs.every(r=>r!==null),sum=(a:(number|null)[])=>a.reduce<number>((n,r)=>n+(r||0),0),was=prev?.review.criteria.map(c=>c.rating);
    return all?<div className="vg-ai-score-box"><strong className="vg-ai-score">{sum(rs)}<small> of {rs.length*4}</small></strong>{was&&was.length===rs.length&&was.every(r=>r!==null)&&sum(was)!==sum(rs)&&<span className={'vg-delta '+(sum(rs)>sum(was)?'up':'down')}>{sum(rs)>sum(was)?'Up':'Down'} from {sum(was)} to {sum(rs)}</span>}</div>:<Badge>Not enough to score every check</Badge>})()}</div>
   <p>{review.review.summary}</p>
   {(()=>{const gaps=review.review.criteria.filter((c,i)=>{const mine=piece.selfRatings?.[i];return rated&&c.rating!==null&&mine!==undefined&&Math.abs(c.rating-mine)>=2});
    return gaps.length>0?<p className="vg-gap-note"><strong>You rated {gaps.length===1?'one check':gaps.length+' checks'} differently from the reviewer.</strong> That is normal: the AI is a first look, not a verdict. The notes below say what it looked for, so you can see it for yourself.</p>:null})()}
   <table className="vg-compare"><thead><tr><th>Check</th>{rated&&<th>You</th>}<th>AI</th></tr></thead><tbody>{review.review.criteria.map((c,i)=>{const mine=piece.selfRatings?.[i];const gap=rated&&c.rating!==null&&mine!==undefined&&Math.abs(c.rating-mine)>=2;return <tr key={c.label}><td><strong>{c.label}</strong><span className="small">{c.feedback}</span></td>{rated&&<td><span className={'vg-level l'+levelOf(mine)}>{levelName(mine)}</span></td>}<td><span className={'vg-level l'+levelOf(c.rating)}>{levelName(c.rating)}</span>{(()=>{const was=prev?.review.criteria[i]?.rating;return c.rating!==null&&was!=null&&was!==c.rating?<span className={'vg-delta '+(c.rating>was?'up':'down')} title={'Last time: '+was+'/4'}>{c.rating>was?'↑':'↓'} from {was}</span>:null})()}</td></tr>})}</tbody></table>
   <div className="vg-review-notes"><p><strong>What worked:</strong> {review.review.strength}</p><p><strong>What to improve:</strong> {review.review.improvement}</p><p><strong>Try next (under 30 minutes):</strong> {review.review.nextStep}</p></div>
   {canReview&&onRetry&&<div className="vg-retry"><div><strong>Want a higher score? Try the task again.</strong><p className="small">You have {allowance.limit-allowance.used} more {allowance.limit-allowance.used===1?'chance':'chances'} for an AI review on this module. Fix the one thing under “What to improve”, then hand in again.</p></div><Button onClick={onRetry}><RotateCcw size={16}/>Try the task again</Button></div>}
   {!canReview&&allowance?.eligible&&<p className="small">You’ve used both AI reviews for this module. Your work is saved in My Work.</p>}
   {review.review.progress&&<p className="vg-progress-note"><strong>Since your last hand-in:</strong> {review.review.progress}</p>}
   {review.review.revisit&&<a className="vg-revisit" href={moduleHref(key)+'?tab=watch&lesson='+review.review.revisit}><BookOpen size={18}/><span><strong>Rewatch lesson {review.review.revisit}{lessonTitles[review.review.revisit-1]?': '+lessonTitles[review.review.revisit-1]:''}</strong>{review.review.revisitWhy&&<span className="small">{review.review.revisitWhy}</span>}</span><ArrowRight size={18}/></a>}
   {review.review.criteria.some(c=>c.rating===null)&&<div className="vg-unsure"><p className="small">The AI couldn’t judge every check from what it could see. Not sure this review is right? Ask us and a person will look.</p><ReportProblem moduleKey={key} category="review" variant="outline" label="Ask us about this review"/></div>}
   <ReviewRating review={review}/>
   <ReviewFlag review={review}/>
  </Panel>:!status&&<Panel><h2>AI review</h2>
   {error&&<p role="alert" className="notice">{error}</p>}
   {canReview?<><p>Get feedback on the work you handed in.</p><Button onClick={()=>requestReview(piece.id)}>Get my AI review</Button></>:allowance&&<p>{allowance.eligible?'You’ve used both AI reviews for this module, so this hand-in won’t get one. It’s saved in My Work.':'AI reviews for this module are part of Self-paced. Your work is saved in My Work.'}{rated?' Your own rating is below.':''}</p>}
  </Panel>}
  <ReflectNotes piece={piece}/>
  {allowance&&<p className="small">AI reviews used for this module: {allowance.used} of {allowance.limit}.{allowance.used<allowance.limit?' Hand in again to use the other one.':''} The AI reads your text and photos, watches your videos and YouTube or Google Drive links (picture and sound), and reads Google Docs shared as “Anyone with the link”.</p>}
  <div className="button-row"><Go href={'/portfolio?from='+encodeURIComponent(key)} outline>See it in My Work</Go>{onFinish&&<Button onClick={onFinish}><Flag size={16}/>Finish the level</Button>}</div>
 </div>;
}

// "Was this review useful?" Thumbs up or down, which the learner can change, with an optional comment.
function ReviewRating({review}:{review:Review}){
 const [rating,setRating]=useState(review.rating||null),[comment,setComment]=useState(review.rating?.comment||''),[asking,setAsking]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function send(helpful:boolean,note=comment,close=true){setBusy(true);setError('');try{const r=await fetch('/api/review/rate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reviewId:review.id,helpful,comment:note})});const d:any=await r.json();if(!r.ok)throw Error(d.error);setRating(d.rating);if(close)setAsking(false)}catch(e:any){setError(e.message||'That didn’t save. Please try again.')}finally{setBusy(false)}}
 return <div className="vg-rate"><span className="small">Was this review useful?</span>
  <div className="vg-rate-buttons" role="group" aria-label="Was this review useful?">
   <button type="button" aria-pressed={rating?.helpful===1} disabled={busy} onClick={()=>send(true,'')}><ThumbsUp size={16}/>Yes</button>
   <button type="button" aria-pressed={rating?.helpful===0} disabled={busy} onClick={()=>{setAsking(true);if(rating?.helpful!==0)send(false,'',false)}}><ThumbsDown size={16}/>No</button>
  </div>
  {rating&&!asking&&<span className="small" role="status">Thanks{rating.comment?', we read every comment':''}.</span>}
  {asking&&<form className="vg-rate-comment" onSubmit={e=>{e.preventDefault();send(false)}}><label className="vg-field">What would have made it more useful? (optional)<textarea rows={2} maxLength={600} value={comment} onChange={e=>setComment(e.target.value)}/></label><Button type="submit" variant="outline" disabled={busy}>{busy?'Sending…':'Send'}</Button></form>}
  {error&&<p className="small" role="alert">{error}</p>}
 </div>;
}

// "This feedback seems wrong": the learner tells us, an admin checks it on /admin and replies here.
const flagReasons:[string,string][]=[['missed','It says something is missing, but it’s in my work'],['video','It describes the video or sound wrongly'],['score','The score doesn’t match the feedback'],['task','It reviewed it against the wrong task'],['other','Something else']];
function ReviewFlag({review}:{review:Review}){
 const [flag,setFlag]=useState<Flag|null>(review.flag||null),[open,setOpen]=useState(false),[reason,setReason]=useState(''),[details,setDetails]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 if(flag)return <p className={'small vg-flag-state '+flag.status} role="status">{flag.status==='open'?'You flagged this review. We’re checking it and will reply here.':flag.status==='refunded'?'We checked: this review was wrong, so it no longer counts. You can ask for another review.':'We checked this review and it stands.'}{flag.note&&<><br/><strong>Framepath:</strong> {flag.note}</>}</p>;
 if(!open)return <button type="button" className="text-link small vg-flag-open" onClick={()=>setOpen(true)}>This feedback seems wrong</button>;
 async function send(){setBusy(true);setError('');try{const r=await fetch('/api/review/flag',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reviewId:review.id,reason,details})});const d:any=await r.json();if(!r.ok)throw Error(d.error);setFlag(d.flag)}catch(e:any){setError(e.message||'That didn’t send. Please try again.')}finally{setBusy(false)}}
 return <div className="vg-flag-form"><strong>What seems wrong?</strong>
  <div className="vg-pick" role="radiogroup" aria-label="What seems wrong">{flagReasons.map(([id,label])=><button type="button" role="radio" aria-checked={reason===id} key={id} className={reason===id?'ok':''} onClick={()=>setReason(id)}>{label}</button>)}</div>
  <textarea rows={3} maxLength={1000} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Tell us what it got wrong (optional). For example: the sound is clear at 0:10." aria-label="Details"/>
  {error&&<p role="alert" className="field-error">{error}</p>}
  <div className="button-row"><Button size="sm" disabled={!reason||busy} onClick={send}>{busy?'Sending…':'Send'}</Button><Button size="sm" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button></div>
 </div>;
}

