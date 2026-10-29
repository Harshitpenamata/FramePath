'use client';
import React,{useState} from 'react';
import {ArrowRight,BookOpen,Pencil,TriangleAlert,CalendarClock,Check,ChevronDown,Gift,Lock,PlayCircle,Plus,Sparkles,Target,Trash2,UserRound,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {useLearning,Panel,Go,Badge,isExplore,Photo,confirmAction} from '../ui';
import './dashboard.css';
import {stageOrder,liveSkills,behindBy,moduleArea,levelNames,levelSummary,levels,skillAreas,interestFor,pathwayOutcomes,finalProject,modulesFor,moduleKey,moduleLesson,projectLabel,freeModuleCount,isFreeModule,maxHoursPerWeek,addDays,today,schedule,maxPlans,plansOf,planTitle,defaultPlanTitle,courseId,courseNames,type Programme,type Level,type Mode} from './programme';
import {formatDate} from './start';
import {lessonsFor,resumeLesson,continueHref} from './lessons';
import {ReportProblem} from '../support';
import {track} from '../track';

const stageColor:Record<string,string>={Ideas:'var(--vg-s1)',Planning:'var(--vg-s2)',Filming:'var(--vg-s3)',Editing:'var(--vg-s4)','Your pathway':'var(--vg-s5)','Working with people':'var(--vg-s7)','Final project':'var(--vg-s6)'};

// Week ranges per stage when modules run in order at the learner's weekly hours.
function stageTimeline(p:Programme){
 const mods=modulesFor(p.level);let hoursBefore=0;
 return stageOrder.map(stage=>{const ms=mods.filter(m=>m.stageLabel===stage);const hours=ms.reduce((n,m)=>n+m.hours,0);const startWeek=Math.floor(hoursBefore/p.schedule.hoursPerWeek)+1;hoursBefore+=hours;const endWeek=Math.max(startWeek,Math.ceil(hoursBefore/p.schedule.hoursPerWeek));return {stage,hours,modules:ms,startWeek,endWeek}}).filter(s=>s.hours>0);
}
function overview(p:Programme){
 const sorted=skillAreas.map(a=>({...a,score:p.assessment.areas[a.id]})).sort((a,b)=>b.score-a.score);
 const strong=sorted.slice(0,2).map(a=>a.label.toLowerCase()),gaps=sorted.slice(-2).map(a=>a.label.toLowerCase());
 const primary=interestFor(p.interests[0]);
 return `You start at ${levelNames[p.level]} level. You are strongest in ${strong.join(' and ')}. You will get extra practice in ${gaps.join(' and ')}. There are ${modulesFor(p.level).length} modules. You go from ideas to planning, filming and editing. Then you make a ${(primary?.label||'').toLowerCase()} project and a final video of your own.`;
}

export function HeatMap({p,live}:{p:Programme;live?:ReturnType<typeof liveSkills>}){
 // Each skill row fills the level columns its score reaches: <40 Beginner, 40–69 Intermediate, 70+ Advanced.
 const band=(score:number)=>score>=70?2:score>=40?1:0;
 return <div className="vg-heat" role="table" aria-label="Current level by skill area">
  <div role="row" className="vg-heat-row head"><span role="columnheader">Skill area</span>{levels.map(l=><span role="columnheader" key={l}>{levelNames[l]}</span>)}<span role="columnheader">Score</span></div>
  {skillAreas.map(a=>{const l=live?.[a.id],score=l?l.now:p.assessment.areas[a.id];const b=band(score);return <div role="row" className="vg-heat-row" key={a.id}><span role="rowheader">{a.label}</span>{levels.map((l,i)=><span role="cell" key={l} className="vg-heat-cell" data-on={i<=b} aria-label={i<=b?levelNames[l]+' reached':levelNames[l]+' not yet'}/>)}<span role="cell" className="vg-heat-score">{score}{l&&l.evidence>0&&l.now!==l.start&&<small className={l.now>l.start?'up':'down'}> was {l.start}</small>}</span></div>})}
 </div>;
}

function PathwayInfographic({p}:{p:Programme}){
 const t=stageTimeline(p);const total=t.reduce((n,s)=>n+s.hours,0);
 return <div className="vg-infographic">
  <div className="vg-bar" aria-hidden="true">{t.map(s=><span key={s.stage} style={{flexGrow:s.hours,background:stageColor[s.stage]}}/>)}</div>
  <ol className="vg-stages">{t.map(s=><li key={s.stage}><span className="vg-dot" style={{background:stageColor[s.stage]}}/><div><strong>{s.stage}</strong><span className="small">{s.hours} h · weeks {s.startWeek}{s.endWeek>s.startWeek?'–'+s.endWeek:''} · {Math.round(s.hours/total*100)}%</span><span className="vg-stage-mods">{s.modules.map(m=>m.id).join(' · ')}</span></div></li>)}</ol>
 </div>;
}

// What the learner gains: the main skill from each stage, plus the style project and final video.
function PathwayOutcome({p}:{p:Programme}){
 const mods=modulesFor(p.level);
 const skills=['Ideas','Planning','Filming','Editing'].map(stage=>mods.filter(m=>m.stageLabel===stage).sort((a,b)=>b.hours-a.hours)[0]).filter(Boolean);
 return <Panel className="vg-card wide vg-outcome-card">
  <p className="lede">By the end, you will make {pathwayOutcomes[p.primaryPathway]}, and {finalProject[p.level]}.</p>
  <ul className="vg-outcomes">{skills.map(m=><li key={m.id}><Check size={16}/><span><strong>{m.stageLabel}:</strong> {m.outcome}</span></li>)}</ul>
 </Panel>;
}

// Start date: quick choices or any date in the next six months.
function nextMonday(){const d=new Date(today()+'T00:00:00Z');const add=((8-d.getUTCDay())%7)||7;return addDays(today(),add)}
function firstOfNextMonth(){const d=new Date(today()+'T00:00:00Z');return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)).toISOString().slice(0,10)}
function daysUntil(date:string){return Math.round((Date.parse(date)-Date.parse(today()))/86400000)}
function StartDate({p,busy,update}:{p:Programme;busy:boolean;update:(u:any)=>Promise<any>}){
 const start=p.schedule.startDate,n=daysUntil(start);
 const choices=[['Today',today()],['Next Monday',nextMonday()],['1st of next month',firstOfNextMonth()]];
 return <div className="vg-delay"><span className="vg-label">Start date</span>
  <p className="small">{n>0?`Your plan starts in ${n} day${n>1?'s':''}, on ${formatDate(start)}.`:n===0?'Your plan starts today.':`You started on ${formatDate(start)}.`} Change it if you need more time.</p>
  <div className="vg-chips" role="group" aria-label="Pick a start date">{choices.map(([label,date])=><button type="button" key={label} disabled={busy} aria-pressed={start===date} className={start===date?'selected':''} onClick={()=>update({startDate:date})}>{label}<small>{formatDate(date)}</small></button>)}</div>
  <label className="vg-field">Or pick a date <input type="date" min={today()} max={addDays(today(),180)} value={start>=today()?start:''} disabled={busy} onChange={e=>{const v=e.target.value;if(v&&v>=today()&&v<=addDays(today(),180))update({startDate:v})}}/></label>
 </div>;
}

