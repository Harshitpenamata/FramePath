'use client';
import {PersonalJourney,PersonalPathPage} from './personal-journey';
import {currentPlan} from './personalization';
import {lessonTitle} from './visual-lab';
import {LearningBrief} from './learning-brief';
import React,{useEffect,useState} from 'react';
import {Aperture,Camera,ScanLine,Sun,Mic,Move,Scissors,Film,Check,LockKeyhole,ArrowUpRight,BookOpen,Download} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {basicPaths,basicKeys,basicContext,journalTypes,templateNames,BasicLesson} from './beginner-curriculum';
import {coursePaths,activeLevel,keysForLevel,pathsForLevel,levelForPath,levelNames,levels,Level,goalPractice} from './selfpaced-curriculum';
import {mentors,rubric} from './catalog';
import {moduleHref,moduleInfo,blockingModule,phases,isFreePath} from './learning-rules';
import {Panel,Badge,Go,Gate,Action,AIBox,useLearning,PageHead,DateText} from './ui';
const icons=[Aperture,Camera,ScanLine,Sun,Mic,Move,Scissors,Film];
function PathwayTools(){return <details className="lesson-details"><summary>Earlier projects & learning tools</summary><div className="button-row"><Go outline href="/journals">Journals & templates</Go><Go outline href="/explore/product-reel/0">Original product reel</Go><Go outline href="/explore/everyday-story/0">Original everyday story</Go><Go outline href="/craft/pathway">Existing mentor course</Go></div><p className="small">Previous course progress and saved work stay available. Choose another level at any time; progress is kept separately.</p></details>}
export function LevelSwitch({value,onChange,disabled=false}:{value:Level;onChange:(level:Level)=>void;disabled?:boolean}){return <div className="level-switch" role="group" aria-label="Learning level">{levels.map(l=><Button key={l} variant="outline" disabled={disabled} aria-pressed={value===l} onClick={()=>onChange(l)}>{levelNames[l]}</Button>)}</div>}
export function BeginnerLibrary({embedded=false}:{embedded?:boolean}={}){
 const {s,loaded}=useLearning();const [browse,setBrowse]=useState<Level>(activeLevel(s.profile));useEffect(()=>{if(loaded)setBrowse(activeLevel(s.profile))},[loaded]);const level=embedded?activeLevel(s.profile):browse;const list=pathsForLevel(level);
 const next=keysForLevel(level).find(k=>!s.progress[k]);
 const currentPath=next?moduleInfo(next).pathId:'';
 return <>
  {!embedded&&<><PageHead eyebrow="SELF-PACED VIDEOGRAPHY" title="Choose your next skill">Start where you are. Learn through making.</PageHead><LevelSwitch value={level} onChange={setBrowse}/><div className="curriculum-strip"><span>{list.length} PATHWAYS / {levelNames[level].toUpperCase()}</span><span>At your pace</span><a href="/workspace">My journey</a></div></>}
  <div className={embedded?'workspace-pathway-grid'+(level!=='beginner'?' extended':''):'basic-grid'}>{list.map((p,i)=>{
   const Icon=icons[i],count=p.lessons.filter((_,n)=>s.progress[p.id+'-'+n]).length,locked=blockingModule(s,p.id+'-0'),current=p.id===currentPath;
   const art=<div className="week-art">{<Icon strokeWidth={1}/>}<span>{p.number}</span><div className="frame-corners"/></div>;
   const meter=<div className="week-meter" aria-label={count+' of 5 complete'}>{p.lessons.map((_,j)=><i key={j} className={s.progress[p.id+'-'+j]?'done':''}/>)}</div>;
   return embedded?<a key={p.id} className={'workspace-pathway week-'+p.week+(current?' is-current':'')} href={'/explore/'+p.id} aria-current={current?'step':undefined}>
    {art}<div className="workspace-pathway-copy"><div className="workspace-pathway-label"><span>Week {p.week}</span>{current?<span className="current-label">Up next</span>:count===5?<Check size={16} aria-label="Complete"/>:locked?<LockKeyhole size={14} aria-label="Complete the earlier sessions first"/>:null}</div><h3>{p.title}</h3>{level!=='beginner'&&<p className="workspace-pathway-description">{p.outcome}</p>}<span className="workspace-pathway-meta">{isFreePath(p.id,s)?'Free practice · ':''}~{p.hours}h</span></div>
    <div className="workspace-pathway-progress">{meter}<span>{count} / 5 sessions</span></div>
   </a>:<a key={p.id} className={'basic-card week-'+p.week} href={'/explore/'+p.id}>{art}<div className="row between"><Badge>PATH {p.week}</Badge><span className="small">{count===5?<Check size={18}/>:locked?<LockKeyhole size={16}/>:isFreePath(p.id,s)?'Free practice':'5 sessions'}</span></div><h2>{p.title}</h2><p>{p.think}</p>{meter}<div className="row between small"><span>{count}/5 complete · ~{p.hours}h</span><ArrowUpRight size={20}/></div></a>
  })}</div>
  <PathwayTools/>
 </>
}
export function BeginnerJourney(){
 const {s,mutate,busy}=useLearning();if(currentPlan(s)||!s.profile)return <PersonalJourney/>;const level=activeLevel(s.profile),levelKeys=keysForLevel(level),list=pathsForLevel(level);
 const next=levelKeys.find(k=>!s.progress[k]);
 const count=levelKeys.filter(k=>s.progress[k]).length;
 const ctx=basicContext(s.profile);
 return <div className="workspace-page">
  <PageHead eyebrow={'MY JOURNEY / '+levelNames[level].toUpperCase()} title={s.profile?'Your next frame, '+s.profile.name+'.':'Your next frame starts here.'}/>
  <Gate>{!s.profile?<Panel className="empty"><Aperture size={48}/><h2>Find your starting point.</h2><Go href="/diagnostic">Start my snapshot</Go></Panel>:
   <div className="workspace-layout">
    <header className="workspace-pathways-head"><div><h2 id="workspace-pathways-title">Your pathways</h2><p>{levelNames[level]} videography · {levelKeys.length} sessions</p></div><LevelSwitch value={level} disabled={busy} onChange={(v:Level)=>mutate('learning_level',{level:v})}/></header>
    <section className="workspace-pathways" aria-labelledby="workspace-pathways-title"><BeginnerLibrary embedded/></section>
    <aside className="workspace-sidebar" aria-label="Your learning support">
     <Panel className="next-frame">
      <span className="eyebrow">{next?'NEXT SESSION':'LEVEL COMPLETE'}</span>
      <h2>{next?lessonTitle(moduleInfo(next).lesson.title):'One place. One person. Your film.'}</h2>
      <p>{next?coursePaths.find(p=>p.id===moduleInfo(next).pathId)?.title:'Compare your capstone with your first frame.'}</p>
      <Go href={next?moduleHref(next):'/finish/'+level}>{next?'Continue learning':'Review my capstone'}</Go>
      <div className="workspace-total"><span>Journey progress</span><span>{count} / {levelKeys.length}</span></div>
      <div className="workspace-total-meter" role="progressbar" aria-label="Journey progress" aria-valuemin={0} aria-valuemax={levelKeys.length} aria-valuenow={count}><i style={{width:(count/levelKeys.length*100)+'%'}}/></div>
     </Panel>
     <section className="workspace-support">
      <div className="journey-side">
       <span className="eyebrow">ONE RUNNING SUBJECT</span><h2>{ctx.subject}</h2>
       <p>{goalPractice(s.profile).name} · {s.profile.hours}h / week</p>
       <div className="workspace-shortcuts"><a href="/diagnostic">My snapshot</a><a href="/journals">My journals</a><a href="/portfolio">My work</a></div>
      </div>
      <details className="lesson-details"><summary>How this path supports my goal</summary><LearningBrief profile={s.profile} compact/></details>
      <details className="lesson-details"><summary>Personalise my practice with AI</summary><p className="small">AI can adapt your practice, schedule and examples while you follow the beginner curriculum.</p><AIBox lessonKey={next||''} context={'Help me apply the beginner curriculum to '+ctx.subject+'.'}/></details>
      {s.craft&&<div className="workspace-mentor"><span className="eyebrow">MENTOR COURSE</span><h2>{mentors.find(m=>m.id===s.craft.mentorId)?.name||'Your mentor'} · Beginner videography</h2><Go outline href="/craft/pathway">Continue mentor course</Go></div>}
     </section>
    </aside>
   </div>
  }</Gate>
 </div>
}
export function BeginnerWeek({id}:any){const {s}=useLearning();if(currentPlan(s)?.paths.some(p=>p.id===id))return <PersonalPathPage id={id}/>;const p=coursePaths.find(v=>v.id===id);if(!p)return <Panel><h1>Week not found</h1><Go href="/explore">All pathways</Go></Panel>;const Icon=icons[(p.week-1)%icons.length],next=p.lessons.findIndex((_,i)=>!s.progress[id+'-'+i]);return <><div className="breadcrumbs"><a href="/explore">All pathways</a><span>/ Week {p.week}</span></div><div className="week-hero"><Icon strokeWidth={1}/><div><Badge>{levelNames[p.level].toUpperCase()} · PATHWAY {p.week}</Badge><h1>{p.title}</h1><p>5 sessions · ~{p.hours} hours · move at your own pace</p></div></div><Panel className="think-panel"><span className="eyebrow">THINK</span><h2>{p.think}</h2></Panel><div className="session-list">{p.lessons.map((l,i)=>{const k=id+'-'+i,locked=blockingModule(s,k);return <a key={k} href={moduleHref(k)} className="session-tile"><span className={'session-number '+(s.progress[k]?'done':'')}>{s.progress[k]?<Check/>:String(i+1).padStart(2,'0')}</span><div><span className="eyebrow">{phases.find(p=>p.id===l.phase)?.name}</span><h2>{lessonTitle(l.title)}</h2><span className="small">~{l.minutes} min · Lesson & assignment</span></div>{locked?<LockKeyhole size={19}/>:<ArrowUpRight size={22}/>}</a>})}</div><div className="two-col"><Panel><h2>Extra practice</h2><ol className="plain-list">{p.practice.map(v=><li key={v}>{v}</li>)}</ol></Panel><Panel><h2>Keep your decisions.</h2><p>Use your journals during the week. Passing session five saves a weekly piece to My work.</p><div className="button-row"><Go href={moduleHref(id+'-'+Math.max(next,0))}>{next<0?'Revisit this week':'Open next session'}</Go><Go outline href="/journals">Journals & templates</Go></div></Panel></div></>}
export function LearningJournals(){const {s,loaded,mutate}=useLearning();const [kind,setKind]=useState('noticing'),[text,setText]=useState('');useEffect(()=>{if(loaded)setText(s.journals?.[kind]?.text||'')},[loaded,kind]);const j=journalTypes.find(v=>v.id===kind)!;return <><PageHead eyebrow="YOUR FIELD NOTES" title="Notice. Decide. Remember."/><Gate><div className="two-col"><Panel><label>Choose a journal<select value={kind} onChange={e=>setKind(e.target.value)}>{journalTypes.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label><p>{j.prompt}</p><label htmlFor="journal-text">My notes<textarea id="journal-text" rows={13} maxLength={16000} value={text} onChange={e=>setText(e.target.value)}/></label><Action onClick={()=>mutate('journal_save',{kind,text})}>Save journal</Action><p className="small">Private to your account. Save before switching journals.</p></Panel><Panel><h2>Templates for your toolkit</h2><div className="template-list">{templateNames.map((n,i)=><a key={n} href={'/templates/'+(i+1)+'.txt'} download><Download size={17}/>{n}</a>)}</div></Panel></div></Gate></>}
export function BasicCapstone(){const {s,mutate}=useLearning();const [mentor,setMentor]=useState('maya'),[scores,setScores]=useState([-1,-1,-1,-1,-1,-1]),[feedback,setFeedback]=useState('');const complete=basicKeys.every(k=>s.progress[k]);const r=s.basicMentorReview;return <><PageHead eyebrow="BEGINNER / YOUR FINAL FRAME" title="One Place, One Person, One Minute."/><Gate>{!complete?<Panel><h2>Your capstone is ahead.</h2><p>Finish the forty beginner sessions to complete this journey and try the optional mentor demo.</p><Go href="/workspace">My next session</Go></Panel>:<><Panel className="think-panel"><Badge>BEGINNER COMPLETE</Badge><h2>You have a film—and decisions you can explain.</h2><p>Your self-checks complete this level. The optional review below is separate.</p><Go href="/portfolio">See my work</Go></Panel><details className="lesson-details"><summary>Choose a mentor · optional review demo</summary><p>This is a personal simulation. Maya and Arjun are fictional; you enter the review to test the flow. No real mentor is contacted.</p><label>Review style<select value={mentor} onChange={e=>setMentor(e.target.value)}>{mentors.map(m=><option key={m.id} value={m.id}>{m.name} · {m.focus}</option>)}</select></label>{rubric.map(([name,weight],i)=><label key={name}>{name} · {weight}%<select value={scores[i]} onChange={e=>setScores(v=>v.map((x,j)=>j===i?Number(e.target.value):x))}><option value={-1}>Choose a score</option>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n} / 4</option>)}</select></label>)}<label>Demo review notes<textarea rows={3} maxLength={4000} value={feedback} onChange={e=>setFeedback(e.target.value)}/></label><Action disabled={scores.includes(-1)||feedback.trim().length<20} onClick={()=>mutate('basic_mentor_review',{mentorId:mentor,scores,feedback})}>Save demo review</Action><p className="small">Approval: 70/100 and every area at least 2/4. No certificate or professional verification is issued.</p>{r&&<Panel><Badge>{r.approved?'Demo approved':'Demo revision requested'}</Badge><h2>{r.total}/100</h2><p>{r.feedback}</p></Panel>}</details><p className="small">Intermediate and advanced journeys will be designed after the beginner review.</p></>}</Gate></>}
