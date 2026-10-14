'use client';
import React,{useState} from 'react';
import {ArrowRight,BookOpen,CalendarClock,Check,ChevronDown,Gift,Lock,PlayCircle,Plus,Sparkles,Target,Trash2,UserRound,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,Go,Badge,isExplore} from '../ui';
import {levelNames,levelSummary,levels,skillAreas,interestFor,pathwayOutcomes,finalProject,modulesFor,moduleKey,moduleLesson,projectLabel,freeModuleCount,maxHoursPerWeek,addDays,today,schedule,pathways,stylesOf,maxStyles,styleModuleKeys,type Programme,type Level,type Mode,type Pathway} from './programme';
import {formatDate} from './start';

const stageOrder=['Ideas','Planning','Filming','Editing','Your pathway','Final project'];
const stageColor:Record<string,string>={Ideas:'var(--vg-s1)',Planning:'var(--vg-s2)',Filming:'var(--vg-s3)',Editing:'var(--vg-s4)','Your pathway':'var(--vg-s5)','Final project':'var(--vg-s6)'};

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

export function HeatMap({p}:{p:Programme}){
 // Each skill row fills the level columns its score reaches: <40 Beginner, 40–69 Intermediate, 70+ Advanced.
 const band=(score:number)=>score>=70?2:score>=40?1:0;
 return <div className="vg-heat" role="table" aria-label="Current level by skill area">
  <div role="row" className="vg-heat-row head"><span role="columnheader">Skill area</span>{levels.map(l=><span role="columnheader" key={l}>{levelNames[l]}</span>)}<span role="columnheader">Score</span></div>
  {skillAreas.map(a=>{const score=p.assessment.areas[a.id];const b=band(score);return <div role="row" className="vg-heat-row" key={a.id}><span role="rowheader">{a.label}</span>{levels.map((l,i)=><span role="cell" key={l} className="vg-heat-cell" data-on={i<=b} aria-label={i<=b?levelNames[l]+' reached':levelNames[l]+' not yet'}/>)}<span role="cell" className="vg-heat-score">{score}</span></div>})}
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
 return <Panel className="vg-card wide vg-outcome-card"><h2><Target size={20}/> What you’ll be able to do</h2>
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
  <label className="vg-field">Or pick a date <input type="date" min={today()} max={addDays(today(),180)} value={start>=today()?start:''} disabled={busy} onChange={e=>{if(e.target.value)update({startDate:e.target.value})}}/></label>
 </div>;
}

const modes:{id:Mode;title:string;price:string;Icon:any;points:string[]}[]=[
 {id:'free',title:'Free',price:'₹0',Icon:BookOpen,points:['A learning path made for you','Videos, notes and pictures for every module',`Tasks in the first ${freeModuleCount} modules`]},
 {id:'self',title:'Self-paced',price:'₹999 / year',Icon:Sparkles,points:['Every task, with your work saved','AI checks and feedback on your work','Build a portfolio and track progress']},
 {id:'mentor',title:'Mentor-led',price:'₹30,000',Icon:UserRound,points:['A mentor from the beginning','Your mentor checks your plan and work each week','Everything in Self-paced']},
];