const modes:{id:Mode;title:string;price:string;Icon:any;points:string[]}[]=[
 {id:'free',title:'Free',price:'₹0',Icon:BookOpen,points:['A learning path made for you','Videos, notes and pictures for every module',`Tasks in the first ${freeModuleCount} modules`]},
 {id:'self',title:'Self-paced',price:'₹999 / year',Icon:Sparkles,points:['Every task, with your work saved','AI checks and feedback on your work','Build a portfolio and track progress']},
];

// My courses (/workspace): the learner's plans as tiles, up to three across all courses. Opening one shows its page.
// The plan's name, which the learner can change, and its course ID (site edits, item 3).
function PlanName({p}:{p:Programme}){
 const {mutate,busy}=useLearning();
 const [editing,setEditing]=useState(false),[value,setValue]=useState('');
 const save=async(e:React.FormEvent)=>{e.preventDefault();if(await mutate('plan_rename',{id:p.id,name:value}))setEditing(false)};
 return <div className="db-name">
  {editing?<form className="db-rename" onSubmit={save}><label className="vg-field">Pathway name<input autoFocus name="planName" autoComplete="off" value={value} maxLength={60} placeholder={defaultPlanTitle(p)} onChange={e=>setValue(e.target.value)}/></label>
    <div className="button-row"><Button type="submit" disabled={busy}>{busy?'Saving…':'Save name'}</Button><Button type="button" variant="outline" onClick={()=>setEditing(false)}>Cancel</Button></div><p className="small">Leave it empty to use “{defaultPlanTitle(p)}”.</p></form>
   :<><h1>{p.name||p.primaryPathway}</h1><div className="db-id">{courseId(p)&&<span>Course ID <strong>{courseId(p)}</strong></span>}<button type="button" className="text-link" onClick={()=>{setValue(p.name||'');setEditing(true)}}><Pencil size={14}/>Rename</button></div></>}
 </div>;
}

