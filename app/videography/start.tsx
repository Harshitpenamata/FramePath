'use client';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronLeft,ChevronRight,Clock,Lock,Plus,Star,X,Gem,CalendarDays,Briefcase,FileText,PawPrint,Smartphone,TvMinimalPlay,Plane,Package,Music,UtensilsCrossed,Shirt,Home,PersonStanding,Presentation,Clapperboard,Film,Pause,Play} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,Go,Photo} from '../ui';
import type {PhotoSlot} from '../photos';
import './home.css';
import {BannerSymbols,banners} from './hero-banners';
import {track} from '../track';
import {courses,interests,interestFor,questionCount,nextQuestion,optionOrder,assess,schedule,levelNames,levelSummary,rhythm,maxHoursPerWeek,addDays,today,maxPlans,plansOf,type Level,type Answer,type Visual} from './programme';

const draftKey='fp-programme-draft-v3';
// seed: shuffles each question's answer order for this learner, so the position of an answer gives nothing away.
type Draft={seed:string;name?:string;age?:'adult'|'guardian';interests:string[];answers:Answer[];level?:Level;hoursPerWeek?:number;daysPerWeek:number;startDate:string};
const emptyDraft=():Draft=>({seed:Math.random().toString(36).slice(2),interests:[],answers:[],daysPerWeek:5,startDate:today()});
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

