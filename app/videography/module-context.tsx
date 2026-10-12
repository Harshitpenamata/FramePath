'use client';
import React,{useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ExternalLink,Play,Target,ListChecks,Gift,LockKeyhole,BookOpen,Puzzle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Badge,Go,isExplore} from '../ui';
import {moduleHref} from '../learning-rules';
import {parseVideoKey,moduleLesson,projectLabel,interestFor,freeModuleCount,isFreeModule,type Pathway} from './programme';
import {videosFor,moduleImages,imageSrcSet,type ModuleVideo} from './media';
import {lessonsFor,lessonVideos} from './lessons';
import {LessonTool} from './tools';

const stages=['Ideas','Planning','Filming','Editing','Your pathway','Final project'];

// Free plan: tasks and lesson tools in the first two modules. Self-paced or Mentor-led opens the rest.
export const canPractise=(s:any,key:string)=>isFreeModule(key)||isExplore(s)||['paid','active'].includes(s.craft?.status);
export const taskLabel=(moduleId:string)=>'Task '+moduleId;

// The six steps of the course, with this module's step highlighted.
function StageDiagram({current}:{current:string}){
 return <ol className="vg-stage-steps">{stages.map((s,i)=><li key={s} className={s===current?'current':''} aria-current={s===current?'step':undefined}><span>{i+1}</span>{s}</li>)}</ol>;
}

function embedUrl(v:ModuleVideo){return v.youtubeId?`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`:`https://player.vimeo.com/video/${v.vimeoId}?autoplay=1`}
function sourceUrl(v:ModuleVideo){return v.youtubeId?`https://www.youtube.com/watch?v=${v.youtubeId}`:`https://vimeo.com/${v.vimeoId}`}

