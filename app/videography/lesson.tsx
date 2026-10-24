'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,ThumbsUp,ThumbsDown,Check,Clapperboard,Clock,FileText,Flag,LockKeyhole,MessageCircle,Sparkles,Upload,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import './lesson.css';
import {useLearning,Go,Action,Panel,Badge,Gate,UploadField,Photo} from '../ui';
import {blockingModule,moduleHref,moduleInfo} from '../learning-rules';
import {parseVideoKey,moduleLesson,projectLabel,modulesFor,moduleKey,ratingScale,reflectionQuestions,maxHandInFiles,handInMissing,needsSelfCheck,type HandIn,plansOf,planTitle,maxPlans} from './programme';
import {LessonsTab,PathwayStrip,canPractise,taskLabel,useDeadVideos} from './module-context';
import {waitingTips,lessonsFor,lessonsStatus,requireLessonsForTask} from './lessons';
import {LevelClosure} from './closure';
import {ReportProblem} from '../support';
import {track} from '../track';

type FileRef={id:string;name:string;type:string};
type Draft={answer:string;notes:string;url:string;files:FileRef[];ratings:number[];reflections:{well:string;change:string}};
const emptyDraft=():Draft=>({answer:'',notes:'',url:'',files:[],ratings:[-1,-1,-1],reflections:{well:'',change:''}});
const draftKey=(key:string)=>'fp-handin-'+key;
function readDraft(key:string):Draft{try{const d=JSON.parse(localStorage.getItem(draftKey(key))||'null');if(d)return {...emptyDraft(),...d}}catch{}return emptyDraft()}
function writeDraft(key:string,d:Draft){try{localStorage.setItem(draftKey(key),JSON.stringify(d))}catch{}}
const toHandIn=(d:Draft):HandIn=>({answer:d.answer,notes:d.notes,url:d.url,uploadIds:d.files.map(f=>f.id),ratings:d.ratings,reflections:d.reflections});