// Under the stage strip: a nudge when the learner is behind (with new dates), a note when a stage is finished, and
// suggestions for skills their AI reviews show are weak.
function PlanNudges({p,live,reviews,mods}:{p:Programme;live:ReturnType<typeof liveSkills>;reviews:Record<string,any>;mods:ReturnType<typeof modulesFor>}){
 const {s,mutate,busy}=useLearning();
 const late=behindBy(p,s.progress);
 const finished=stageOrder.filter(st=>{const ms=mods.map((m,k)=>({m,k})).filter(x=>x.m.stageLabel===st);return ms.length>0&&ms.every(x=>s.progress?.[moduleKey(p.level,x.k)])});
 const latest=finished[finished.length-1],seenKey='fp-milestone-'+p.id+'-'+latest;
 const [seen,setSeen]=useState(true);
 React.useEffect(()=>{try{setSeen(!latest||localStorage.getItem(seenKey)==='1')}catch{setSeen(true)}},[seenKey]);
 const weak=skillAreas.filter(a=>live[a.id].evidence>0&&live[a.id].now<50).slice(0,2);
 const lessonFor=(area:string)=>{const i=mods.findIndex((m,k)=>moduleArea(m)===area&&reviews[moduleKey(p.level,k)]?.review?.revisit);return i<0?null:{key:moduleKey(p.level,i),title:mods[i].title,lesson:reviews[moduleKey(p.level,i)].review.revisit}};
 if(!late&&(seen||!latest)&&!weak.length)return null;
 return <section className="db-nudges">
  {late&&<div className="db-nudge late"><CalendarClock size={20}/><div><strong>You’re {late.days} {late.days===1?'day':'days'} behind your dates.</strong><p className="small">That’s fine. Move your remaining modules forward from today, at {p.schedule.hoursPerWeek} hours a week.</p></div><Button disabled={busy} onClick={()=>mutate('plan_reschedule',{id:p.id})}>{busy?'Updating…':'Update my dates'}</Button></div>}
  {latest&&!seen&&<div className="db-nudge done"><Check size={20}/><div><strong>{latest} stage finished.</strong><p className="small">Nice work. Pick your best piece from it for your portfolio.</p></div><div className="button-row"><Go href="/portfolio" outline>Choose for my portfolio</Go><Button variant="ghost" onClick={()=>{try{localStorage.setItem(seenKey,'1')}catch{}setSeen(true)}}>Dismiss</Button></div></div>}
  {weak.length>0&&<div className="db-nudge tips"><Sparkles size={20}/><div><strong>Suggested for you</strong><p className="small">Your AI reviews show these skills need more practice.</p>
   <ul>{weak.map(a=>{const l=lessonFor(a.id);return <li key={a.id}><strong>{a.label}</strong> ({live[a.id].now}){l&&<> · <a className="text-link" href={`/explore/video-${p.level}/${mods.findIndex(m=>m.title===l.title)}?tab=watch&lesson=${l.lesson}`}>Rewatch lesson {l.lesson} of {l.title}</a> · <a className="text-link" href={`/explore/video-${p.level}/${mods.findIndex(m=>m.title===l.title)}?tab=watch#free-resources`}>Free resources</a></>}</li>})}</ul></div></div>}
 </section>;
}

// "Today" on My courses: the one next thing to do on the open plan, with roughly how long it takes. A module's
// lessons are its topics, in order; a lesson counts as done once its questions are (the videos come first).
function TodayCard(){
 const {s}=useLearning();const p=s.programme as Programme|undefined;if(!p)return null;
 const mods=modulesFor(p.level),i=mods.findIndex((_,k)=>!s.progress?.[moduleKey(p.level,k)]);
 if(i<0)return <section className="db-today"><span className="kicker">Today</span><h2>You’ve finished every module of {planTitle(p)}.</h2><Go href={'/workspace/'+p.id}>See your plan<ArrowRight size={18}/></Go></section>;
 const m=mods[i],key=moduleKey(p.level,i),marks=s.lessonProgress?.[key]||{},lessons=lessonsFor(m.id,p.primaryPathway),lesson=resumeLesson(m.id,p.primaryPathway,marks);
 const late=behindBy(p,s.progress),minutes=Math.round(m.hours*60/(m.topics.length+1)/5)*5;
 const href=`/explore/video-${p.level}/${i}`+(lesson<0?'?tab=make':`?tab=watch&lesson=${lesson+1}`);
 return <section className="db-today"><span className="kicker">Today · {planTitle(p)}</span>
  <h2>{lesson<0?<>Hand in: {m.taskName}</>:<>Lesson {lesson+1} of {lessons.length}: {lessons[lesson].title}</>}</h2>
  <p className="small">{m.id} · {m.title} · about {lesson<0?Math.round(m.hours*60/(m.topics.length+1)/5)*5:minutes} min{late?<> · <a className="text-link" href={'/workspace/'+p.id}>{late.days} {late.days===1?'day':'days'} behind: update your dates</a></>:null}</p>
  <Go href={href} onClick={()=>track('today_clicked',{module:key,lesson:lesson+1})}>{lesson<0?'Go to the task':'Start this lesson'}<ArrowRight size={18}/></Go>
 </section>;
}

