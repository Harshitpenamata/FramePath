'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ExternalLink,Play,Target,ListChecks,Gift,LockKeyhole,BookOpen,Puzzle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Badge,Go,isExplore} from '../ui';
import {moduleHref} from '../learning-rules';
import {parseVideoKey,moduleLesson,projectLabel,freeModuleCount,isFreeModule,type Pathway} from './programme';
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

function embedUrl(v:ModuleVideo){return v.youtubeId?`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0${v.start?'&start='+v.start:''}`:`https://player.vimeo.com/video/${v.vimeoId}?autoplay=1${v.start?'#t='+v.start+'s':''}`}
const clock=(s:number)=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

// Videos that play here (YouTube, Vimeo) go in a click-to-load player; lessons on other sites are link cards.
export function VideoPanel({videos}:{videos:ModuleVideo[]}){
 const playable=videos.filter(v=>v.youtubeId||v.vimeoId),links=videos.filter(v=>v.url);
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(false);
 useEffect(()=>{setActive(0);setPlaying(false)},[videos[0]?.title]);
 if(!videos.length)return null;const v=playable[active]||playable[0];
 return <div className="vg-video">
  {v&&<><div className="vg-video-frame">{playing
   ?<iframe src={embedUrl(v)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy"/>
   :<button type="button" className="vg-video-cover" onClick={()=>setPlaying(true)} style={v.youtubeId?{backgroundImage:`url(https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg)`}:undefined} aria-label={'Play '+v.title}><span className="vg-play"><Play size={30}/></span><span className="vg-video-title">{v.title}<small>{v.creator}{v.start?' · starts at '+clock(v.start):''}</small></span></button>}</div>
  <p className="vg-video-focus"><Target size={15}/> Watch for: {v.focus}</p>
  {playable.length>1&&<div className="vg-video-list">{playable.map((x,i)=><button type="button" key={x.title+i} className={i===active?'active':''} onClick={()=>{setActive(i);setPlaying(false)}}><Play size={14}/><span>{x.title}<small>{x.creator}{x.start?' · from '+clock(x.start):''}</small></span></button>)}</div>}</>}
  {links.length>0&&<div className="vg-video-links">{links.map(x=><a key={x.title+x.url} className="vg-link-card" href={x.url} target="_blank" rel="noopener noreferrer">
   <span><strong>{x.title}</strong><small>{x.creator}{x.section?' · '+x.section:''}</small><small>{x.focus}</small></span>
   <span className="vg-link-side">{x.paid?<Badge>Optional · paid</Badge>:<Badge tone="green">Free</Badge>}<ExternalLink size={16}/></span></a>)}</div>}
 </div>;
}

// The lesson's sketchbook picture: a short silent clip that draws itself on, then holds.
// With reduced motion it shows the finished page. Click to watch it draw again.
function LessonSketch({src,title}:{src:string;title:string}){
 const ref=useRef<HTMLVideoElement>(null),[still,setStill]=useState(false);
 useEffect(()=>{setStill(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)},[]);
 // React leaves out the muted attribute, which blocks autoplay; set it and start the clip here.
 useEffect(()=>{const v=ref.current;if(v){v.muted=true;v.play().catch(()=>{})}},[still,src]);
 if(still)return <img className="vg-sketch" src={src+'.webp'} alt={'Sketch: '+title} loading="lazy"/>;
 return <video ref={ref} className="vg-sketch" src={src+'.mp4'} poster={src+'.webp'} muted playsInline autoPlay preload="metadata" aria-label={'Sketch: '+title} onClick={()=>{const v=ref.current;if(v){v.currentTime=0;v.play().catch(()=>{})}}}/>;
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
    <LessonSketch key={m.id+index} src={`/sketches/${m.id}-${index+1}`} title={item.title}/>
    <div className="vg-lesson-part"><h3><BookOpen size={18}/> Watch</h3><p className="vg-idea">{item.idea}</p><VideoPanel videos={lessonVideos(m.id,Math.min(index,lessons.length-1),pathway)}/></div>
    <div className="vg-lesson-part"><h3><Puzzle size={18}/> Reflect: try it</h3>{open?<LessonTool key={moduleKey+index} tool={item.tool} onSolved={()=>mark(index)}/>:<SelfPacedLock moduleKey={moduleKey} what="Practice tools"/>}</div>
    <div className="button-row between">{index>0?<Button variant="outline" onClick={()=>go(index-1)}><ArrowLeft size={16}/>Previous lesson</Button>:<span/>}{index<lessons.length-1?<Button onClick={()=>go(index+1)}>Next lesson<ArrowRight size={16}/></Button>:<Button onClick={onTask}>Go to the task<ArrowRight size={16}/></Button>}</div>
   </article>
  </section>:<>
   <section><h3>What you’ll learn</h3><ul className="vg-topics">{m.topics.map(t=><li key={t}>{t}</li>)}</ul></section>
   <section><h3>Watch</h3><VideoPanel videos={videosFor(m.id,pathway)}/></section>
  </>}

  <section className={'vg-assignment-preview'+(open?'':' locked')}>
   <span className="eyebrow">{taskLabel(m.id)}</span><h3><ListChecks size={18}/> {m.taskName}</h3>
   <p>{lesson.do}</p>
   {open?<Button onClick={onTask}>Start the task</Button>:<SelfPacedLock moduleKey={moduleKey} what="This task"/>}
  </section>
 </div>;
}
