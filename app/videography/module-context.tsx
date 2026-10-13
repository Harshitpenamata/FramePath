'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ExternalLink,Play,Target,ListChecks,Gift,LockKeyhole,BookOpen,Puzzle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Badge,Go,isExplore} from '../ui';
import {moduleHref} from '../learning-rules';
import {parseVideoKey,moduleLesson,projectLabel,freeModuleCount,isFreeModule,type Pathway} from './programme';
import {videosFor,moduleImages,imageSrcSet,type ModuleVideo} from './media';
import {lessonsFor,lessonVideos,videoId,watchShare,lessonsStatus,type LessonMark} from './lessons';
import {LessonTool} from './tools';

const stages=['Ideas','Planning','Filming','Editing','Your pathway','Final project'];

// Free plan: tasks and lesson tools in the first two modules. Self-paced or Mentor-led opens the rest.
export const canPractise=(s:any,key:string)=>isFreeModule(key)||isExplore(s)||['paid','active'].includes(s.craft?.status);
export const taskLabel=(moduleId:string)=>'Task '+moduleId;

// The six steps of the course, with this module's step highlighted.
function StageDiagram({current}:{current:string}){
 return <ol className="vg-stage-steps">{stages.map((s,i)=><li key={s} className={s===current?'current':''} aria-current={s===current?'step':undefined}><span>{i+1}</span>{s}</li>)}</ol>;
}

function embedUrl(v:ModuleVideo){return v.youtubeId?`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}${v.start?'&start='+v.start:''}`:`https://player.vimeo.com/video/${v.vimeoId}?autoplay=1${v.start?'#t='+v.start+'s':''}`}
const clock=(s:number)=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');

// Counts how long an embedded YouTube or Vimeo video really plays (skipping ahead doesn't count) and calls
// onWatched once it reaches watchShare of the video, from its start time to the end.
function useWatchTracker(iframe:React.RefObject<HTMLIFrameElement|null>,v:ModuleVideo|undefined,on:boolean,onWatched:()=>void){
 useEffect(()=>{
  if(!on||!v)return;
  let played=0,last=-1,duration=0,done=false;
  const add=(t:number,d:number,playing:boolean)=>{
   if(d>0)duration=d;
   if(playing&&last>=0&&t>last&&t-last<=2.5)played+=t-last;
   last=t;
   if(!done&&duration>0&&played>=watchShare*Math.max(1,duration-(v.start||0))){done=true;onWatched()}
  };
  let state=-1;
  const onMessage=(e:MessageEvent)=>{
   if(!/youtube(-nocookie)?\.com$|vimeo\.com$/.test(new URL(e.origin).hostname))return;
   let d:any;try{d=typeof e.data==='string'?JSON.parse(e.data):e.data}catch{return}
   if(d?.event==='infoDelivery'&&d.info){if(typeof d.info.playerState==='number')state=d.info.playerState;if(typeof d.info.currentTime==='number')add(d.info.currentTime,d.info.duration||0,state===1)}
   if(d?.event==='timeupdate'&&d.data)add(d.data.seconds,d.data.duration,true);
  };
  window.addEventListener('message',onMessage);
  // Ask the player to report its progress; repeat until it is ready.
  const hello=setInterval(()=>{const w=iframe.current?.contentWindow;if(!w)return;
   if(v.youtubeId)w.postMessage(JSON.stringify({event:'listening',id:'fp',channel:'widget'}),'*');
   else w.postMessage(JSON.stringify({method:'addEventListener',value:'timeupdate'}),'*');},1000);
  return ()=>{window.removeEventListener('message',onMessage);clearInterval(hello)};
 },[on,v&&videoId(v)]);
}

