'use client';
import React,{useState} from 'react';
import {ArrowRight,BookOpen,CalendarClock,Check,Gift,Lock,PlayCircle,Sparkles,UserRound} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,Go,Badge,isExplore} from '../ui';
import {levelNames,levelSummary,levels,skillAreas,interestFor,modulesFor,moduleKey,moduleLesson,projectLabel,freeModuleCount,maxHoursPerWeek,addDays,today,schedule,type Programme,type Level,type Mode} from './programme';
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

const modes:{id:Mode;title:string;price:string;Icon:any;points:string[]}[]=[
 {id:'free',title:'Free',price:'₹0',Icon:BookOpen,points:['A learning path made for you','Videos, notes and pictures for every module',`Tasks in the first ${freeModuleCount} modules`]},
 {id:'self',title:'Self-paced',price:'₹999 / year',Icon:Sparkles,points:['Every task, with your work saved','AI checks and feedback on your work','Build a portfolio and track progress']},
 {id:'mentor',title:'Mentor-led',price:'₹30,000',Icon:UserRound,points:['A mentor from the beginning','Your mentor checks your plan and work each week','Everything in Self-paced']},
];

export function ProgrammeDashboard(){
 const {s,user,loaded,mutate,busy}=useLearning();
 const [delay,setDelay]=useState('');
 const [hours,setHours]=useState<number|null>(null);
 if(!loaded)return <Panel><p role="status">Opening your plan…</p></Panel>;
 const p:Programme|undefined=s.programme;
 if(!p)return <Panel className="vg-empty"><span className="eyebrow">YOUR PROGRAMME</span><h1>{user?'Build your learning pathway.':'Start your learning pathway.'}</h1><p className="lede">Pick what you like to film, answer 12 quick questions and set your time. Your report will show here.</p><div className="button-row"><Go href="/start">Start with Videography</Go>{s.profile&&<Go href="/workspace/previous" outline>Open my previous learning</Go>}</div></Panel>;
 const selfActive=isExplore(s),mentorActive=['paid','active'].includes(s.craft?.status);
 const mods=modulesFor(p.level),done=mods.filter((_,i)=>s.progress?.[moduleKey(p.level,i)]).length;
 const nextIndex=mods.findIndex((_,i)=>!s.progress?.[moduleKey(p.level,i)]);
 const update=(u:any)=>mutate('programme_update',{update:u});
 async function chooseMode(m:Mode){const saved=await update({mode:m});if(!saved)return;if(m==='self'&&!selfActive)window.location.assign('/membership?return_to=%2Fworkspace');if(m==='mentor'&&!mentorActive)window.location.assign('/mentors')}
 const preview=(hours:number)=>schedule(p.level,hours,p.schedule.startDate,p.schedule.daysPerWeek);
 return <div className="vg-dashboard">
  <section className="vg-report-head">
   <div><span className="eyebrow">YOUR LEVEL REPORT · VIDEOGRAPHY</span><h1>Your {levelNames[p.level]} plan</h1><p className="lede">{levelSummary[p.level]}</p>
    <div className="vg-tags">{p.interests.map((id,i)=><Badge key={id} tone={i===0?'green':''}>{i===0&&'★ '}{interestFor(id)?.label}</Badge>)}</div></div>
   <div className="vg-score"><strong>{done}/{mods.length}</strong><span>modules done</span></div>
  </section>

  <div className="vg-report-grid">
   <Panel className="vg-card wide"><h2>Your learning plan</h2><p>{overview(p)}</p><PathwayInfographic p={p}/></Panel>
   <Panel className="vg-card"><h2>Your level in each skill</h2><HeatMap p={p}/><p className="small">Based on your 12 answers. Your tasks will show more.</p></Panel>
   <Panel className="vg-card"><h2><CalendarClock size={20}/> Your dates</h2>
    <div className="vg-dates"><div><span className="small">Start</span><strong>{formatDate(p.schedule.startDate)}</strong></div><ArrowRight/><div><span className="small">End</span><strong>{formatDate(p.schedule.endDate)}</strong></div></div>
    <p className="small">{p.schedule.totalHours} hours · {p.schedule.hoursPerWeek} h/week (recommended {p.schedule.recommendedHoursPerWeek}) · {p.schedule.weeks} weeks · ≈ {p.schedule.minutesPerDay} min/day over {p.schedule.daysPerWeek} days</p>
    <label className="vg-field">Hours per week: <strong>{hours??p.schedule.hoursPerWeek} h</strong> → ends {formatDate(preview(hours??p.schedule.hoursPerWeek).endDate)}
     <input type="range" min={p.schedule.recommendedHoursPerWeek} max={maxHoursPerWeek} value={hours??p.schedule.hoursPerWeek} disabled={busy} onChange={e=>setHours(Number(e.target.value))}/></label>
    {hours!==null&&hours!==p.schedule.hoursPerWeek&&<div className="button-row"><Button size="sm" disabled={busy} onClick={async()=>{if(await update({hoursPerWeek:hours}))setHours(null)}}>Save {hours} h/week</Button><Button size="sm" variant="outline" onClick={()=>setHours(null)}>Cancel</Button></div>}
    <div className="vg-delay"><span className="small">Start later</span><div className="button-row">{[7,14,28].map(d=><Button key={d} variant="outline" size="sm" disabled={busy} onClick={()=>update({startDate:addDays(p.schedule.startDate>today()?p.schedule.startDate:today(),d)})}>+{d/7} week{d>7?'s':''}</Button>)}</div>
     <div className="vg-field-row"><input type="date" aria-label="New start date" min={today()} max={addDays(today(),180)} value={delay} onChange={e=>setDelay(e.target.value)}/><Button size="sm" disabled={!delay||busy} onClick={()=>{update({startDate:delay});setDelay('')}}>Set start date</Button></div></div>
   </Panel>
  </div>

  <section><span className="eyebrow">HOW YOU LEARN</span><h2>How do you want to learn?</h2>
   <div className="vg-modes">{modes.map(m=>{const active=m.id==='self'?selfActive:m.id==='mentor'?mentorActive:true;const chosen=p.mode===m.id;return <Panel key={m.id} className={'vg-mode '+(chosen?'chosen':'')}>
    <div className="row between"><m.Icon size={26}/>{chosen&&<Badge tone="green">Your mode</Badge>}</div><h3>{m.title}</h3><strong className="vg-price">{m.price}</strong>
    <ul>{m.points.map(x=><li key={x}><Check size={15}/>{x}</li>)}</ul>
    {m.id!=='free'&&chosen&&!active&&<p className="small">{m.id==='self'?'Finish the practice checkout to unlock every task.':'Choose your mentor to continue.'}</p>}
    <Button variant={chosen?'default':'outline'} disabled={busy} onClick={()=>chooseMode(m.id)}>{chosen?(active?'Selected':m.id==='self'?'Complete checkout':'Choose a mentor'):m.id==='free'?'Learn free':m.id==='self'?'Go self-paced':'Choose a mentor'}</Button>
   </Panel>})}</div>
   <p className="small">This is a test version. Checkout takes no money and mentors are made up.</p>
  </section>

  <ModuleList p={p}/>
  {nextIndex>=0&&<div className="vg-sticky-next"><Go href={`/explore/${'video-'+p.level}/${nextIndex}`}><PlayCircle size={18}/>{done?'Continue':'Start'}: {moduleLesson(mods[nextIndex],projectLabel(p)).title}</Go></div>}
 </div>;
}