export function ProgrammeDashboard(){
 const {s,user,loaded,mutate,busy}=useLearning();
 const [hours,setHours]=useState<number|null>(null);
 const [upgrading,setUpgrading]=useState(false);
 if(!loaded)return <Panel><p role="status">Opening your plan…</p></Panel>;
 const p:Programme|undefined=s.programme;
 if(!p)return <Panel className="vg-empty"><span className="eyebrow">YOUR PROGRAMME</span><h1>{user?'Build your learning pathway.':'Start your learning pathway.'}</h1><p className="lede">Pick what you like to film, answer 12 quick questions and set your time. Your report will show here.</p><div className="button-row"><Go href="/start">Start with Videography</Go>{s.profile&&<Go href="/workspace/previous" outline>Open my previous learning</Go>}{s.profile&&<Button variant="ghost" disabled={busy} onClick={async()=>{if(window.confirm('Delete your previous learning plan? This can’t be undone.'))await mutate('plan_delete',{previous:true})}}><Trash2 size={16}/>Delete previous learning</Button>}</div></Panel>;
 const selfActive=isExplore(s),mentorActive=['paid','active'].includes(s.craft?.status);
 const mods=modulesFor(p.level),done=mods.filter((_,i)=>s.progress?.[moduleKey(p.level,i)]).length;
 const nextIndex=mods.findIndex((_,i)=>!s.progress?.[moduleKey(p.level,i)]);
 const update=(u:any)=>mutate('programme_update',{update:u});
 async function chooseMode(m:Mode){const saved=await update({mode:m});if(!saved)return;if(m==='self'&&!selfActive)window.location.assign('/membership?return_to=%2Fworkspace');if(m==='mentor'&&!mentorActive)window.location.assign('/mentors')}
 // Once a mode is settled (Free chosen, or a paid mode active), the choice moves behind an Upgrade button.
 const decided=mentorActive||selfActive&&p.mode!=='mentor'||p.mode==='free';
 const rank:Record<Mode,number>={free:0,self:1,mentor:2},current:Mode=mentorActive?'mentor':selfActive?'self':'free';
 const shown=decided?modes.filter(m=>rank[m.id]>rank[current]):modes;
 const preview=(hours:number)=>schedule(p.level,hours,p.schedule.startDate,p.schedule.daysPerWeek);
 return <div className="vg-dashboard">
  <section className="vg-report-head">
   <div><span className="eyebrow">YOUR LEVEL REPORT · VIDEOGRAPHY</span><h1>Your {levelNames[p.level]} plan</h1><p className="lede">{levelSummary[p.level]}</p>
    </div>
   <div className="vg-head-side"><div className="vg-score"><strong>{done}/{mods.length}</strong><span>modules done</span></div>
    {decided&&shown.length>0&&<Button variant="outline" onClick={()=>{setUpgrading(true);setTimeout(()=>document.getElementById('vg-modes')?.scrollIntoView({behavior:'smooth'}),50)}}><Sparkles size={16}/>{current==='free'?'Upgrade':'Get a mentor'}</Button>}</div>
  </section>

  <MyCourses p={p}/>

  <div className="vg-report-grid">
   <PathwayOutcome p={p}/>
   <Panel className="vg-card wide"><h2>Your learning plan</h2><p>{overview(p)}</p><PathwayInfographic p={p}/></Panel>
   <Panel className="vg-card"><h2>Your level in each skill</h2><HeatMap p={p}/><p className="small">Based on your 12 answers. Your tasks will show more.</p></Panel>
   <Panel className="vg-card"><h2><CalendarClock size={20}/> Your dates</h2>
    <div className="vg-dates"><div><span className="small">Start</span><strong>{formatDate(p.schedule.startDate)}</strong></div><ArrowRight/><div><span className="small">End</span><strong>{formatDate(p.schedule.endDate)}</strong></div></div>
    <p className="small">{p.schedule.totalHours} hours · {p.schedule.hoursPerWeek} h/week (recommended {p.schedule.recommendedHoursPerWeek}) · {p.schedule.weeks} weeks · ≈ {p.schedule.minutesPerDay} min/day over {p.schedule.daysPerWeek} days</p>
    <label className="vg-field">Hours per week: <strong>{hours??p.schedule.hoursPerWeek} h</strong> → ends {formatDate(preview(hours??p.schedule.hoursPerWeek).endDate)}
     <input type="range" min={p.schedule.recommendedHoursPerWeek} max={maxHoursPerWeek} value={hours??p.schedule.hoursPerWeek} disabled={busy} onChange={e=>setHours(Number(e.target.value))}/></label>
    {hours!==null&&hours!==p.schedule.hoursPerWeek&&<div className="button-row"><Button size="sm" disabled={busy} onClick={async()=>{if(await update({hoursPerWeek:hours}))setHours(null)}}>Save {hours} h/week</Button><Button size="sm" variant="outline" onClick={()=>setHours(null)}>Cancel</Button></div>}
    <StartDate p={p} busy={busy} update={update}/>
   </Panel>
  </div>

  {(!decided||upgrading)&&shown.length>0&&<section id="vg-modes"><span className="eyebrow">HOW YOU LEARN</span><h2>{decided?'Upgrade your learning':'How do you want to learn?'}</h2>
   <div className="vg-modes">{shown.map(m=>{const active=m.id==='self'?selfActive:m.id==='mentor'?mentorActive:true;const chosen=p.mode===m.id;return <Panel key={m.id} className={'vg-mode '+(chosen?'chosen':'')}>
    <div className="row between"><m.Icon size={26}/>{chosen&&<Badge tone="green">Your mode</Badge>}</div><h3>{m.title}</h3><strong className="vg-price">{m.price}</strong>
    <ul>{m.points.map(x=><li key={x}><Check size={15}/>{x}</li>)}</ul>
    {m.id!=='free'&&chosen&&!active&&<p className="small">{m.id==='self'?'Finish the practice checkout to unlock every task.':'Choose your mentor to continue.'}</p>}
    <Button variant={chosen?'default':'outline'} disabled={busy} onClick={()=>chooseMode(m.id)}>{chosen?(active?'Selected':m.id==='self'?'Complete checkout':'Choose a mentor'):m.id==='free'?'Learn free':m.id==='self'?'Go self-paced':'Choose a mentor'}</Button>
   </Panel>})}</div>
   <p className="small">This is a test version. Checkout takes no money and mentors are made up.</p>
   {decided&&<Button variant="ghost" onClick={()=>setUpgrading(false)}>Not now</Button>}
  </section>}

  <ModuleList p={p}/>
  <DeletePlan/>
  {nextIndex>=0&&<div className="vg-sticky-next"><Go href={`/explore/${'video-'+p.level}/${nextIndex}`}><PlayCircle size={18}/>{done?'Continue':'Start'}: {moduleLesson(mods[nextIndex],projectLabel(p)).title}</Go></div>}
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
 return <section className="vg-modules"><span className="eyebrow">YOUR MODULES · {levelNames[lv].toUpperCase()}</span><h2>Start here and work down</h2>
  {groups.map(g=>{const done=g.items.filter(x=>s.progress?.[moduleKey(lv,x.i)]).length,all=done===g.items.length;return <details key={g.stage} className={'vg-stage-group'+(all?' done':'')} open={g.items.some(x=>x.i===nextIndex)||(nextIndex<0&&g===groups[0])}>
   <summary><span className="vg-stage-dot" style={{background:stageColor[g.stage]}}>{all?<Check size={14}/>:null}</span><strong>{g.stage}</strong><span className="small">{g.items.length} module{g.items.length>1?'s':''} · {done} done</span><ChevronDown size={18} className="vg-stage-chev"/></summary>
   <ol>{g.items.map(({m,i})=>{const key=moduleKey(lv,i),done=!!s.progress?.[key],free=i<freeModuleCount;return <li key={m.id} className={done?'done':''}>
    <a href={`/explore/video-${lv}/${i}`}><span className="vg-mod-id" style={{background:stageColor[m.stageLabel]}}>{done?<Check size={16}/>:m.id}</span>
     <span className="vg-mod-body"><strong>{moduleLesson(m,projectLabel(p)).title}</strong><span className="small">{m.stageLabel} · {m.hours} h · Task: {m.taskName}</span></span>
     <span className="vg-mod-access">{free?<Badge tone="green"><Gift size={12}/> Free task</Badge>:entitled?<Badge>Task</Badge>:<span className="small"><Lock size={12}/> Task in Self-paced</span>}</span></a></li>})}</ol>
  </details>})}</section>;
}

