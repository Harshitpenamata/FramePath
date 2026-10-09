'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Clapperboard,Clock,FileText,LockKeyhole,MessageCircle,Sparkles,Upload,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {useLearning,Go,Action,Panel,Badge,Gate,isExplore,UploadField} from '../ui';
import {blockingModule,moduleHref,moduleInfo} from '../learning-rules';
import {parseVideoKey,moduleLesson,projectLabel,isFreeModule,modulesFor,moduleKey,ratingScale,reflectionQuestions,maxHandInFiles,handInMissing,needsSelfCheck,type HandIn} from './programme';
import {ModuleContext} from './module-context';

type FileRef={id:string;name:string;type:string};
type Draft={answer:string;notes:string;url:string;files:FileRef[];ratings:number[];reflections:{well:string;change:string}};
const emptyDraft=():Draft=>({answer:'',notes:'',url:'',files:[],ratings:[-1,-1,-1],reflections:{well:'',change:''}});
const draftKey=(key:string)=>'fp-handin-'+key;
function readDraft(key:string):Draft{try{const d=JSON.parse(localStorage.getItem(draftKey(key))||'null');if(d)return {...emptyDraft(),...d}}catch{}return emptyDraft()}
function writeDraft(key:string,d:Draft){try{localStorage.setItem(draftKey(key),JSON.stringify(d))}catch{}}
const toHandIn=(d:Draft):HandIn=>({answer:d.answer,notes:d.notes,url:d.url,uploadIds:d.files.map(f=>f.id),ratings:d.ratings,reflections:d.reflections});

// Watch / Make / Reflect for a Videography module. Make is where work is handed in;
// Reflect shows the AI review next to the learner's own rating.
export function VideoLesson({moduleKey:key}:{moduleKey:string}){
 const {s,loaded}=useLearning();
 const parsed=parseVideoKey(key)!;
 const [tab,setTab]=useState('watch');
 const [reviewNow,setReviewNow]=useState('');
 useEffect(()=>{const t=new URLSearchParams(window.location.search).get('tab');if(t==='make'||t==='reflect')setTab(t)},[]);
 const mods=modulesFor(parsed.level),lesson=moduleLesson(parsed.module,projectLabel(s.programme));
 const prev=parsed.index>0?moduleKey(parsed.level,parsed.index-1):null,next=parsed.index<mods.length-1?moduleKey(parsed.level,parsed.index+1):null;
 return <div className="vg-lesson">
  <div className="breadcrumbs"><a href="/workspace">My journey</a><span>/</span><a href={'/explore/video-'+parsed.level}>All {parsed.level} modules</a></div>
  <div className="row between"><Badge>MODULE {parsed.index+1} / {mods.length}</Badge><span className="small"><Clock size={15}/> {parsed.module.hours} h</span></div>
  <h1>{lesson.title}</h1>
  <Tabs value={tab} onValueChange={setTab}>
   <TabsList className="learning-tabs"><TabsTrigger value="watch"><BookOpen/>Watch</TabsTrigger><TabsTrigger value="make"><Clapperboard/>Make</TabsTrigger><TabsTrigger value="reflect"><MessageCircle/>Reflect</TabsTrigger></TabsList>
   <TabsContent value="watch"><ModuleContext moduleKey={key} onMake={()=>setTab('make')}/></TabsContent>
   <TabsContent value="make">{loaded&&<MakeTab moduleKey={key} onHandedIn={id=>{setReviewNow(id);setTab('reflect')}}/>}</TabsContent>
   <TabsContent value="reflect">{loaded&&<ReflectTab moduleKey={key} requestFor={reviewNow}/>}</TabsContent>
  </Tabs>
  <div className="button-row between">{prev?<Go outline href={moduleHref(prev)}><ArrowLeft size={16}/>Previous module</Go>:<span/>}{next&&<Go outline href={moduleHref(next)}>Next module<ArrowRight size={16}/></Go>}</div>
 </div>;
}