export function ModuleList({p,level}:{p?:Programme;level?:Level}){
 const {s}=useLearning();
 const lv:Level=level||p?.level||'beginner';
 const entitled=isExplore(s)||['paid','active'].includes(s.craft?.status);
 const mods=modulesFor(lv);
 return <section className="vg-modules"><span className="eyebrow">YOUR MODULES · {levelNames[lv].toUpperCase()}</span><h2>Start here and work down</h2>
  <ol>{mods.map((m,i)=>{const key=moduleKey(lv,i),done=!!s.progress?.[key],free=i<freeModuleCount;return <li key={m.id} className={done?'done':''}>
   <a href={`/explore/video-${lv}/${i}`}><span className="vg-mod-id" style={{background:stageColor[m.stageLabel]}}>{done?<Check size={16}/>:m.id}</span>
    <span className="vg-mod-body"><strong>{moduleLesson(m,projectLabel(p)).title}</strong><span className="small">{m.stageLabel} · {m.hours} h</span></span>
    <span className="vg-mod-access">{free?<Badge tone="green"><Gift size={12}/> Free task</Badge>:entitled?<Badge>Task</Badge>:<span className="small"><Lock size={12}/> Task in Self-paced</span>}</span></a></li>})}</ol></section>;
}

// Explore: every Videography module at each level. Videos and notes are free to watch.
export function ExploreModules(){
 const {s}=useLearning();
 return <div className="vg-dashboard"><section><span className="eyebrow">EXPLORE · VIDEOGRAPHY</span><h1>All modules</h1><p className="lede">Watch any module for free. {s.programme?'Your plan is on your Journey page.':'Answer 12 quick questions to get a plan made for you.'}</p>{!s.programme&&<Go href="/start">Make my plan</Go>}</section>
  {levels.map(l=><ModuleList key={l} level={l} p={s.programme}/>)}
 </div>;
}