export function MyCourses(){
 const {s,user,loaded,mutate,busy}=useLearning();
 const [deleting,setDeleting]=useState<Programme|null>(null);
 if(!loaded)return <Panel><p role="status">Opening your courses…</p></Panel>;
 const plans=plansOf(s);
 return <div className="db">
  <section className="db-head"><div><h1>My courses</h1><p className="lede">The plans you’ve made for yourself. You can follow up to {maxPlans} at a time, across any course.</p></div><span className="db-count">{plans.length} of {maxPlans} plans</span></section>
  {plans.length>0&&<TodayCard/>}
  {!plans.length?<section className="db-empty">
    <div><h2 className="display">Make your first plan.</h2><p className="lede">Pick a course, answer a short level check and set your time.</p><Go href="/start">Make your first plan<ArrowRight size={18}/></Go>{!user&&<a className="db-signin" href="/auth/google?return_to=%2Fworkspace">Sign in to keep your plans and work.</a>}</div>
    <svg className="db-path" viewBox="0 0 560 140" fill="none" aria-hidden="true"><path d="M12 116H170c18 0 26-10 26-26V52c0-18 12-28 30-28h86c18 0 30 10 30 28v14c0 18 12 28 30 28h136" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="116" r="10" fill="#0b0b0b" stroke="currentColor" strokeWidth="2"/><circle cx="270" cy="24" r="10" fill="#0b0b0b" stroke="currentColor" strokeWidth="2"/><circle cx="530" cy="94" r="20" fill="var(--primary)"/><path d="M522 94h16m-6-6 6 6-6 6" stroke="#0b0b0b" strokeWidth="2.4"/></svg>
   </section>
  :<div className="db-plans">
   {plans.map(p=>{const mods=modulesFor(p.level),done=mods.filter((_,i)=>s.progress?.[moduleKey(p.level,i)]||s.planProgress?.[p.id!]?.[moduleKey(p.level,i)]).length;
    return <div key={p.id} className={'db-plan'+(p.id===s.programme?.id?' active':'')}>
     <span className="kicker">{courseNames[p.course]||p.course} · {levelNames[p.level]}</span>
     <a className="db-plan-link" href={'/workspace/'+p.id}><strong className="display">{p.name||p.primaryPathway}</strong></a>
     {courseId(p)&&<span className="small db-plan-id">Course ID {courseId(p)}</span>}
     <button type="button" className="db-plan-delete" aria-label={'Delete '+planTitle(p)} title="Delete this plan" onClick={()=>setDeleting(p)}><Trash2 size={16}/>Delete</button>
     <div className="vg-course-bar" aria-hidden="true"><span style={{width:Math.round(done/mods.length*100)+'%'}}/></div>
     <span className="small">{done} / {mods.length} modules · {formatDate(p.schedule.startDate)} → {formatDate(p.schedule.endDate)}</span>
     <span className="db-plan-foot" aria-hidden="true">{done?'Continue':'Open'}<span className="sg-arrow"><ArrowRight size={16}/></span></span>
    </div>})}
   {plans.length<maxPlans?<a className="db-plan add" href="/#crafts"><Plus size={26}/><strong>Make another plan</strong><span className="small">Pick a course, answer a short level check and set your time.</span></a>
    :<div className="db-plan add"><strong>{maxPlans} of {maxPlans} plans</strong><span className="small">Delete one to make another.</span></div>}
  </div>}
  {!user&&plans.length>0&&<p className="small">Sign in to keep your plans and work.</p>}
  {deleting&&<DeletePlanDialog p={deleting} open onClose={()=>setDeleting(null)}/>}
 </div>;
}

// One plan's page (/workspace/<id>): its report, dates, how you learn and its modules. Opening it makes it the
// current plan, so lessons and tasks follow its level and style.
export function PlanPage({id}:{id:string}){
 const {s,loaded,mutate}=useLearning();
 const plan=plansOf(s).find(p=>p.id===id);
 const needsOpen=loaded&&!!plan&&s.programme?.id!==id;
 React.useEffect(()=>{if(needsOpen)void mutate('plan_open',{id})},[needsOpen,id]);
 if(!loaded||needsOpen)return <Panel><p role="status">Opening your plan…</p></Panel>;
 if(!plan)return <Panel className="vg-empty"><h1>Plan not found</h1><p>It may have been deleted.</p><Go href="/workspace">My courses</Go></Panel>;
 return <ProgrammeDashboard/>;
}