// Videos that play here (YouTube, Vimeo) go in a click-to-load player; lessons on other sites are link cards.
// watched: ids of videos already watched; onWatched: called with a video's id when it has been watched (or a link opened).
export function VideoPanel({videos,watched=[],onWatched}:{videos:ModuleVideo[];watched?:string[];onWatched?:(id:string)=>void}){
 const playable=videos.filter(v=>v.youtubeId||v.vimeoId),links=videos.filter(v=>v.url);
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(false);
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{setActive(0);setPlaying(false)},[videos[0]?.title]);
 const v=playable[active]||playable[0];
 useWatchTracker(frame,v,playing&&!!onWatched,()=>v&&onWatched?.(videoId(v)));
 if(!videos.length)return null;
 const seen=(x:ModuleVideo)=>watched.includes(videoId(x));
 return <div className="vg-video">
  {v&&<><div className="vg-video-frame">{playing
   ?<iframe ref={frame} src={embedUrl(v)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy"/>
   :<button type="button" className="vg-video-cover" onClick={()=>setPlaying(true)} style={v.youtubeId?{backgroundImage:`url(https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg)`}:undefined} aria-label={'Play '+v.title}><span className="vg-play"><Play size={30}/></span><span className="vg-video-title">{v.title}<small>{v.creator}{v.start?' · starts at '+clock(v.start):''}</small></span></button>}</div>
  <p className="vg-video-focus"><Target size={15}/> Watch for: {v.focus}</p>
  {onWatched&&<p className={'small vg-watch-state'+(seen(v)?' ok':'')}>{seen(v)?<><Check size={14}/> Watched</>:'Watch most of this video to tick it off.'}</p>}
  {playable.length>1&&<div className="vg-video-list">{playable.map((x,i)=><button type="button" key={x.title+i} className={i===active?'active':''} onClick={()=>{setActive(i);setPlaying(false)}}>{onWatched&&seen(x)?<Check size={14}/>:<Play size={14}/>}<span>{x.title}<small>{x.creator}{x.start?' · from '+clock(x.start):''}</small></span></button>)}</div>}</>}
  {links.length>0&&<div className="vg-video-links">{links.map(x=><a key={x.title+x.url} className="vg-link-card" href={x.url} target="_blank" rel="noopener noreferrer" onClick={()=>onWatched?.(videoId(x))}>
   <span><strong>{x.title}</strong><small>{x.creator}{x.section?' · '+x.section:''}</small><small>{x.focus}</small></span>
   <span className="vg-link-side">{onWatched&&seen(x)?<Badge tone="green"><Check size={12}/> Opened</Badge>:x.paid?<Badge>Optional · paid</Badge>:<Badge tone="green">Free</Badge>}<ExternalLink size={16}/></span></a>)}</div>}
 </div>;
}

// The lesson's sketchbook picture: a short silent clip that draws itself on, looping like a GIF.
// It is muted before it loads (browsers only autoplay muted video), then played and kept playing while on screen.
function LessonSketch({src,title}:{src:string;title:string}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const v=ref.current;if(!v)return;
  v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.loop=true;v.playsInline=true;
  v.src=src+'.mp4';v.load();
  const play=()=>{v.play().catch(()=>{})};
  v.addEventListener('canplay',play);play();
  const io=new IntersectionObserver(([e])=>{if(e.isIntersecting)play()});io.observe(v);
  return ()=>{v.removeEventListener('canplay',play);io.disconnect()};
 },[src]);
 return <video ref={ref} className="vg-sketch" poster={src+'.webp'} muted loop playsInline autoPlay preload="auto" aria-label={'Sketch: '+title}/>;
}

function SelfPacedLock({moduleKey,what}:{moduleKey:string;what:string}){
 return <div className="vg-locked-inline"><LockKeyhole size={20}/><div><strong>{what} {what.endsWith('s')?'are':'is'} part of Self-paced.</strong><p className="small">On the Free plan, modules 1 and 2 are open. You can still watch every video.</p></div><Go href={'/membership?return_to='+encodeURIComponent(moduleHref(moduleKey)+'?tab=task')}>Unlock with Self-paced</Go></div>;
}