function MakeTab({moduleKey:key,onHandedIn}:{moduleKey:string;onHandedIn:(id:string)=>void}){
 const {s,mutate,busy}=useLearning();
 const m=parseVideoKey(key)!.module,lesson=moduleLesson(m,projectLabel(s.programme));
 const [draft,setDraft]=useState<Draft>(emptyDraft);
 useEffect(()=>setDraft(readDraft(key)),[key]);
 const update=(patch:Partial<Draft>)=>setDraft(prev=>{const next={...prev,...patch};writeDraft(key,next);return next});
 const blocker=blockingModule(s,key);
 const entitled=isFreeModule(key)||isExplore(s)||['paid','active'].includes(s.craft?.status);
 const handedIn=s.submissions.filter((x:any)=>x.key===key).length;
 const selfCheck=needsSelfCheck(key),missing=handInMissing(m,toHandIn(draft),selfCheck);
 if(!entitled)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Choose Self-paced to do this task.</h2><p>On the Free plan, only the tasks in the first two modules are open. Choose the Self-paced plan (₹999/year) to unlock this task and every task after it, with AI reviews and your portfolio. You can still watch this module for free.</p><div className="button-row"><Go href={'/membership?return_to='+encodeURIComponent(moduleHref(key))}>Choose Self-paced</Go><Go outline href="/mentors">Learn with a mentor</Go></div></Panel>;
 if(blocker)return <Panel className="vg-locked"><LockKeyhole size={26}/><h2>Hand in the module before this one first.</h2><p>Finish “{moduleInfo(blocker).lesson.title}” to unlock this task. You can still watch this module.</p><Go href={moduleHref(blocker)+'?tab=make'}>Go to that module</Go></Panel>;
 async function handIn(){
  const state=await mutate('video_submit',{key,answer:draft.answer,notes:draft.notes,url:draft.url,uploadIds:draft.files.map(f=>f.id),ratings:draft.ratings,reflections:draft.reflections});
  if(!state)return;
  const piece=state.submissions.find((x:any)=>x.key===key);
  try{localStorage.removeItem(draftKey(key))}catch{}
  setDraft(emptyDraft());onHandedIn(piece?.id||'');
 }
 return <Gate><div className="vg-make">
  <Panel className="vg-task"><span className="eyebrow">YOUR TASK</span><p>{lesson.do}</p><p className="small"><strong>Good work looks like this:</strong> {m.evidence}</p>{handedIn>0&&<p className="small">You have handed this in {handedIn} time{handedIn>1?'s':''}. Handing in again adds a new piece to My Work.</p>}</Panel>

  <Panel className="vg-form-block"><h2><FileText size={20}/> {m.handIn==='text'?'1. Write your answer':'1. Hand in your work'}</h2>
   {m.handIn==='text'&&<label>Your answer <span className="small">({draft.answer.trim().length}/80 characters minimum)</span><textarea rows={9} maxLength={6000} value={draft.answer} onChange={e=>update({answer:e.target.value})} placeholder="Write your answer here. You don’t need to upload a document."/></label>}
   <div className="vg-files"><span className="vg-label">{m.handIn==='text'?'Add photos or files (optional)':'Upload your work: up to 3 photos or videos, or add a video link'}</span>
    {draft.files.length>0&&<ul>{draft.files.map(f=><li key={f.id}><Upload size={14}/>{f.name}<button type="button" aria-label={'Remove '+f.name} onClick={()=>update({files:draft.files.filter(x=>x.id!==f.id)})}><X size={14}/></button></li>)}</ul>}
    {draft.files.length<maxHandInFiles&&<UploadField lessonKey={key} value={null} onUpload={(f:any)=>update({files:[...draft.files,{id:f.id,name:f.name,type:f.type}]})}/>}
    <p className="small">Need more than 3 pictures? Put them into one image (a collage), or add a link to a folder.</p>
    <label>Video or folder link (YouTube, Vimeo, Google Drive…)<input type="url" value={draft.url} onChange={e=>update({url:e.target.value})} placeholder="https://"/></label>
   </div>
   <label>{m.handIn==='text'?'Anything else to add? (optional)':'Tell us about your work'}<textarea rows={3} maxLength={2000} value={draft.notes} onChange={e=>update({notes:e.target.value})} placeholder="What did you make? What did you try?"/></label>
  </Panel>

  {selfCheck&&<><Panel className="vg-form-block"><h2>2. Rate your own work</h2><p className="small">Be honest. In Reflect, you’ll see how the AI rates the same checks.</p>
   {lesson.checks.map((check,i)=><fieldset key={check} className="vg-rate"><legend>{check}</legend><div>{ratingScale.map((label,v)=><button type="button" key={label} className={draft.ratings[i]===v?'selected':''} aria-pressed={draft.ratings[i]===v} onClick={()=>update({ratings:draft.ratings.map((r,j)=>j===i?v:r)})}><strong>{v}</strong>{label}</button>)}</div></fieldset>)}
  </Panel>

  <Panel className="vg-form-block"><h2>3. Think about it</h2>
   {reflectionQuestions.map(q=><label key={q.id}>{q.label}<textarea rows={2} maxLength={600} value={draft.reflections[q.id]} onChange={e=>update({reflections:{...draft.reflections,[q.id]:e.target.value}})}/></label>)}
  </Panel></>}

  {missing.length>0&&<p className="small" role="status">To hand in: {missing.join(' · ')}.</p>}
  <Action disabled={missing.length>0||busy} onClick={handIn}>Hand in my work</Action>
  <p className="small">Your work is saved in My Work automatically. You can remove it there at any time.</p>
 </div></Gate>;
}