// A progress ring: filled share of value/total, with the count in the middle.
function Ring({value,total,label}:{value:number;total:number;label:string}){
 const r=46,c=2*Math.PI*r,share=total?value/total:0;
 return <svg viewBox="0 0 120 120" className="dash-ring" role="img" aria-label={label}><circle cx="60" cy="60" r={r} className="track"/><circle cx="60" cy="60" r={r} className="fill" strokeDasharray={`${c*share} ${c}`} transform="rotate(-90 60 60)"/><text x="60" y="58" textAnchor="middle" className="n">{value}<tspan className="of">/{total}</tspan></text><text x="60" y="80" textAnchor="middle" className="u">modules</text></svg>;
}

function ProgrammeDashboard(){
 const {s,user,loaded,mutate,busy}=useLearning();
 // The latest AI review of each module, so skill levels and suggestions keep up with the learner.
 const [byModule,setByModule]=useState<Record<string,any>>({});
 React.useEffect(()=>{if(user)fetch('/api/review?all=video').then(r=>r.ok?r.json():{reviews:{}}).then((d:any)=>{const out:Record<string,any>={};for(const r of Object.values(d.reviews||{}) as any[])if(r.lessonKey&&(!out[r.lessonKey]||out[r.lessonKey].createdAt<r.createdAt))out[r.lessonKey]={...r,ratings:r.review?.ratings||r.review?.criteria?.map((c:any)=>c.rating)||[]};setByModule(out)}).catch(()=>{})},[user]);
 const [hours,setHours]=useState<number|null>(null);
 const [upgrading,setUpgrading]=useState(false),[editing,setEditing]=useState(false);
 if(!loaded)return <Panel><p role="status">Opening your plan…</p></Panel>;
 const p:Programme|undefined=s.programme;
 if(!p)return <Panel className="vg-empty"><span className="eyebrow">MY COURSES</span><h1>{user?'Build your learning pathway.':'Start your learning pathway.'}</h1><p className="lede">Pick what you like to film, answer 12 quick questions and set your time. Your report will show here.</p><div className="button-row"><Go href="/start">Start with Videography</Go></div></Panel>;
 const selfActive=isExplore(s),mentorActive=['paid','active'].includes(s.craft?.status);
 const mods=modulesFor(p.level),done=mods.filter((_,i)=>s.progress?.[moduleKey(p.level,i)]).length;
 const live=liveSkills(p,Object.fromEntries(Object.entries(byModule).map(([k,r]:any)=>[k,{ratings:r.ratings}])));
 const nextIndex=mods.findIndex((_,i)=>!s.progress?.[moduleKey(p.level,i)]);
 const update=(u:any)=>mutate('programme_update',{update:u});
 async function chooseMode(m:Mode){const saved=await update({mode:m});if(!saved)return;if(m==='self'&&!selfActive)window.location.assign('/membership?return_to=%2Fworkspace')}
 // Once a mode is settled (Free chosen, or a paid mode active), the choice moves behind an Upgrade button.
 // How you learn: Free or Self-paced. Mentorship will run as its own short and long courses (coming soon).
 const paid=selfActive||mentorActive;
 const decided=paid||p.mode==='free';
 const rank:Record<Mode,number>={free:0,self:1,mentor:2},current:Mode=paid?'self':'free';
 const shown=decided?modes.filter(m=>rank[m.id]>rank[current]):modes;
 const preview=(hours:number)=>schedule(p.level,hours,p.schedule.startDate,p.schedule.daysPerWeek);
  const hoursDone=mods.reduce((n,m,i)=>n+(s.progress?.[moduleKey(p.level,i)]?m.hours:0),0),late=behindBy(p,s.progress);
  const elapsed=Math.max(0,Math.min(1,(Date.parse(today())-Date.parse(p.schedule.startDate))/Math.max(1,Date.parse(p.schedule.endDate)-Date.parse(p.schedule.startDate))));
  const next=nextIndex>=0?mods[nextIndex]:null,nextHref=nextIndex>=0?continueHref(`/explore/${'video-'+p.level}/${nextIndex}`,mods[nextIndex].id,p.primaryPathway,s.lessonProgress?.[moduleKey(p.level,nextIndex)]):'';
  const tl=stageTimeline(p);
  const band=(score:number)=>score>=70?'Advanced':score>=40?'Intermediate':'Beginner';
  return <div className="vg-dashboard dash">
  <div className="breadcrumbs db-crumbs"><a href="/workspace">My courses</a><span>/</span><span>{planTitle(p)}</span></div>
  <header className="dash-head">
   <div><span className="kicker">{courseNames[p.course]||p.course} · {levelNames[p.level]} level</span><PlanName p={p}/><p className="lede">{levelSummary[p.level]}</p></div>
   <div className="button-row">{next&&<Go href={nextHref}>{done?'Continue':'Start'}<ArrowRight size={18}/></Go>}
    {decided&&shown.length>0&&<Button variant="outline" onClick={()=>{setUpgrading(true);setTimeout(()=>document.getElementById('vg-modes')?.scrollIntoView({behavior:'smooth'}),50)}}><Sparkles size={16}/>Upgrade to Self-paced</Button>}
    <Button variant="outline" className="vg-soon" onClick={()=>toast.info('Mentorship is coming soon: short and long courses with a fixed curriculum and timeframe.')}><UserRound size={16}/>Mentorship<span>Coming soon</span></Button></div>
  </header>
  <div className="dash-grid">
   <section className="dash-tile span-3" aria-label="Progress"><h2 className="dash-k">Progress</h2>
    <Ring value={done} total={mods.length} label={`${done} of ${mods.length} modules done`}/><p className="dash-sub">{done===mods.length?'Every module finished':`${mods.length-done} to go`}</p></section>
   <section className="dash-tile span-3" aria-label="Hours"><h2 className="dash-k">Hours</h2>
    <p className="dash-num"><strong>{hoursDone}</strong><span> / {p.schedule.totalHours} h</span></p>
    <div className="dash-bar" role="img" aria-label={`${hoursDone} of ${p.schedule.totalHours} hours done`}><span style={{width:Math.round(hoursDone/p.schedule.totalHours*100)+'%'}}/></div>
    <p className="dash-sub">{p.schedule.hoursPerWeek} h a week · about {p.schedule.minutesPerDay} min a day, {p.schedule.daysPerWeek} days</p></section>
   <section className="dash-tile span-3" aria-label="Dates"><h2 className="dash-k">Dates</h2>
    <p className="dash-num"><strong>{p.schedule.weeks}</strong><span> {p.schedule.weeks===1?'week':'weeks'}</span></p>
    <div className="dash-bar dash-time" role="img" aria-label={`${formatDate(p.schedule.startDate)} to ${formatDate(p.schedule.endDate)}`}><span style={{width:Math.round(elapsed*100)+'%'}}/></div>
    <p className="dash-sub">{formatDate(p.schedule.startDate)} → {formatDate(p.schedule.endDate)}</p>
    <p className={'dash-chip '+(late?'late':'ok')}>{late?`${late.days} ${late.days===1?'day':'days'} behind`:'On track'}</p>
    <button type="button" className="vg-link" aria-expanded={editing} onClick={()=>setEditing(e=>!e)}>{editing?'Close':'Change hours or start date'}</button></section>
   <section className="dash-tile span-3 dash-next" aria-label="Next up"><h2 className="dash-k">Next up</h2>
    {next?<><p className="dash-next-id">{next.id} · {next.stageLabel}</p><p className="dash-next-title">{moduleLesson(next,projectLabel(p)).title}</p><p className="dash-sub">{next.hours} h · Task: {next.taskName}</p><Go href={nextHref}>{done?'Continue':'Start'}<ArrowRight size={18}/></Go></>
     :<><p className="dash-next-title">All modules finished</p><p className="dash-sub">Well done. Look back at your work in My Work.</p></>}</section>

   <div className="dash-wide"><PlanNudges p={p} live={live} reviews={byModule} mods={mods}/></div>
   {editing&&<section className="dash-tile span-12 dash-edit" aria-label="Change your dates">
    <label className="vg-field">Hours per week: <strong>{hours??p.schedule.hoursPerWeek} h</strong> → ends {formatDate(preview(hours??p.schedule.hoursPerWeek).endDate)}
     <input type="range" min={p.schedule.recommendedHoursPerWeek} max={maxHoursPerWeek} value={hours??p.schedule.hoursPerWeek} disabled={busy} onChange={e=>setHours(Number(e.target.value))}/><span className="small">Recommended: {p.schedule.recommendedHoursPerWeek} h a week. You can add hours, not go below.</span></label>
    {hours!==null&&hours!==p.schedule.hoursPerWeek&&<div className="button-row"><Button size="sm" disabled={busy} onClick={async()=>{if(await update({hoursPerWeek:hours}))setHours(null)}}>Save {hours} h/week</Button><Button size="sm" variant="outline" onClick={()=>setHours(null)}>Cancel</Button></div>}
    <StartDate p={p} busy={busy} update={update}/></section>}

   <section className="dash-tile span-7" aria-label="Your level in each skill"><h2 className="dash-k">Your level in each skill</h2>
    <ul className="dash-skills">{skillAreas.map(a=>{const l=live[a.id],gain=l.evidence?l.now-l.start:0;return <li key={a.id}>
     <span className="dash-skill-name">{a.label}</span>
     <span className="dash-skill-bar" role="img" aria-label={`${a.label}: ${l.now} out of 100, ${band(l.now)} level`}><i style={{width:l.now+'%'}}/><b style={{left:'40%'}}/><b style={{left:'70%'}}/></span>
     <span className="dash-skill-val"><strong>{l.now}</strong><small>{band(l.now)}</small>{gain!==0&&<em className={gain>0?'up':'down'}>{gain>0?'+':''}{gain}</em>}</span></li>})}</ul>
    <p className="dash-legend" aria-hidden="true"><i/><span>Beginner</span><span>Intermediate · 40+</span><span>Advanced · 70+</span><i/></p>
    <p className="small">Starts from your 12 answers. Each AI-reviewed task in a skill counts as much again.</p></section>

   <section className="dash-tile span-5" aria-label="Your stages"><h2 className="dash-k">Your stages</h2>
    <div className="dash-stack" aria-hidden="true">{tl.filter(x=>x.hours).map(x=><span key={x.stage} style={{flexGrow:x.hours,background:stageColor[x.stage]}}/>)}</div>
    <ol className="dash-stages">{tl.filter(x=>x.modules.length).map(x=>{const dn=x.modules.filter(m=>s.progress?.[moduleKey(p.level,mods.findIndex(y=>y.id===m.id))]).length,all=dn===x.modules.length;return <li key={x.stage} className={all?'done':''}>
     <span className="vg-dot" style={{background:stageColor[x.stage]}}/><strong>{x.stage}</strong><span className="small">{dn}/{x.modules.length} · {x.hours} h · wk {x.startWeek}{x.endWeek>x.startWeek?'–'+x.endWeek:''}</span>{all&&<Check size={14} aria-label="Finished"/>}</li>})}</ol></section>

   <section className="dash-tile span-12" aria-label="Your modules"><h2 className="dash-k">Your modules · {levelNames[p.level]}</h2>
    <ol className="dash-mods">{mods.map((m,i)=>{const key=moduleKey(p.level,i),dn=!!s.progress?.[key],open=isFreeModule(key)||isExplore(s)||['paid','active'].includes(s.craft?.status);return <li key={m.id} className={(dn?'done ':'')+(i===nextIndex?'now':'')}>
     <a href={`/explore/video-${p.level}/${i}`}><span className="dash-mod-id" style={{background:stageColor[m.stageLabel]}}>{dn?<Check size={14}/>:m.id}</span>
      <span className="dash-mod-title">{moduleLesson(m,projectLabel(p)).title}</span>
      <span className="dash-mod-meta">{m.stageLabel} · {m.hours} h</span>
      <span className="dash-mod-task">{dn?'Done':open?'Task open':<><Lock size={11}/> Task in Self-paced</>}</span></a></li>})}</ol></section>

   <section className="dash-tile span-12" aria-label="What you will be able to do"><h2 className="dash-k">What you’ll be able to do</h2>
    <p className="dash-lede">By the end, you will make {pathwayOutcomes[p.primaryPathway]}, and {finalProject[p.level]}.</p>
    <ul className="dash-outcomes">{['Ideas','Planning','Filming','Editing'].map(st=>mods.filter(m=>m.stageLabel===st).sort((x,y)=>y.hours-x.hours)[0]).filter(Boolean).map(m=><li key={m.id}><Check size={16}/><span><strong>{m.stageLabel}</strong>{m.outcome}</span></li>)}</ul></section>
  </div>

  {(!decided||upgrading)&&shown.length>0&&<section id="vg-modes"><span className="eyebrow">How you learn</span><h2>{decided?'Upgrade your learning':'How do you want to learn?'}</h2>
   <div className="vg-modes">{shown.map(m=>{const active=m.id==='self'?paid:true;const chosen=p.mode===m.id;return <Panel key={m.id} className={'vg-mode '+(chosen?'chosen':'')}><div className="vg-mode-body">
    <div className="row between"><span className={'vg-mode-tag'+(m.id==='self'?' on':'')}>{m.title}</span>{chosen&&<Badge tone="green">Your mode</Badge>}</div><strong className="vg-price">{m.price}</strong>
    <ul>{m.points.map(x=><li key={x}><Check size={15}/>{x}</li>)}</ul>
    {m.id==='self'&&chosen&&!active&&<p className="small">Finish the practice checkout to unlock every task.</p>}
    <Button variant={chosen?'default':'outline'} disabled={busy} onClick={()=>chooseMode(m.id)}>{chosen?(active?'Selected':'Complete checkout'):m.id==='free'?'Learn free':'Go self-paced'}</Button>
   </div><Photo slot={m.id==='self'?'self-paced':'interests'} className="vg-mode-photo"/></Panel>})}</div>
   <p className="small">This is a test version. Checkout takes no money.</p>
   {decided&&<Button variant="ghost" onClick={()=>setUpgrading(false)}>Not now</Button>}
  </section>}

  <div className="db-foot-actions"><ReportProblem planId={p.id} variant="ghost" label="Report a problem with this plan"/><DeletePlan p={p}/></div>
 </div>;
}