// Home (Studio Grid, reference screen 01). Content as on the live site: the pitch, the five crafts, the two ways
// to learn, the four steps and the closing call to action.
const crafts:{id:string;n:string;title:string;blurb:string;photo:PhotoSlot;live?:boolean}[]=[
 {id:'videography',n:'01',title:'Videography',blurb:'Plan, shoot, edit and share videos people watch to the end.',photo:'home-videography',live:true},
 {id:'photography',n:'02',title:'Photography',blurb:'Build a portfolio you’re proud to put your name on.',photo:'home-photography'},
 {id:'filmmaking',n:'03',title:'Filmmaking',blurb:'Take a story from idea to finished film.',photo:'home-filmmaking'},
 {id:'animation',n:'04',title:'Animation · 2D | 3D',blurb:'Bring characters and worlds to life.',photo:'home-animation'},
 {id:'motion-graphics',n:'05',title:'Motion Graphics',blurb:'Make text and shapes move with purpose.',photo:'home-motion'},
];
// Home banner: the five designed banners (hero-banners.tsx), live text beside flat drawings, changing every 5
// seconds. Pauses while a keyboard user is in it and with the pause button, and stays still for people who ask their
// device for reduced motion. The first banner's headline is the page's h1; the others are h2s.
function HeroSlides({actions}:{actions:React.ReactNode}){
 const [at,setAt]=useState(0),[paused,setPaused]=useState(false),[held,setHeld]=useState(false),[still,setStill]=useState(false);
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');setStill(m.matches||document.documentElement.classList.contains('ui-reduced-motion'))},[]);
 const n=banners.length,go=(i:number)=>setAt((i+n)%n);
 useEffect(()=>{if(paused||held||still)return;const t=setTimeout(()=>go(at+1),5000);return ()=>clearTimeout(t)},[at,paused,held,still]);
 return <section className="hm-hero hm-banner" aria-roledescription="carousel" aria-label="About Framepath" onFocus={e=>{if(e.target.matches(':focus-visible'))setHeld(true)}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setHeld(false)}}>
  <BannerSymbols/>
  <div className="hm-banner-frame">{banners.map((x,i)=>{const H=i===0?'h1':'h2';return <article key={i} className={'hb-slide'+(i===at?' on':'')} aria-hidden={i!==at} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${n}`}>
   <div className="hb-copy"><p className="hb-eyebrow">{x.eyebrow}</p><H className="hb-head">{x.head}</H><p className="hb-line">{x.line}</p></div>{x.art}</article>})}</div>
  <div className="hm-banner-bar">
   {actions}
   <div className="hm-slide-nav">
    <button type="button" className="sg-arrow" aria-label="Previous slide" onClick={()=>go(at-1)}><ChevronLeft size={18}/></button>
    <span className="hm-slide-dots">{banners.map((_,i)=><button key={i} type="button" aria-label={`Slide ${i+1}`} aria-current={i===at?'true':undefined} onClick={()=>go(i)}/>)}</span>
    <button type="button" className="sg-arrow" aria-label="Next slide" onClick={()=>go(at+1)}><ChevronRight size={18}/></button>
    {!still&&<button type="button" className="hm-slide-pause" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Play slides':'Pause slides'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>}
   </div>
  </div>
 </section>;
}

export function VideographyHome(){
 const {s,loaded}=useLearning();
 const startHref=loaded&&s.programme?'/workspace':'/start',startLabel=loaded&&s.programme?'Continue my pathway':'Build my free pathway';
 return <div className="hm">
  <HeroSlides actions={<div className="button-row"><Go href={startHref}>{startLabel}<ArrowRight size={18}/></Go><Go href="#crafts" outline>Explore courses</Go></div>}/>

  <section className="hm-grid" id="crafts" aria-label="Choose your craft">
   <div className="hm-intro"><h2 className="display">Pick your craft. We’ll build the path.</h2><p>Each course runs from beginner to advanced, designed by industry practitioners.</p><a className="sg-arrow" href={startHref} aria-label={startLabel}><ArrowRight size={18}/></a></div>
   {crafts.map(c=>{const body=<><Photo slot={c.photo} className="hm-craft-photo"/><strong className="display">{c.title}</strong><span className="hm-craft-blurb">{c.blurb}</span><span className="hm-craft-foot">{c.live?<>Start · Phase 1</>:<>Coming soon</>}<span className="sg-arrow"><ArrowRight size={16}/></span></span>{c.live&&<span className="hm-live">Live now</span>}</>;
    return c.live?<a key={c.id} href={startHref} className="hm-craft live">{body}</a>:<div key={c.id} className="hm-craft" aria-disabled="true">{body}</div>})}
  </section>

  <section className="hm-ways"><h2 className="display">Learn your way.</h2>
   <div className="hm-way-grid">
    <article className="hm-way"><span className="hm-num">1</span><h3>Self-paced with AI</h3><p>Learn on your schedule. Get AI-driven assignments and instant, specific feedback on your work.</p><ul>{['AI-driven assignments','Instant feedback on your work','Start any time, go at your pace'].map(x=><li key={x}><Check size={16}/>{x}</li>)}</ul></article>
    <article className="hm-way"><span className="hm-num">2</span><h3>Mentor-led program</h3><p>Learn alongside working professionals with live guidance, reviews and accountability.</p><ul>{['Live sessions with industry mentors','Personal reviews of your work','Cohort accountability'].map(x=><li key={x}><Check size={16}/>{x}</li>)}</ul></article>
   </div>
   <p className="small">Not sure which fits? Your pathway report will recommend one.</p>
  </section>

  <section className="hm-how"><h2 className="display">Your personal pathway in four steps.</h2>
   <ol>{[['Tell us your craft','Choose the interests you want to build.'],['Check your level','12 quick questions so you start in the right place.'],['Set your time','Tell us your hours per week and we’ll plan around your life.'],['Get your pathway','A personal roadmap with milestones and clear dates.']].map(([t,d],i)=><li key={t}><span className="hm-num">{i+1}</span><strong>{t}</strong><p>{d}</p></li>)}</ol>
  </section>

  <section className="hm-cta"><div><h2 className="display">Ready to find your path?</h2><p>Answer 12 quick questions. Get a pathway built for you, with clear dates.</p></div><Go href={startHref}>{startLabel}<ArrowRight size={18}/></Go></section>
 </div>;
}

// A picture answer: a lesson image with a brightness filter, a colour tint, a crop and an optional thirds grid.
function OptionPicture({v}:{v:Visual}){
 return <span className="vg-q-visual" style={{backgroundImage:`url(${v.src})`,backgroundSize:(v.zoom??1)*100+'%',backgroundPosition:`${v.x??50}% ${v.y??50}%`,filter:v.filter}} aria-hidden="true">{v.tint&&<i style={{background:v.tint}}/>}{v.grid&&<b/>}</span>;
}
const interestIcons:Record<string,any>={wedding:Gem,events:CalendarDays,corporate:Briefcase,documentary:FileText,wildlife:PawPrint,social:Smartphone,youtube:TvMinimalPlay,travel:Plane,advertising:Package,music:Music,food:UtensilsCrossed,fashion:Shirt,'real-estate':Home,sports:PersonStanding,education:Presentation,'short-film':Clapperboard};
const steps=['Interests','12 questions','Your time','Review'] as const;

export function ProgrammeStart(){
 const {s,user,loaded,mutate,busy}=useLearning();
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
 // The level comes from the check; learners move up later by finishing a level.
 const level:Level=result?.level||'beginner';
 const plan=schedule(level,draft.hoursPerWeek,draft.startDate,draft.daysPerWeek);

 async function create(){
  setError('');
  if(!user){writeDraft(draft);window.location.assign('/auth/google?return_to='+encodeURIComponent('/start?finish=1'));return}
  const saved=await mutate('programme_save',{programme:{course:'videography',age:draft.age,interests:draft.interests,answers:draft.answers,level,hoursPerWeek:plan.hoursPerWeek,daysPerWeek:plan.daysPerWeek,startDate:plan.startDate,name:draft.name||''}});
  if(saved){clearDraft();const made=(saved as any).programme?.id;window.location.assign(made?'/workspace/'+made:'/workspace')}else setError('Your plan could not be saved. Your answers are still here.');
 }
 // Returning from Google sign-in: finish automatically with the saved draft.
 useEffect(()=>{if(!loaded||!user||autoFinished.current)return;if(new URLSearchParams(window.location.search).get('finish')==='1'){const d=readDraft();if(d.interests.length&&d.answers.length===questionCount){autoFinished.current=true;setDraft(d);setStep(3)}}},[loaded,user]);

 // Up to three plans at a time: a fourth needs one deleted first.
 if(loaded&&user&&plansOf(s).length>=maxPlans)return <Panel className="vg-empty"><span className="eyebrow">MY COURSES</span><h1>You have {maxPlans} plans</h1><p className="lede">You can follow up to {maxPlans} plans at a time. Delete one from its page to make another.</p><Go href="/workspace">My courses</Go></Panel>;
 const side=[{title:'What do you want to film?',text:<>Pick as many as you like. Your <strong>first</strong> pick becomes your main project.</>},
  {title:'Level check.',text:<>Pick what you really did, not what sounds best. Honest answers give you a plan that isn’t too easy or too hard.</>},
  {title:result?'Your level: '+levelNames[level]:'Your time.',text:result?<>{levelSummary[level]}. This is where your answers put you. Finish this level to move up.</>:null},
  {title:'Your Videography plan.',text:<>Check it, then create it. You can change your hours and start date later.</>}][step];
 return <div className="sp">
  <section className="sp-side"><h1>{side.title}</h1>{side.text&&<p className="lede">{side.text}</p>}{step===0&&<Photo slot="interests" className="sp-photo"/>}</section>
  <div className="sp-card">
  <ol className="vg-stepper sp-stepper" aria-label="Plan setup steps">{steps.map((label,i)=><li key={label} className={i===step?'current':i<step?'done':''}><span>{i<step?<Check size={14}/>:i+1}</span>{label}</li>)}</ol>

  {step===0&&<Panel className="vg-panel">
   <span className="eyebrow">Videography · step 1</span>
   <div className="sp-tiles" role="group" aria-label="What do you want to film?">{interests.map(i=>{const at=draft.interests.indexOf(i.id),Icon=interestIcons[i.id]||Film;return <button type="button" key={i.id} aria-pressed={at>=0} className={'sp-tile'+(at>=0?' on':'')} onClick={()=>{if(!draft.interests.length&&at<0)track('plan_started',{interest:i.id});update({interests:at>=0?draft.interests.filter(x=>x!==i.id):[...draft.interests,i.id]})}}><Icon size={20}/><span>{i.label}</span>{at>=0&&<b aria-label={at===0?'Main project':'Pick '+(at+1)}>{at+1}</b>}</button>})}</div>
   {draft.interests.length>0&&<ol className="vg-chosen">{draft.interests.map((id,i)=><li key={id}>{i===0?<Star size={14} aria-label="Primary"/>:<span className="vg-rank">{i+1}</span>}{interestFor(id)?.label}{i>0&&<button type="button" className="vg-link" onClick={()=>update({interests:[id,...draft.interests.filter(x=>x!==id)]})}>Make main</button>}<button type="button" aria-label={'Remove '+interestFor(id)?.label} onClick={()=>update({interests:draft.interests.filter(x=>x!==id)})}><X size={14}/></button></li>)}</ol>}
   {draft.interests[0]&&<p className="small">Main project: <strong>{interestFor(draft.interests[0])!.label}</strong></p>}
   {!s.consent&&<fieldset className="vg-age"><legend>How old are you?</legend>
    {([['adult','I’m 18 or older'],['guardian','I’m 13 to 17, and a parent or guardian agrees I can use FramePath']] as const).map(([id,label])=><label key={id}><input type="radio" name="age" checked={draft.age===id} onChange={()=>update({age:id})}/> {label}</label>)}
    <p className="small">FramePath isn’t for children under 13. Learners under 18 can share their portfolio by link, but not publicly in Community.</p></fieldset>}
   <div className="button-row"><Button disabled={!draft.interests.length||(!s.consent&&!draft.age)} onClick={()=>setStep(draft.answers.length===questionCount?2:1)}>Next: 12 quick questions <ArrowRight size={16}/></Button></div>
  </Panel>}

  {step===1&&<Panel className="vg-panel">
   <div className="row between"><span className="eyebrow">Level check · question {Math.min(draft.answers.length+1,questionCount)} of {questionCount}</span></div>
   <div className="vg-progress" role="progressbar" aria-label="Level check progress" aria-valuemin={0} aria-valuemax={questionCount} aria-valuenow={draft.answers.length}><span style={{width:`${draft.answers.length/questionCount*100}%`}}/></div>
   {current?<>
    {current.kind==='check'&&<span className="vg-check-tag">Quick skill check</span>}
    <h2 className="vg-question">{current.prompt}</h2>
    <div className={'vg-options'+(current.options.some(o=>o.visual)?' visual':'')} role="group" aria-label={current.prompt}>{optionOrder(current,draft.seed).map((i,k)=>{const o=current.options[i];return <button type="button" key={current.id+i} className="vg-option" onClick={()=>answer(i)}>{o.visual?<><OptionPicture v={o.visual}/>{'Picture '+String.fromCharCode(65+k)}</>:<><span>{String.fromCharCode(65+k)}</span>{o.text}</>}</button>})}</div>
    <p className="small">{current.kind==='check'?'One answer is right. If you don’t know, pick “Not sure”. Guessing only gives you a plan that’s too hard.':'Pick what you really did, not what sounds best. Honest answers give you a plan that isn’t too easy or too hard.'}</p>
   </>:<><h2 className="vg-question">All done. Let’s see your level.</h2></>}
   <div className="button-row"><Button variant="outline" onClick={back}><ArrowLeft size={16}/>Back</Button>{done&&<Button onClick={()=>setStep(2)}>See my level <ArrowRight size={16}/></Button>}</div>
  </Panel>}

  {step===2&&result&&<Panel className="vg-panel">
   <span className="eyebrow">Step 3 · your time</span>
   <p className="small">Skill checks: {result.checks.right} of {result.checks.total} right.</p>
   <div className="vg-time-grid">
    <div className="vg-stat"><Clock size={20}/><strong>{plan.recommendedHoursPerWeek} h / week</strong><span>Suggested for {rhythm[level].hours} hours of learning</span></div>
    <div className="vg-stat"><strong>{plan.weeks} weeks</strong><span>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</span></div>
    <div className="vg-stat"><strong>≈ {plan.minutesPerDay} min / day</strong><span>over {plan.daysPerWeek} days a week</span></div>
   </div>
   <label className="vg-field">Hours per week: <strong>{plan.hoursPerWeek} h</strong><input type="range" min={plan.recommendedHoursPerWeek} max={maxHoursPerWeek} step={1} value={plan.hoursPerWeek} onChange={e=>update({hoursPerWeek:Number(e.target.value)})}/><span className="small">Add more hours to finish sooner. You can’t go below the suggested time.</span></label>
   <div className="vg-field-row">
    <label className="vg-field">Days per week<select value={plan.daysPerWeek} onChange={e=>update({daysPerWeek:Number(e.target.value)})}>{[3,4,5,6,7].map(d=><option key={d} value={d}>{d} days</option>)}</select></label>
    <label className="vg-field">Start date<input type="date" min={today()} max={addDays(today(),180)} value={plan.startDate} onChange={e=>{const v=e.target.value;update({startDate:v&&v>=today()&&v<=addDays(today(),180)?v:today()})}}/></label>
   </div>
   <div className="button-row"><Button variant="outline" onClick={()=>setStep(1)}><ArrowLeft size={16}/>Back</Button><Button onClick={()=>setStep(3)}>Check my plan <ArrowRight size={16}/></Button></div>
  </Panel>}

  {step===3&&result&&<Panel className="vg-panel">
   <span className="eyebrow">Step 4 · review</span>
   <label className="vg-field">Pathway name<input value={draft.name??''} maxLength={60} placeholder={'Videography · '+(interestFor(draft.interests[0])?.pathway||'')} onChange={e=>update({name:e.target.value})}/><span className="small">Optional. You can change it later on your plan.</span></label>
   <dl className="vg-review">
    <div><dt>Course</dt><dd>Videography</dd></div>
    <div><dt>Pathway</dt><dd>{interestFor(draft.interests[0])?.pathway}</dd></div>
    <div><dt>Interests</dt><dd>{draft.interests.map(id=>interestFor(id)?.label).join(', ')}</dd></div>
    <div><dt>Level</dt><dd>{levelNames[level]} · {rhythm[level].hours} hours</dd></div>
    <div><dt>Time</dt><dd>{plan.hoursPerWeek} h/week for {plan.weeks} weeks</dd></div>
    <div><dt>Dates</dt><dd>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</dd></div>
   </dl>
   {!user&&loaded&&<p className="notice">Sign in with Google to save your plan. Until then, your answers stay on this device.</p>}
   {error&&<p role="alert" className="notice">{error}</p>}
   <div className="button-row"><Button variant="outline" onClick={()=>setStep(2)}><ArrowLeft size={16}/>Back</Button><Button disabled={busy||!loaded} onClick={create}>{busy?'Creating your plan…':user?'Create my plan':'Sign in with Google and create'}<ArrowRight size={16}/></Button></div>
  </Panel>}
  {step===3&&!result&&<Panel><p>Finish the level check first.</p><Button onClick={()=>setStep(1)}>Open level check</Button></Panel>}
  </div>
 </div>;
}