// Delete this plan: keep the work (redo the level check, keep hand-ins and progress) or start completely fresh.
function DeletePlan(){
 const {mutate,busy}=useLearning();
 const [open,setOpen]=useState(false);
 async function run(keepWork:boolean){
  const ask=keepWork?'Delete this plan? Your hand-ins, feedback and progress stay. You can make a new plan any time.'
   :'Delete this plan and everything in it? Your Videography hand-ins, lesson progress and your older previous learning plan will be removed. This can’t be undone.';
  if(!window.confirm(ask))return;
  if(await mutate('plan_delete',{keepWork}))window.location.assign('/start');
 }
 return <section className="vg-delete-plan">{open?<>
  <h2>Delete this plan</h2>
  <div className="vg-delete-options">
   <div><strong>Delete the plan, keep my work</strong><p className="small">Your level, dates and styles go. Hand-ins, feedback and progress stay, so a new plan picks up where you are.</p><Button variant="outline" disabled={busy} onClick={()=>run(true)}>Delete plan only</Button></div>
   <div><strong>Delete everything and start fresh</strong><p className="small">Also removes your Videography hand-ins, lesson progress and your older previous learning plan. Can’t be undone.</p><Button variant="destructive" disabled={busy} onClick={()=>run(false)}>Delete everything</Button></div>
  </div>
  <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
 </>:<Button variant="ghost" className="vg-delete-open" onClick={()=>setOpen(true)}><Trash2 size={16}/>Delete this plan</Button>}</section>;
}