type Review={id:string;submissionId?:string;createdAt:number;review:{total:number|null;summary:string;strength:string;improvement:string;nextStep:string;evidenceLimit:string;criteria:{label:string;rating:number|null;feedback:string}[]}};
function ReflectTab({moduleKey:key,requestFor}:{moduleKey:string;requestFor:string}){
 const {s}=useLearning();
 const piece=s.submissions.find((x:any)=>x.key===key);
 const [reviews,setReviews]=useState<Review[]|null>(null),[allowance,setAllowance]=useState<any>(null),[status,setStatus]=useState(''),[error,setError]=useState('');
 const started=useRef('');
 async function load(){try{const r=await fetch('/api/review?key='+encodeURIComponent(key));const d:any=await r.json();if(!r.ok)throw Error(d.error);setReviews(d.reviews);setAllowance(d.allowance);return d}catch(e:any){setError(e.message||'Reviews could not load.');return null}}
 async function requestReview(submissionId:string){
  if(started.current===submissionId)return;started.current=submissionId;setError('');setStatus('AI is reviewing your work. This can take up to a minute…');
  try{const r=await fetch('/api/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonKey:key,submissionId,requestId:crypto.randomUUID()})});const d:any=await r.json();if(!r.ok)throw Error(d.error);await load()}
  catch(e:any){setError(e.message||'AI review is not available right now.');started.current=''}finally{setStatus('')}
 }
 useEffect(()=>{if(piece)load()},[piece?.id]);
 // Straight after a hand-in, ask for the AI review automatically.
 useEffect(()=>{if(requestFor&&piece?.id===requestFor&&reviews&&!reviews.some(r=>r.submissionId===requestFor))requestReview(requestFor)},[requestFor,reviews]);
 if(!piece)return <Panel className="empty"><h2>Nothing to review yet.</h2><p>Hand in your work in Make. Then your AI review shows here.</p></Panel>;
 const review=reviews?.find(r=>r.submissionId===piece.id);
 const canReview=allowance?.eligible&&allowance.used<allowance.limit;
 const rated=Array.isArray(piece.selfRatings);
 return <div className="vg-reflect">
  {status&&<Panel><p role="status">{status}</p></Panel>}
  {review?<Panel className="vg-ai-review">
   <div className="row between"><h2><Sparkles size={20}/> AI review</h2>{review.review.total!==null?<strong className="vg-ai-score">{Math.round(review.review.total)}<small>/100</small></strong>:<Badge>Not enough to score every check</Badge>}</div>
   <p>{review.review.summary}</p>
   <table className="vg-compare"><thead><tr><th>Check</th>{rated&&<th>You</th>}<th>AI</th></tr></thead><tbody>{review.review.criteria.map((c,i)=>{const mine=piece.selfRatings?.[i];const gap=rated&&c.rating!==null&&mine!==undefined&&Math.abs(c.rating-mine)>=2;return <tr key={c.label} className={gap?'gap':''}><td><strong>{c.label}</strong><span className="small">{c.feedback}</span>{gap&&<span className="small vg-gap">You and the AI see this differently. Read the note above and try again.</span>}</td>{rated&&<td>{mine??'–'}/4</td>}<td>{c.rating??'–'}/4</td></tr>})}</tbody></table>
   <div className="vg-review-notes"><p><strong>What worked:</strong> {review.review.strength}</p><p><strong>What to improve:</strong> {review.review.improvement}</p><p><strong>Try next (under 30 minutes):</strong> {review.review.nextStep}</p><p className="small"><strong>What the AI couldn’t check:</strong> {review.review.evidenceLimit}</p></div>
  </Panel>:!status&&<Panel><h2>AI review</h2>
   {error&&<p role="alert" className="notice">{error}</p>}
   {canReview?<><p>Get feedback on the work you handed in.</p><Button onClick={()=>requestReview(piece.id)}>Get my AI review</Button></>:allowance&&<p>You have used both AI reviews for this module. Your own rating is below.</p>}
  </Panel>}
  {rated&&<Panel><h2>What you said</h2><p className="small">Your rating: {piece.selfScore}/100</p><p><strong>What went well:</strong> {piece.reflections?.well}</p><p><strong>What you would change:</strong> {piece.reflections?.change}</p></Panel>}
  {allowance&&<p className="small">AI reviews used for this module: {allowance.used} of {allowance.limit}.{allowance.used<allowance.limit?' Hand in again to use the other one.':''} The AI reads your text and photos. It can’t watch videos or open links.</p>}
  <div className="button-row"><Go href="/portfolio" outline>See it in My Work</Go></div>
 </div>;
}
