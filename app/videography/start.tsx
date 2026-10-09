'use client';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronLeft,ChevronRight,Clock,Lock,Plus,Star,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,Go} from '../ui';
import {courses,interests,interestFor,questionCount,nextQuestion,assess,schedule,levelNames,levelSummary,rhythm,maxHoursPerWeek,addDays,today,type Level,type Answer} from './programme';

const draftKey='fp-programme-draft-v2';
type Draft={interests:string[];answers:Answer[];level?:Level;hoursPerWeek?:number;daysPerWeek:number;startDate:string};
const emptyDraft=():Draft=>({interests:[],answers:[],daysPerWeek:5,startDate:today()});
function readDraft():Draft{try{const d=JSON.parse(localStorage.getItem(draftKey)||'null');if(d&&Array.isArray(d.answers))return {...emptyDraft(),...d}}catch{}return emptyDraft()}
function writeDraft(d:Draft){try{localStorage.setItem(draftKey,JSON.stringify(d))}catch{}}
export function clearDraft(){try{localStorage.removeItem(draftKey)}catch{}}
export const formatDate=(iso:string)=>new Date(iso+'T00:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});

export function CourseCarousel(){
 const track=useRef<HTMLDivElement>(null);
 const scroll=(dir:number)=>track.current?.scrollBy({left:dir*track.current.clientWidth*0.8,behavior:'smooth'});
 return <section className="vg-carousel" aria-label="Creative courses">
  <div className="vg-carousel-head"><div><span className="eyebrow">CREATIVE COURSES</span><h2>Choose what you want to create.</h2></div>
   <div className="vg-carousel-nav"><Button variant="outline" size="icon" aria-label="Previous courses" onClick={()=>scroll(-1)}><ChevronLeft/></Button><Button variant="outline" size="icon" aria-label="Next courses" onClick={()=>scroll(1)}><ChevronRight/></Button></div></div>
  <div className="vg-track" ref={track}>
   {courses.map((c,i)=>c.active
    ?<a key={c.id} className="vg-course active" href="/start"><span className="vg-course-num">{String(i+1).padStart(2,'0')}</span><h3>{c.title}</h3><p>{c.blurb}</p><span className="vg-course-cta">Start · Phase 1 <ArrowRight size={16}/></span></a>
    :<div key={c.id} className="vg-course disabled" aria-disabled="true"><span className="vg-course-num">{String(i+1).padStart(2,'0')}</span><h3>{c.title}</h3><p>{c.blurb}</p><span className="vg-course-cta"><Lock size={14}/> Coming soon</span></div>)}
  </div>
 </section>;
}

export function VideographyHome(){
 const {s,loaded}=useLearning();
 return <div className="vg-home">
  <section className="vg-hero"><span className="eyebrow">FRAMEPATH · CREATIVE LEARNING</span><h1>Learn the craft you want to create.</h1><p className="lede">Pick a course and tell us what you like to film. Answer 12 quick questions. Get a learning plan with clear dates.</p>
   <div className="button-row">{loaded&&s.programme?<Go href="/workspace">Continue my plan</Go>:<Go href="/start">Start with Videography</Go>}<Go href="#courses" outline>See all courses</Go></div></section>
  <div id="courses"><CourseCarousel/></div>
  <section className="vg-steps"><div><strong>1</strong><span>Choose interests</span></div><div><strong>2</strong><span>12-question level check</span></div><div><strong>3</strong><span>Set your time</span></div><div><strong>4</strong><span>Get your pathway report</span></div></section>
 </div>;
}

const steps=['Interests','12 questions','Your time','Review'] as const;

export function ProgrammeStart(){
 const {user,loaded,mutate,busy}=useLearning();
 const [draft,setDraft]=useState<Draft>(emptyDraft);
 const [step,setStep]=useState(0);
 const [error,setError]=useState('');
 const autoFinished=useRef(false);
 useEffect(()=>{const d=readDraft();setDraft(d);if(d.interests.length)setStep(d.answers.length===questionCount?2:1)},[]);
 const update=(patch:Partial<Draft>)=>setDraft(prev=>{const next={...prev,...patch};writeDraft(next);return next});
 const current=nextQuestion(draft.answers);
 const done=!current;
 const result=useMemo(()=>{if(!done)return null;try{return assess(draft.answers)}catch{return null}},[done,draft.answers]);
 // Each answer is final for this step; the next question depends on it.
 function answer(i:number){if(current)update({answers:[...draft.answers,{q:current.id,a:i}],level:undefined})}
 function back(){if(!draft.answers.length){setStep(0);return}update({answers:draft.answers.slice(0,-1),level:undefined})}
 const level:Level=draft.level||result?.level||'beginner';
 const plan=schedule(level,draft.hoursPerWeek,draft.startDate,draft.daysPerWeek);

 async function create(){
  setError('');
  if(!user){writeDraft(draft);window.location.assign('/auth/google?return_to='+encodeURIComponent('/start?finish=1'));return}
  const saved=await mutate('programme_save',{programme:{course:'videography',interests:draft.interests,answers:draft.answers,level,hoursPerWeek:plan.hoursPerWeek,daysPerWeek:plan.daysPerWeek,startDate:plan.startDate}});
  if(saved){clearDraft();window.location.assign('/workspace')}else setError('Your plan could not be saved. Your answers are still here.');
 }
 // Returning from Google sign-in: finish automatically with the saved draft.
 useEffect(()=>{if(!loaded||!user||autoFinished.current)return;if(new URLSearchParams(window.location.search).get('finish')==='1'){const d=readDraft();if(d.interests.length&&d.answers.length===questionCount){autoFinished.current=true;setDraft(d);setStep(3)}}},[loaded,user]);

 return <div className="vg-flow">
  <ol className="vg-stepper" aria-label="Plan setup steps">{steps.map((label,i)=><li key={label} className={i===step?'current':i<step?'done':''}><span>{i<step?<Check size={14}/>:i+1}</span>{label}</li>)}</ol>

  {step===0&&<Panel className="vg-panel">
   <span className="eyebrow">VIDEOGRAPHY · STEP 1</span><h1>What do you want to film?</h1>
   <p className="lede">Pick as many as you like. Your <strong>first</strong> pick becomes your main project.</p>
   {draft.interests.length>0&&<ol className="vg-chosen">{draft.interests.map((id,i)=><li key={id}>{i===0?<Star size={14} aria-label="Primary"/>:<span className="vg-rank">{i+1}</span>}{interestFor(id)?.label}{i>0&&<button type="button" className="vg-link" onClick={()=>update({interests:[id,...draft.interests.filter(x=>x!==id)]})}>Make main</button>}<button type="button" aria-label={'Remove '+interestFor(id)?.label} onClick={()=>update({interests:draft.interests.filter(x=>x!==id)})}><X size={14}/></button></li>)}</ol>}
   <div className="vg-chips">{interests.filter(i=>!draft.interests.includes(i.id)).map(i=><button type="button" key={i.id} className="vg-chip" onClick={()=>update({interests:[...draft.interests,i.id]})}><Plus size={14}/>{i.label}</button>)}</div>
   {draft.interests[0]&&<p className="small">Main project: <strong>{interestFor(draft.interests[0])!.label}</strong></p>}
   <div className="button-row"><Button disabled={!draft.interests.length} onClick={()=>setStep(draft.answers.length===questionCount?2:1)}>Next: 12 quick questions <ArrowRight size={16}/></Button></div>
  </Panel>}

  {step===1&&<Panel className="vg-panel">
   <div className="row between"><span className="eyebrow">LEVEL CHECK · QUESTION {Math.min(draft.answers.length+1,questionCount)} OF {questionCount}</span></div>
   <div className="vg-progress" role="progressbar" aria-label="Level check progress" aria-valuemin={0} aria-valuemax={questionCount} aria-valuenow={draft.answers.length}><span style={{width:`${draft.answers.length/questionCount*100}%`}}/></div>
   {current?<>
    <h2 className="vg-question">{current.prompt}</h2>
    <div className="vg-options" role="group" aria-label={current.prompt}>{current.options.map((o,i)=><button type="button" key={current.id+i} className="vg-option" onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>
    <p className="small">Pick the answer most like you. There are no wrong answers. Questions get easier or harder as you go.</p>
   </>:<><h2 className="vg-question">All done. Let’s see your level.</h2></>}
   <div className="button-row"><Button variant="outline" onClick={back}><ArrowLeft size={16}/>Back</Button>{done&&<Button onClick={()=>setStep(2)}>See my level <ArrowRight size={16}/></Button>}</div>
  </Panel>}

  {step===2&&result&&<Panel className="vg-panel">
   <span className="eyebrow">STEP 3 · YOUR TIME</span>
   <h1>Your level: <span className="vg-level">{levelNames[level]}</span></h1>
   <p className="lede">{levelSummary[level]}. You can pick a different level if you like.</p>
   <div className="vg-level-switch" role="radiogroup" aria-label="Starting level">{(['beginner','intermediate','advanced'] as Level[]).map(l=><button type="button" role="radio" aria-checked={level===l} key={l} className={level===l?'selected':''} onClick={()=>update({level:l===result.level?undefined:l,hoursPerWeek:undefined})}>{levelNames[l]}{l===result.level&&<small>Recommended</small>}</button>)}</div>
   <div className="vg-time-grid">
    <div className="vg-stat"><Clock size={20}/><strong>{plan.recommendedHoursPerWeek} h / week</strong><span>Suggested for {rhythm[level].hours} hours of learning</span></div>
    <div className="vg-stat"><strong>{plan.weeks} weeks</strong><span>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</span></div>
    <div className="vg-stat"><strong>≈ {plan.minutesPerDay} min / day</strong><span>over {plan.daysPerWeek} days a week</span></div>
   </div>
   <label className="vg-field">Hours per week: <strong>{plan.hoursPerWeek} h</strong><input type="range" min={plan.recommendedHoursPerWeek} max={maxHoursPerWeek} step={1} value={plan.hoursPerWeek} onChange={e=>update({hoursPerWeek:Number(e.target.value)})}/><span className="small">Add more hours to finish sooner. You can’t go below the suggested time.</span></label>
   <div className="vg-field-row">
    <label className="vg-field">Days per week<select value={plan.daysPerWeek} onChange={e=>update({daysPerWeek:Number(e.target.value)})}>{[3,4,5,6,7].map(d=><option key={d} value={d}>{d} days</option>)}</select></label>
    <label className="vg-field">Start date<input type="date" min={today()} max={addDays(today(),180)} value={plan.startDate} onChange={e=>update({startDate:e.target.value||today()})}/></label>
   </div>
   <div className="button-row"><Button variant="outline" onClick={()=>setStep(1)}><ArrowLeft size={16}/>Back</Button><Button onClick={()=>setStep(3)}>Check my plan <ArrowRight size={16}/></Button></div>
  </Panel>}

  {step===3&&result&&<Panel className="vg-panel">
   <span className="eyebrow">STEP 4 · REVIEW</span><h1>Your Videography plan</h1>
   <dl className="vg-review">
    <div><dt>Course</dt><dd>Videography</dd></div>
    <div><dt>Interests</dt><dd>{draft.interests.map(id=>interestFor(id)?.label).join(', ')}</dd></div>
    <div><dt>Level</dt><dd>{levelNames[level]} · {rhythm[level].hours} hours</dd></div>
    <div><dt>Time</dt><dd>{plan.hoursPerWeek} h/week for {plan.weeks} weeks</dd></div>
    <div><dt>Dates</dt><dd>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</dd></div>
   </dl>
   {!user&&loaded&&<p className="notice">Sign in with Google to save your plan. Until then, your answers stay on this device.</p>}
   {error&&<p role="alert" className="notice">{error}</p>}
   <div className="button-row"><Button variant="outline" onClick={()=>setStep(2)}><ArrowLeft size={16}/>Back</Button><Button disabled={busy||!loaded} onClick={create}>{user?'Create my plan':'Sign in with Google and create'}<ArrowRight size={16}/></Button></div>
  </Panel>}
  {step===3&&!result&&<Panel><p>Finish the level check first.</p><Button onClick={()=>setStep(1)}>Open level check</Button></Panel>}
 </div>;
}