// Click-to-load player: only the thumbnail image loads until the learner presses Play.
export function VideoPanel({videos}:{videos:ModuleVideo[]}){
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(false);
 useEffect(()=>{setActive(0);setPlaying(false)},[videos[0]?.title]);
 if(!videos.length)return null;const v=videos[active]||videos[0];
 return <div className="vg-video">
  <div className="vg-video-frame">{playing
   ?<iframe src={embedUrl(v)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy"/>
   :<button type="button" className="vg-video-cover" onClick={()=>setPlaying(true)} style={v.youtubeId?{backgroundImage:`url(https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg)`}:undefined} aria-label={'Play '+v.title}><span className="vg-play"><Play size={30}/></span><span className="vg-video-title">{v.title}<small>{v.creator}</small></span></button>}</div>
  <p className="vg-video-focus"><Target size={15}/> Watch for: {v.focus}</p>
  {videos.length>1&&<div className="vg-video-list">{videos.map((x,i)=><button type="button" key={x.title} className={i===active?'active':''} onClick={()=>{setActive(i);setPlaying(false)}}><Play size={14}/><span>{x.title}<small>{x.creator} · {x.youtubeId?'YouTube':'Vimeo'}</small></span></button>)}</div>}
  <a className="small vg-source" href={sourceUrl(v)} target="_blank" rel="noopener noreferrer">Open on {v.youtubeId?'YouTube':'Vimeo'} <ExternalLink size={12}/></a>
 </div>;
}

// Lesson ticks are kept on this device.
const doneKey=(key:string)=>'fp-lessons-'+key;
function useLessonsDone(key:string){
 const [done,setDone]=useState<number[]>([]);
 useEffect(()=>{try{setDone(JSON.parse(localStorage.getItem(doneKey(key))||'[]'))}catch{setDone([])}},[key]);
 const mark=(i:number)=>setDone(prev=>{if(prev.includes(i))return prev;const next=[...prev,i];try{localStorage.setItem(doneKey(key),JSON.stringify(next))}catch{}return next});
 return [done,mark] as const;
}

function SelfPacedLock({moduleKey,what}:{moduleKey:string;what:string}){
 return <div className="vg-locked-inline"><LockKeyhole size={20}/><div><strong>{what} {what.endsWith('s')?'are':'is'} part of Self-paced.</strong><p className="small">On the Free plan, modules 1 and 2 are open. You can still watch every video.</p></div><Go href={'/membership?return_to='+encodeURIComponent(moduleHref(moduleKey)+'?tab=task')}>Unlock with Self-paced</Go></div>;
}

// Lessons tab: module intro, then each lesson's Watch and Reflect, then a pointer to the task.
export function LessonsTab({moduleKey,onTask}:{moduleKey:string;onTask:()=>void}){
 const {s}=useLearning();
 const parsed=parseVideoKey(moduleKey);
 const [index,setIndex]=useState(0);
 const [done,mark]=useLessonsDone(moduleKey);
 useEffect(()=>{const n=Number(new URLSearchParams(window.location.search).get('lesson'));if(n>0)setIndex(n-1)},[]);
 if(!parsed)return null;
 const m=parsed.module,p=s.programme;
 const pathway:Pathway=p?.primaryPathway||'Documentary';
 const lesson=moduleLesson(m,projectLabel(p)),image=moduleImages[m.id];
 const extras=(p?.interests||[]).slice(1).map((id:string)=>interestFor(id)?.label).filter(Boolean);
 const lessons=lessonsFor(m.id),open=canPractise(s,moduleKey);
 const item=lessons[Math.min(index,lessons.length-1)];
 const go=(i:number)=>{setIndex(i);document.getElementById('vg-lesson-top')?.scrollIntoView({behavior:'smooth',block:'start'})};
 return <div className="vg-context">
  <div className="vg-context-hero">
   {image&&<img src={`${image.base}-960.webp`} srcSet={imageSrcSet(image)} sizes="(max-width: 760px) 100vw, 640px" alt={image.alt} loading="lazy"/>}
   <div><Badge>{m.id} · {m.stageLabel}</Badge>{parsed.index<freeModuleCount&&<Badge tone="green"><Gift size={12}/> Free</Badge>}<p className="vg-outcome">{m.outcome}</p><span className="small">About {m.hours} hours{lessons.length>0&&` · ${lessons.length} lessons`}</span></div>
  </div>
  <section><h3>Where this fits in making a video</h3><StageDiagram current={m.stageLabel}/></section>
  {m.stage==='selected-pathway'&&<p className="notice">Your style: <strong>{pathway}</strong>. It comes from the first interest you picked.</p>}

  {item?<section className="vg-lessons" id="vg-lesson-top">
   <ol className="vg-lesson-steps" aria-label="Lessons">{lessons.map((x,i)=><li key={x.title}><button type="button" className={(i===index?'current ':'')+(done.includes(i)?'done':'')} aria-current={i===index?'step':undefined} onClick={()=>go(i)}><span>{done.includes(i)?<Check size={14}/>:i+1}</span>{x.title}</button></li>)}</ol>
   <article className="vg-lesson-card">
    <span className="eyebrow">LESSON {index+1} OF {lessons.length}</span><h2>{item.title}</h2>
    <div className="vg-lesson-part"><h3><BookOpen size={18}/> Watch</h3><p className="vg-idea">{item.idea}</p><VideoPanel videos={lessonVideos(item,pathway)}/></div>
    <div className="vg-lesson-part"><h3><Puzzle size={18}/> Reflect: try it</h3>{open?<LessonTool key={moduleKey+index} tool={item.tool} onSolved={()=>mark(index)}/>:<SelfPacedLock moduleKey={moduleKey} what="Practice tools"/>}</div>
    <div className="button-row between">{index>0?<Button variant="outline" onClick={()=>go(index-1)}><ArrowLeft size={16}/>Previous lesson</Button>:<span/>}{index<lessons.length-1?<Button onClick={()=>go(index+1)}>Next lesson<ArrowRight size={16}/></Button>:<Button onClick={onTask}>Go to the task<ArrowRight size={16}/></Button>}</div>
   </article>
  </section>:<>
   <section><h3>What you’ll learn</h3><ul className="vg-topics">{m.topics.map(t=><li key={t}>{t}</li>)}</ul></section>
   <section><h3>Watch</h3><VideoPanel videos={videosFor(m.id,pathway)}/></section>
  </>}
  <p className="small">These videos are made by other creators. They may change or be taken down.</p>
  {extras.length>0&&<p className="small">You can also try this with your other interests: {extras.join(', ')}.</p>}

  <section className={'vg-assignment-preview'+(open?'':' locked')}>
   <span className="eyebrow">{taskLabel(m.id)}</span><h3><ListChecks size={18}/> {m.taskName}</h3>
   <p>{lesson.do}</p>
   {open?<Button onClick={onTask}>Start the task</Button>:<SelfPacedLock moduleKey={moduleKey} what="This task"/>}
  </section>
 </div>;
}