// My courses: up to three styles, each a tile with its own progress. Core modules are shared; each style
// has its own style project (B13 / I13 / A13). Switching changes the style project and its videos.
function MyCourses({p}:{p:Programme}){
 const {s,mutate,busy}=useLearning();
 const [adding,setAdding]=useState(false);
 const styles=stylesOf(p),mods=modulesFor(p.level);
 const doneFor=(style:Pathway)=>mods.filter((_,i)=>{const k=moduleKey(p.level,i);return styleModuleKeys.includes(k)&&style!==p.primaryPathway?!!s.styleProgress?.[style]?.[k]:!!s.progress?.[k]}).length;
 const update=(u:any)=>mutate('programme_update',{update:u});
 return <section className="vg-courses"><div className="row between"><div><span className="eyebrow">MY COURSES · {styles.length} OF {maxStyles}</span><h2>Your styles</h2></div><span className="small">Core modules count for every style. Each style has its own project.</span></div>
  <div className="vg-course-grid">
   {styles.map(style=>{const done=doneFor(style),active=style===p.primaryPathway;return <article key={style} className={'vg-course'+(active?' active':'')}>
    <div className="row between"><span className="eyebrow">{levelNames[p.level]}</span>{styles.length>1&&<button type="button" className="vg-course-remove" disabled={busy} aria-label={'Remove '+style} onClick={()=>{if(window.confirm('Remove '+style+'? Its project stays in My Work, and comes back if you add this style again.'))update({removeStyle:style})}}><X size={14}/></button>}</div>
    <h3>{style}</h3>
    <div className="vg-course-bar" aria-hidden="true"><span style={{width:Math.round(done/mods.length*100)+'%'}}/></div>
    <span className="small">{done} / {mods.length} modules</span>
    {active?<Badge tone="green">Current course</Badge>:<Button size="sm" variant="outline" disabled={busy} onClick={()=>update({style})}>Switch to this course</Button>}
   </article>})}
   {styles.length<maxStyles&&<article className="vg-course add">{adding?<><h3>Add a style</h3><div className="vg-course-picks">{pathways.filter(x=>!styles.includes(x)).map(x=><button type="button" key={x} disabled={busy} onClick={async()=>{if(await update({addStyle:x}))setAdding(false)}}>{x}</button>)}</div><Button size="sm" variant="ghost" onClick={()=>setAdding(false)}>Cancel</Button></>
    :<button type="button" className="vg-course-addbtn" onClick={()=>setAdding(true)}><Plus size={22}/><strong>Add a style</strong><span className="small">Up to {maxStyles} at a time</span></button>}</article>}
  </div>
 </section>;
}

// Explore: every Videography module at each level. Videos and notes are free to watch.
export function ExploreModules(){
 const {s}=useLearning();
 return <div className="vg-dashboard"><section><span className="eyebrow">EXPLORE · VIDEOGRAPHY</span><h1>All modules</h1><p className="lede">Watch any module for free. {s.programme?'Your plan is on your Journey page.':'Answer 12 quick questions to get a plan made for you.'}</p>{!s.programme&&<Go href="/start">Make my plan</Go>}</section>
  {levels.map(l=><ModuleList key={l} level={l} p={s.programme}/>)}
 </div>;
}