// A Videography module: Lessons (Watch + Reflect each), then the Task (hand in), then Feedback (AI review).
// The last module of a level also has Finish, which closes the level.
const oldTabs:Record<string,string>={watch:'lessons',make:'task',reflect:'feedback'};
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
    <TabsList className={'learning-tabs'+(last?' four':'')}><TabsTrigger value="lessons">Watch</TabsTrigger><TabsTrigger value="task">Make</TabsTrigger><TabsTrigger value="feedback">Reflect</TabsTrigger>{last&&<TabsTrigger value="finish">Finish</TabsTrigger>}</TabsList>
    <PathwayStrip current={parsed.module.stageLabel} done={stagesDone}/>
   </div>
   <TabsContent value="lessons"><LessonsTab moduleKey={key} onTask={()=>{setTab('task');window.scrollTo({top:0,behavior:'smooth'})}} onLesson={(index,count)=>setLessonAt({index,count})}/></TabsContent>
   <TabsContent value="task">{loaded&&<TaskTab moduleKey={key} onHandedIn={id=>{setReviewNow(id);setTab('feedback')}}/>}</TabsContent>
   <TabsContent value="feedback">{loaded&&<FeedbackTab moduleKey={key} requestFor={reviewNow} onFinish={last?()=>setTab('finish'):undefined}/>}</TabsContent>
   {last&&<TabsContent value="finish">{loaded&&<LevelClosure level={parsed.level}/>}</TabsContent>}
  </Tabs>
  <div className="ls-support"><ReportProblem moduleKey={key} lesson={tab==='lessons'&&lessonAt?lessonAt.index+1:undefined} variant="ghost" label="Report a problem with this module"/></div>
  <div className="button-row between">{prev?<Go outline href={moduleHref(prev)}><ArrowLeft size={16}/>Previous module</Go>:<span/>}{next&&(atLastLesson||s.progress?.[key])?<Go outline href={moduleHref(next)}>Next module<ArrowRight size={16}/></Go>:<span/>}</div>
 </div>;
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
 const selfCheck=needsSelfCheck(key),missing=handInMissing(m,toHandIn(draft),selfCheck);
 if(!entitled)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Choose Self-paced to do this task.</h2><p>On the Free plan, only the tasks in the first two modules are open. Choose the Self-paced plan (₹999/year) to unlock this task and every task after it, with AI reviews and your portfolio. You can still watch this module for free.</p><div className="button-row"><Go href={'/membership?return_to='+encodeURIComponent(moduleHref(key)+'?tab=task')}>Choose Self-paced</Go><Go outline href="/mentors">Learn with a mentor</Go></div></Panel>;
 if(blocker)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Hand in the module before this one first.</h2><p>Finish “{moduleInfo(blocker).lesson.title}” to unlock this task. You can still watch this module.</p><Go href={moduleHref(blocker)+'?tab=task'}>Go to that module</Go></Panel>;
 // The task opens once every lesson in this module is finished (videos watched, practice tools solved).
 const dead=useDeadVideos();
 const lessons=lessonsFor(m.id,s.programme?.primaryPathway),lessonState=lessonsStatus(m.id,s.programme?.primaryPathway||'Documentary',s.lessonProgress?.[key],dead);
 if(requireLessonsForTask&&lessonState.done<lessonState.total)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Finish the lessons to unlock this task.</h2><p>{lessonState.done} of {lessonState.total} lessons done. In each lesson, watch the videos and answer the Reflect questions.</p>
  <ol className="vg-unlock-list">{lessons.map((l,i)=><li key={l.title} className={lessonState.finished[i]?'ok':''}>{lessonState.finished[i]?<Check size={16}/>:<span>{i+1}</span>}<a className="text-link" href={moduleHref(key)+'?lesson='+(i+1)}>{l.title}</a></li>)}</ol></Panel>;
 async function handIn(){
  const state=await mutate('video_submit',{key,answer:draft.answer,notes:draft.notes,url:draft.url,uploadIds:draft.files.map(f=>f.id),ratings:draft.ratings,reflections:draft.reflections});
  if(!state)return;
  const piece=state.submissions.find((x:any)=>x.key===key);
  try{localStorage.removeItem(draftKey(key))}catch{}
  setDraft(emptyDraft());onHandedIn(piece?.id||'');
 }
 return <Gate><div className="vg-make">
  <section className="vg-task-brief"><Photo slot="make" className="ls-make-photo"/><span className="eyebrow">{taskLabel(m.id)}</span><h2>{m.taskName}</h2><p className="vg-task-do">{lesson.do}</p>
   <div className="vg-task-meta"><div><strong>Good work looks like this</strong><p>{m.evidence}</p></div><div><strong>How it’s checked</strong><ul>{lesson.checks.map(c=><li key={c}>{c}</li>)}</ul></div></div>
   {handedIn>0&&<p className="small">You have handed this in {handedIn} time{handedIn>1?'s':''}. Handing in again adds a new piece to My Work. Each module includes 2 AI reviews in total.</p>}</section>

  <Panel className="vg-form-block vg-handin"><h2><FileText size={18}/> {m.handIn==='text'?'1. Write your answer':'1. Hand in your work'}</h2>
   {m.handIn==='text'&&<label>Your answer <span className="small">({draft.answer.trim().length}/80 characters minimum)</span><textarea rows={9} maxLength={6000} value={draft.answer} onChange={e=>update({answer:e.target.value})} placeholder="Write your answer here. You don’t need to upload a document."/></label>}
   <div className="vg-files"><span className="vg-label">{m.handIn==='text'?'Add photos or files (optional)':'Upload your work: up to 3 photos or videos, or add a video link'}</span>
    {draft.files.length>0&&<ul>{draft.files.map(f=><li key={f.id}><Upload size={14}/>{f.name}<button type="button" aria-label={'Remove '+f.name} onClick={()=>update({files:draft.files.filter(x=>x.id!==f.id)})}><X size={14}/></button></li>)}</ul>}
    {draft.files.length<maxHandInFiles&&<UploadField lessonKey={key} value={null} onUpload={(f:any)=>update({files:[...draft.files,{id:f.id,name:f.name,type:f.type}]})}/>}
    <p className="small">Need more than 3 pictures? Put them into one image (a collage), or add a link to a folder.</p>
    <label>Video or folder link (YouTube, Vimeo, Google Drive…)<input type="url" value={draft.url} onChange={e=>update({url:e.target.value})} placeholder="https://"/></label>
   </div>
   <label>{m.handIn==='text'?'Anything else to add? (optional)':'Tell us about your work'}<textarea rows={3} maxLength={2000} value={draft.notes} onChange={e=>update({notes:e.target.value})} placeholder="What did you make? What did you try?"/></label>
  </Panel>

  {selfCheck&&<><Panel className="vg-form-block"><h2>2. Rate your own work</h2><p className="small">Be honest. In Feedback, you’ll see how the AI rates the same checks.</p>
   {lesson.checks.map((check,i)=><fieldset key={check} className="vg-rate"><legend>{check}</legend><div>{ratingScale.map((label,v)=><button type="button" key={label} className={draft.ratings[i]===v?'selected':''} aria-pressed={draft.ratings[i]===v} onClick={()=>update({ratings:draft.ratings.map((r,j)=>j===i?v:r)})}><strong>{v}</strong>{label}</button>)}</div></fieldset>)}
  </Panel>

</>}

  {missing.length>0&&<p className="small" role="status">To hand in: {missing.join(' · ')}.</p>}
  <Action disabled={missing.length>0||busy} onClick={handIn}>Hand in my work</Action>
  <p className="small">Your work is saved in My Work automatically. You can remove it there at any time.</p>
 </div></Gate>;
}