// Modules grouped by stage (Ideas, Planning, Filming…), each group opening like a drop-down.
// The group with the learner's next module starts open.
export function ModuleList({p,level}:{p?:Programme;level?:Level}){
 const {s}=useLearning();
 const lv:Level=level||p?.level||'beginner';
 const entitled=isExplore(s)||['paid','active'].includes(s.craft?.status);
 const mods=modulesFor(lv),nextIndex=mods.findIndex((_,i)=>!s.progress?.[moduleKey(lv,i)]);
 const groups=stageOrder.map(stage=>({stage,items:mods.map((m,i)=>({m,i})).filter(x=>x.m.stageLabel===stage)})).filter(g=>g.items.length);
 return <section className="vg-modules"><span className="eyebrow">Your modules · {levelNames[lv]}</span><h2>Start here and work down</h2>
  {groups.map(g=>{const done=g.items.filter(x=>s.progress?.[moduleKey(lv,x.i)]).length,all=done===g.items.length;return <details key={g.stage} className={'vg-stage-group'+(all?' done':'')} open={g.items.some(x=>x.i===nextIndex)||(nextIndex<0&&g===groups[0])}>
   <summary><span className="vg-stage-dot" style={{background:stageColor[g.stage]}}>{all?<Check size={14}/>:null}</span><strong>{g.stage}</strong><span className="small">{g.items.length} module{g.items.length>1?'s':''} · {done} done</span><ChevronDown size={18} className="vg-stage-chev"/></summary>
   <ol>{g.items.map(({m,i})=>{const key=moduleKey(lv,i),done=!!s.progress?.[key],free=i<freeModuleCount;return <li key={m.id} className={done?'done':''}>
    <a href={`/explore/video-${lv}/${i}`}><span className="vg-mod-id" style={{background:stageColor[m.stageLabel]}}>{done?<Check size={16}/>:m.id}</span>
     <span className="vg-mod-body"><strong>{moduleLesson(m,projectLabel(p)).title}</strong><span className="small">{m.stageLabel} · {m.hours} h · Task: {m.taskName}</span></span>
     <span className="vg-mod-access">{free?<Badge tone="green"><Gift size={12}/> Free task</Badge>:entitled?<Badge>Task</Badge>:<span className="small"><Lock size={12}/> Task in Self-paced</span>}</span></a></li>})}</ol>
  </details>})}</section>;
}