// Lessons tab: module intro, then each lesson's Watch and Reflect, then a pointer to the task.
export function LessonsTab({moduleKey,onTask}:{moduleKey:string;onTask:()=>void}){
 const {s,user,mutate}=useLearning();
 const parsed=parseVideoKey(moduleKey);
 const [index,setIndex]=useState(0);
 useEffect(()=>{const n=Number(new URLSearchParams(window.location.search).get('lesson'));if(n>0)setIndex(n-1)},[]);
 if(!parsed)return null;
 const m=parsed.module,p=s.programme;
 const pathway:Pathway=p?.primaryPathway||'Documentary';
 const lesson=moduleLesson(m,projectLabel(p)),image=moduleImages[m.id];
 const lessons=lessonsFor(m.id),open=canPractise(s,moduleKey);
 const item=lessons[Math.min(index,lessons.length-1)],at=Math.min(index,lessons.length-1);
 // Progress is saved to the account (signed-in learners on a plan that covers this module).
 const marks:Record<string,LessonMark>=s.lessonProgress?.[moduleKey]||{};
 const status=lessonsStatus(m.id,pathway,marks),done=(i:number)=>status.finished[i];
 const save=(body:any)=>{if(user&&open)void mutate('lesson_progress',{key:moduleKey,index:at,...body})};
 const mark=marks[at],videos=lessonVideos(m.id,at,pathway);
 const go=(i:number)=>{setIndex(i);document.getElementById('vg-lesson-top')?.scrollIntoView({behavior:'smooth',block:'start'})};
 return <div className="vg-context">
  <div className="vg-context-hero">
   {image&&<img src={`${image.base}-960.webp`} srcSet={imageSrcSet(image)} sizes="(max-width: 760px) 100vw, 640px" alt={image.alt} loading="lazy"/>}
   <div><Badge>{m.id} · {m.stageLabel}</Badge>{parsed.index<freeModuleCount&&<Badge tone="green"><Gift size={12}/> Free</Badge>}<p className="vg-outcome">{m.outcome}</p><span className="small">About {m.hours} hours{lessons.length>0&&` · ${lessons.length} lessons`}</span></div>
  </div>
  <section><h3>Where this fits in making a video</h3><StageDiagram current={m.stageLabel}/></section>
  {m.stage==='selected-pathway'&&<p className="notice">Your style: <strong>{pathway}</strong>. It comes from the first interest you picked.</p>}

  {item?<section className="vg-lessons" id="vg-lesson-top">
   <ol className="vg-lesson-steps" aria-label="Lessons">{lessons.map((x,i)=><li key={x.title}><button type="button" className={(i===index?'current ':'')+(done(i)?'done':'')} aria-current={i===index?'step':undefined} onClick={()=>go(i)}><span>{done(i)?<Check size={14}/>:i+1}</span>{x.title}</button></li>)}</ol>
   <article className="vg-lesson-card">
    <span className="eyebrow">LESSON {index+1} OF {lessons.length}</span><h2>{item.title}</h2>
    {user&&open&&<p className={'small vg-lesson-status'+(done(at)?' ok':'')}>{done(at)?<><Check size={14}/> Lesson finished</>:<>To finish this lesson: watch {videos.length===1?'the video':`all ${videos.length} videos`} ({videos.filter(v=>mark?.v.includes(videoId(v))).length} of {videos.length} done){videos.length?' and ':''}solve the practice tool ({mark?.t?'done':'not yet'}).</>}</p>}
    <LessonSketch key={m.id+index} src={`/sketches/${m.id}-${index+1}`} title={item.title}/>
    <div className="vg-lesson-part"><h3><BookOpen size={18}/> Watch</h3><p className="vg-idea">{item.idea}</p><VideoPanel videos={videos} watched={mark?.v||[]} onWatched={user&&open?(id=>{if(!mark?.v.includes(id))save({video:id})}):undefined}/></div>
    <div className="vg-lesson-part"><h3><Puzzle size={18}/> Reflect: try it</h3>{open?<LessonTool key={moduleKey+index} tool={item.tool} onSolved={()=>{if(!mark?.t)save({tool:true})}}/>:<SelfPacedLock moduleKey={moduleKey} what="Practice tools"/>}</div>
    <div className="button-row between">{index>0?<Button variant="outline" onClick={()=>go(index-1)}><ArrowLeft size={16}/>Previous lesson</Button>:<span/>}{index<lessons.length-1?<Button onClick={()=>go(index+1)}>Next lesson<ArrowRight size={16}/></Button>:<Button onClick={onTask}>Go to the task<ArrowRight size={16}/></Button>}</div>
   </article>
  </section>:<>
   <section><h3>What you’ll learn</h3><ul className="vg-topics">{m.topics.map(t=><li key={t}>{t}</li>)}</ul></section>
   <section><h3>Watch</h3><VideoPanel videos={videosFor(m.id,pathway)}/></section>
  </>}

  <section className={'vg-assignment-preview'+(open?'':' locked')}>
   <span className="eyebrow">{taskLabel(m.id)}</span><h3><ListChecks size={18}/> {m.taskName}</h3>
   <p>{lesson.do}</p>
   {!open?<SelfPacedLock moduleKey={moduleKey} what="This task"/>:status.done<status.total?<div className="vg-locked-inline"><LockKeyhole size={20}/><div><strong>Finish all {status.total} lessons to unlock this task.</strong><p className="small">{status.done} of {status.total} done. Watch each video and try each practice tool.</p></div></div>:<Button onClick={onTask}>Start the task</Button>}
  </section>
 </div>;
}