function WaitingTips(){
 const [i,setI]=useState(()=>Math.floor(Math.random()*waitingTips.length));
 useEffect(()=>{const t=setInterval(()=>setI(n=>(n+1)%waitingTips.length),7000);return ()=>clearInterval(t)},[]);
 return <Panel className="vg-waiting"><p role="status"><span className="vg-spinner" aria-hidden="true"/>AI is reviewing your work. This can take up to a minute…</p><p className="vg-tip"><span className="eyebrow">While you wait</span>{waitingTips[i]}</p></Panel>;
}

type Flag={reason:string;status:'open'|'fine'|'refunded';note:string};
type Review={id:string;flag?:Flag|null;rating?:{helpful:number;comment:string}|null;submissionId?:string;createdAt:number;review:{total:number|null;summary:string;strength:string;improvement:string;nextStep:string;evidenceLimit:string;revisit?:number|null;revisitWhy?:string;progress?:string;criteria:{label:string;rating:number|null;feedback:string}[]}};
// After the review: what went well and what to change next time, written with the feedback in front of you.
function ReflectNotes({piece}:{piece:any}){
 const {mutate,busy}=useLearning();
 const [notes,setNotes]=useState({well:piece.reflections?.well||'',change:piece.reflections?.change||''}),[saved,setSaved]=useState(false);
 useEffect(()=>{setNotes({well:piece.reflections?.well||'',change:piece.reflections?.change||''});setSaved(false)},[piece.id]);
 const changed=notes.well!==(piece.reflections?.well||'')||notes.change!==(piece.reflections?.change||'');
 return <Panel className="vg-form-block vg-reflect-notes"><h2>Think about it</h2>
  {piece.selfScore!=null&&<p className="small">Your own rating: {piece.selfScore}/100</p>}
  <p className="small">With the review in front of you. Optional, saved with this piece in My Work.</p>
  {reflectionQuestions.map(q=><label key={q.id}>{q.label}<textarea rows={2} maxLength={600} value={notes[q.id]} onChange={e=>{setNotes({...notes,[q.id]:e.target.value});setSaved(false)}}/></label>)}
  <div className="button-row"><Button variant="outline" disabled={busy||!changed} onClick={async()=>{if(await mutate('video_reflect',{id:piece.id,...notes}))setSaved(true)}}>Save</Button>{saved&&<span className="small" role="status"><Check size={14}/> Saved</span>}</div>
 </Panel>;
}

function FeedbackTab({moduleKey:key,requestFor,onFinish}:{moduleKey:string;requestFor:string;onFinish?:()=>void}){
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
  {status&&<WaitingTips/>}
  {!review&&allowance?.queued>0&&<p className="notice" role="status">Your AI review is in the queue. AI is paused for a short while, so it will run soon and show up here, usually within a few hours. You don’t need to do anything.</p>}
  {review?<Panel className="vg-ai-review">
   <div className="row between"><h2><Sparkles size={20}/> AI review</h2>{review.review.total!==null?<strong className="vg-ai-score">{Math.round(review.review.total)}<small>/100</small></strong>:<Badge>Not enough to score every check</Badge>}</div>
   <p>{review.review.summary}</p>
   <table className="vg-compare"><thead><tr><th>Check</th>{rated&&<th>You</th>}<th>AI</th></tr></thead><tbody>{review.review.criteria.map((c,i)=>{const mine=piece.selfRatings?.[i];const gap=rated&&c.rating!==null&&mine!==undefined&&Math.abs(c.rating-mine)>=2;return <tr key={c.label} className={gap?'gap':''}><td><strong>{c.label}</strong><span className="small">{c.feedback}</span>{gap&&<span className="small vg-gap">You and the AI see this differently. Read the note above and try again.</span>}</td>{rated&&<td>{mine??'–'}/4</td>}<td>{c.rating??'–'}/4{(()=>{const was=prev?.review.criteria[i]?.rating;return c.rating!==null&&was!=null&&was!==c.rating?<span className={'vg-delta '+(c.rating>was?'up':'down')} title={'Last time: '+was+'/4'}>{c.rating>was?'↑':'↓'} from {was}</span>:null})()}</td></tr>})}</tbody></table>
   <div className="vg-review-notes"><p><strong>What worked:</strong> {review.review.strength}</p><p><strong>What to improve:</strong> {review.review.improvement}</p><p><strong>Try next (under 30 minutes):</strong> {review.review.nextStep}</p><p className="small"><strong>What the AI couldn’t check:</strong> {review.review.evidenceLimit}</p></div>
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
  {allowance&&<p className="small">AI reviews used for this module: {allowance.used} of {allowance.limit}.{allowance.used<allowance.limit?' Hand in again to use the other one.':''} The AI reads your text and photos, and watches your videos and YouTube or Google Drive links, picture and sound.</p>}
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