// Delete this plan: keep the work (hand-ins, feedback and progress stay) or delete the plan's work too.
// Deleting a plan (from My courses or the plan's page): a warning dialog with two choices. Keeping the work
// leaves hand-ins, feedback and progress for a new plan at the same level; deleting the work can't be undone.
function DeletePlanDialog({p,open,onClose,onDeleted}:{p:Programme;open:boolean;onClose:()=>void;onDeleted?:()=>void}){
 const {mutate,busy}=useLearning();
 const ref=React.useRef<HTMLDialogElement>(null);
 const [keepWork,setKeepWork]=useState(true);
 React.useEffect(()=>{const d=ref.current;if(!d)return;if(open&&!d.open){setKeepWork(true);d.showModal()}else if(!open&&d.open)d.close()},[open]);
 const run=async()=>{if(await mutate('plan_delete',{id:p.id,keepWork})){onClose();onDeleted?.()}};
 return <dialog ref={ref} className="sg-dialog" aria-labelledby={'del-'+p.id} onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
  <h2 id={'del-'+p.id}>Delete “{planTitle(p)}”?</h2>
  <p className="sg-warning" role="alert"><TriangleAlert size={20}/><span><strong>This can’t be undone.</strong> Deleting a plan is permanent, and you could lose your progress.</span></p>
  <fieldset className="sg-choices" aria-label="What to delete">
   <label><input type="radio" name={'del-mode-'+p.id} checked={keepWork} onChange={()=>setKeepWork(true)}/><span><strong>Delete the plan, keep my work</strong><span className="small">Your hand-ins, feedback and progress stay, so a new plan at this level picks up where you are.</span></span></label>
   <label><input type="radio" name={'del-mode-'+p.id} checked={!keepWork} onChange={()=>setKeepWork(false)}/><span><strong>Delete the plan and its work</strong><span className="small">Also removes this level’s hand-ins, feedback and lesson progress, unless another of your plans is at the same level.</span></span></label>
  </fieldset>
  <div className="button-row"><Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button><Button variant="destructive" onClick={run} disabled={busy}>{busy?'Deleting…':keepWork?'Delete plan':'Delete plan and work'}</Button></div>
 </dialog>;
}
function DeletePlan({p}:{p:Programme}){
 const [open,setOpen]=useState(false);
 return <section className="vg-delete-plan"><Button variant="ghost" className="vg-delete-open sg-danger" onClick={()=>setOpen(true)}><Trash2 size={16}/>Delete this plan</Button>
  <DeletePlanDialog p={p} open={open} onClose={()=>setOpen(false)} onDeleted={()=>window.location.assign('/workspace')}/></section>;
}
