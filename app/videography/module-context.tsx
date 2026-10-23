'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ExternalLink,Lightbulb,ListChecks,LockKeyhole,Maximize2,Play,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Badge,Go,isExplore} from '../ui';
import {moduleHref} from '../learning-rules';
import {stageOrder,parseVideoKey,moduleLesson,projectLabel,isFreeModule,modulesFor,moduleKey as keyOf,type Pathway} from './programme';
import {videosFor,type ModuleVideo} from './media';
import {lessonsFor,lessonVideos,videoId,watchShare,lessonsStatus,requireLessonsForTask,type LessonMark} from './lessons';
import {ReflectStep,TestOut} from './reflect';

const stages=stageOrder;

// Free plan: tasks and lesson tools in the first two modules. Self-paced or Mentor-led opens the rest.
export const canPractise=(s:any,key:string)=>isFreeModule(key)||isExplore(s)||['paid','active'].includes(s.craft?.status);
export const taskLabel=(moduleId:string)=>'Task '+moduleId;

// The six steps of the course, with this module's step highlighted.
function StageDiagram({current,done=[]}:{current:string;done?:string[]}){
 return <ol className="vg-stage-steps">{stages.map((s,i)=><li key={s} className={[s===current&&'current',done.includes(s)&&'done'].filter(Boolean).join(' ')} aria-current={s===current?'step':undefined}><span>{done.includes(s)?<Check size={13}/>:i+1}</span>{s}</li>)}</ol>;
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
// Sites that refuse to be shown inside another site (checked 14 Oct 2026). Their lessons open in a new tab.
const noFrameHosts=['studiobinder.com','helpx.adobe.com','deitymic.com','collab.sundance.org','unscripted.com','school.learnlightandsound.com','academy.dslrvideoshooter.com','learnlightandsound.com'];
const canFrame=(url?:string)=>{try{const h=new URL(url||'').hostname.replace(/^www\./,'');return !noFrameHosts.some(x=>h===x||h.endsWith('.'+x))}catch{return false}};
const sketchSpeed=0.5;

// A lesson from another site, shown in a window on our page with its creator and site credited.
function SiteWindow({v,onClose}:{v:ModuleVideo;onClose:()=>void}){
 const close=useRef<HTMLButtonElement>(null);
 useEffect(()=>{close.current?.focus();document.body.style.overflow='hidden';const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',key);return ()=>{window.removeEventListener('keydown',key);document.body.style.overflow=''}},[]);
 const site=new URL(v.url!).hostname.replace(/^www\./,'');
 return <div className="vg-site-window" role="dialog" aria-modal="true" aria-label={v.title} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div className="vg-site-box">
   <div className="vg-site-bar"><div><strong>{v.title}</strong><span className="small">By {v.creator} · on {site}</span></div>
    <a className="text-link small" href={v.url} target="_blank" rel="noopener noreferrer">Open on {site} <ExternalLink size={13}/></a>
    <button ref={close} type="button" className="vg-site-close" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
   <iframe src={v.url} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
   <p className="small vg-site-note">Content and credit: {v.creator}, {site}. {v.focus}</p>
  </div>
 </div>;
}

// Lesson videos the health check found removed or not embeddable; fetched once per page.
let deadOnce:Promise<string[]>|null=null;
export function useDeadVideos(){const [dead,setDead]=useState<string[]>([]);useEffect(()=>{(deadOnce||=fetch('/api/videos/status').then(r=>r.json()).then((d:any)=>d.dead||[]).catch(()=>[])).then(setDead)},[]);return dead}

// Some browsers and ad blockers stop the player from reporting progress. If a playing video sends nothing for 12
// seconds, the learner can tick it off by hand once enough time has passed for most of it to play (70% of its
// length when the player told us, otherwise 2 minutes).
function useTrackingFallback(frame:React.RefObject<HTMLIFrameElement|null>,v:ModuleVideo|undefined,on:boolean){
 const [blocked,setBlocked]=useState(false),[left,setLeft]=useState(0);
 useEffect(()=>{
  setBlocked(false);if(!on||!v)return;
  let heard=false,started=Date.now(),need=120;
  const msg=(e:MessageEvent)=>{if(e.source&&e.source===frame.current?.contentWindow){heard=true;try{const d=typeof e.data==='string'?JSON.parse(e.data):e.data;const dur=d?.info?.duration||d?.data?.duration;if(dur>0)need=Math.max(30,Math.round((dur-(v.start||0))*watchShare))}catch{}}};
  window.addEventListener('message',msg);
  const t=setInterval(()=>{const gone=(Date.now()-started)/1000;if(!heard&&gone>12)setBlocked(true);setLeft(Math.max(0,Math.ceil(need-gone)))},1000);
  return ()=>{window.removeEventListener('message',msg);clearInterval(t)};
 },[on,v&&videoId(v)]);
 return {blocked,ready:blocked&&left===0,wait:Math.floor(left/60)+':'+String(left%60).padStart(2,'0')};
}

export function VideoPanel({videos:all,watched=[],onWatched}:{videos:ModuleVideo[];watched?:string[];onWatched?:(id:string)=>void}){
 const dead=useDeadVideos(),videos=all.filter(v=>!dead.includes(videoId(v)));
 const playable=videos.filter(v=>v.youtubeId||v.vimeoId),links=videos.filter(v=>v.url);
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(false),[reader,setReader]=useState<ModuleVideo|null>(null);
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{setActive(0);setPlaying(false)},[videos[0]?.title]);
 const v=playable[active]||playable[0];
 useWatchTracker(frame,v,playing&&!!onWatched,()=>v&&onWatched?.(videoId(v)));
 const fallback=useTrackingFallback(frame,v,playing&&!!onWatched);
 if(!videos.length)return null;
 const seen=(x:ModuleVideo)=>watched.includes(videoId(x));
 const cards=links.length>0&&<div className="vg-video-links">{links.map(x=><a key={x.title+x.url} className={'vg-link-card'+(onWatched&&seen(x)?' watched':'')} href={x.url} target="_blank" rel="noopener noreferrer" onClick={e=>{onWatched?.(videoId(x));if(canFrame(x.url)){e.preventDefault();setReader(x)}}}>
   <span><strong>{x.title}</strong><small>{x.creator}{x.section?' · '+x.section:''}</small><small>{x.focus}</small></span>
   <span className="vg-link-side">{onWatched&&seen(x)?<Badge tone="green"><Check size={12}/> Opened</Badge>:x.paid?<Badge>Optional · paid</Badge>:<Badge tone="green">Free</Badge>}{canFrame(x.url)?<Maximize2 size={16}/>:<ExternalLink size={16}/>}</span></a>)}</div>;
 // The player, a strip of the lesson's videos under it, then the open video's title and what to watch for.
 // Lessons on other sites follow as cards.
 return <div className="vg-video">
  {v&&<div className="vg-video-frame">{playing
   ?<iframe ref={frame} src={embedUrl(v)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy"/>
   :<button type="button" className="vg-video-cover" onClick={()=>setPlaying(true)} style={v.youtubeId?{backgroundImage:`url(https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg)`}:undefined} aria-label={'Play '+v.title}><span className="vg-play"><Play size={30}/></span></button>}</div>}
  {playable.length>1&&<ol className="vg-video-strip" aria-label="Videos in this lesson">{playable.map((x,i)=><li key={x.title+i}><button type="button" className={[i===active&&'active',onWatched&&seen(x)&&'watched'].filter(Boolean).join(' ')} aria-current={i===active?'true':undefined} onClick={()=>{setActive(i);setPlaying(false)}}><span className="vg-strip-n">{onWatched&&seen(x)?<Check size={14}/>:String(i+1).padStart(2,'0')}</span><span className="vg-strip-t">{x.title}<small>{x.creator}</small></span></button></li>)}</ol>}
  {v&&<div className="vg-video-about">
   <h4>{v.title}</h4><span className="small">{v.creator}{v.start?' · starts at '+clock(v.start):''}</span>
   <p className="vg-video-focus"><Lightbulb size={16}/> Watch for: {v.focus}</p>
   {onWatched&&<p className={'small vg-watch-state'+(seen(v)?' ok':'')}>{seen(v)?<><Check size={14}/> Watched</>:fallback.blocked?'Your browser is blocking the player’s progress, so we can’t tick this off by itself.':'Watch most of this video to tick it off.'}</p>}
   {onWatched&&!seen(v)&&fallback.blocked&&<Button size="sm" variant="outline" disabled={!fallback.ready} onClick={()=>onWatched(videoId(v))}>{fallback.ready?'I’ve watched it':'I’ve watched it (available in '+fallback.wait+')'}</Button>}
  </div>}
  {cards}
  {reader&&<SiteWindow v={reader} onClose={()=>setReader(null)}/>}
 </div>;
}

// The lesson's sketchbook picture: a short silent clip that draws itself on, looping like a GIF.
// It is muted before it loads (browsers only autoplay muted video), then played and kept playing while on screen.
// Lessons without a sketch yet (the AI and professional-skills lessons) show none: the clip fails to load and it hides.
function LessonSketch({src,title}:{src:string;title:string}){
 const ref=useRef<HTMLVideoElement>(null),[missing,setMissing]=useState(false);
 useEffect(()=>{
  const v=ref.current;if(!v)return;
  v.muted=true;v.defaultMuted=true;v.setAttribute('muted','');v.loop=true;v.playsInline=true;
  v.src=src+'.mp4';v.load();
  const play=()=>{v.defaultPlaybackRate=v.playbackRate=sketchSpeed;v.play().catch(()=>{})};
  const gone=()=>setMissing(true);
  v.addEventListener('canplay',play);v.addEventListener('error',gone);play();
  const io=new IntersectionObserver(([e])=>{if(e.isIntersecting)play()});io.observe(v);
  return ()=>{v.removeEventListener('canplay',play);v.removeEventListener('error',gone);io.disconnect()};
 },[src]);
 if(missing)return null;
 return <video ref={ref} className="vg-sketch" poster={src+'.webp'} muted loop playsInline autoPlay preload="auto" aria-label={'Sketch: '+title}/>;
}

function SelfPacedLock({moduleKey,what}:{moduleKey:string;what:string}){
 return <div className="vg-locked-inline"><LockKeyhole size={20}/><div><strong>{what} {what.endsWith('s')?'are':'is'} part of Self-paced.</strong><p className="small">On the Free plan, modules 1 and 2 are open. You can still watch every video.</p></div><Go href={'/membership?return_to='+encodeURIComponent(moduleHref(moduleKey)+'?tab=task')}>Unlock with Self-paced</Go></div>;
}

// Lessons tab: module intro, then each lesson's Watch and Reflect, then a pointer to the task.
export function LessonsTab({moduleKey,onTask,onLesson}:{moduleKey:string;onTask:()=>void;onLesson?:(index:number,count:number)=>void}){
 const {s,user,mutate,busy}=useLearning();
 const parsed=parseVideoKey(moduleKey);
 const [index,setIndex]=useState(0);
 useEffect(()=>{const n=Number(new URLSearchParams(window.location.search).get('lesson'));if(n>0)setIndex(n-1)},[]);
 // Tells the module page which lesson is open, so Next module only shows on the last one.
 useEffect(()=>{if(parsed)onLesson?.(index,lessonsFor(parsed.module.id).length)},[index,moduleKey]);
 if(!parsed)return null;
 const m=parsed.module,p=s.programme;
 const pathway:Pathway=p?.primaryPathway||'Documentary';
 const lesson=moduleLesson(m,projectLabel(p));
 const lessons=lessonsFor(m.id),open=canPractise(s,moduleKey);
 const item=lessons[Math.min(index,lessons.length-1)],at=Math.min(index,lessons.length-1);
 // Progress is saved to the account (signed-in learners on a plan that covers this module).
 const marks:Record<string,LessonMark>=s.lessonProgress?.[moduleKey]||{};
 const dead=useDeadVideos();
 const status=lessonsStatus(m.id,pathway,marks,dead),done=(i:number)=>status.finished[i];
 const save=(body:any)=>{if(user&&open)void mutate('lesson_progress',{key:moduleKey,index:at,...body})};
 const mark=marks[at],videos=lessonVideos(m.id,at,pathway);
 // Videos still online; the questions open once they are all watched. Next lesson waits until the lesson is finished.
 const live=videos.filter(v=>!dead.includes(videoId(v))),watched=(v:ModuleVideo)=>!!mark?.v.includes(videoId(v)),allWatched=live.every(watched),locked=!!user&&open&&!done(at);
 const go=(i:number)=>{setIndex(i);document.getElementById('vg-lesson-top')?.scrollIntoView({behavior:'smooth',block:'start'})};
 return <div className="vg-context">
  <section><h3>Where this fits in making a video</h3><StageDiagram current={m.stageLabel} done={[...new Set(modulesFor(parsed.level).map(x=>x.stageLabel))].filter(st=>modulesFor(parsed.level).every((x,i)=>x.stageLabel!==st||!!s.progress?.[keyOf(parsed.level,i)]))}/></section>
  {m.stage==='selected-pathway'&&<p className="notice">Your course: <strong>{pathway}</strong>. Switch between your styles under My courses on your Journey page.</p>}

  {item?<section className="vg-lessons" id="vg-lesson-top">
   {user&&open&&!lessons.every((l,i)=>l.optional||done(i))&&<TestOut moduleId={m.id} moduleKey={moduleKey} lessonCount={lessons.length} videosFor={i=>lessonVideos(m.id,i,pathway)} mutate={mutate} busy={busy} result={s.lastTestOut}/>}
   <ol className="vg-lesson-steps" aria-label="Lessons">{lessons.map((x,i)=><li key={x.title}><button type="button" className={(i===index?'current ':'')+(done(i)?'done':'')} aria-current={i===index?'step':undefined} onClick={()=>go(i)}><span>{done(i)?<Check size={14}/>:i+1}</span>{x.title}{x.optional&&<small className="vg-optional-tag">Optional</small>}</button></li>)}</ol>
   {/* Lesson layout (site edits, item 6): header with progress, 01 Watch, 02 Think it through (opens once the
       videos are watched), then the way on. */}
   <article className="vg-lesson-card">
    <header className="vg-lesson-intro">
     <LessonSketch key={m.id+index} src={`/sketches/${m.id}-${index+1}`} title={item.title}/>
     <div className="vg-lesson-about"><span className="eyebrow">Lesson {index+1} of {lessons.length}</span><h2>{item.title}</h2>{item.optional&&<p className="vg-optional">Optional · {item.optional}. Watch if you can; you don’t need it to finish the module.</p>}<p className="vg-idea">{item.idea}</p></div>
     {live.length>0&&<div className="vg-lesson-progress"><span className="vg-dots" aria-hidden="true">{live.map(v=><i key={videoId(v)} className={watched(v)?'done':''}/>)}</span><span className="small">{live.filter(watched).length} of {live.length} {live.length===1?'video':'videos'} watched</span></div>}
    </header>
    <section className="vg-lesson-part"><div className="vg-part-head"><h3><span>01 /</span> Watch</h3>{live.length>0&&<span className="eyebrow">{live.length} {live.length===1?'video':'videos'}</span>}</div>
     <VideoPanel videos={videos} watched={mark?.v||[]} onWatched={user&&open?(id=>{if(!mark?.v.includes(id))save({video:id})}):undefined}/></section>
    <section className="vg-lesson-part"><div className="vg-part-head"><h3><span>02 /</span> Think it through</h3></div><p className="small vg-part-lede">Turn what you watched into a practical decision.</p>
     {!open?<SelfPacedLock moduleKey={moduleKey} what="Think it through questions"/>
      :user&&!allWatched?<div className="vg-locked-inline"><LockKeyhole size={20}/><div><strong>Watch {live.length===1?'the video':`all ${live.length} videos`} to open these questions.</strong><p className="small">{live.filter(watched).length} of {live.length} watched so far.</p></div></div>
      :<ReflectStep moduleId={m.id} index={index} tool={item.tool} videos={videos} onSolved={()=>{if(!mark?.t)save({tool:true})}}/>}</section>
    <footer className="vg-lesson-foot">
     <p className={'small'+(done(at)?' ok':'')}>{!user||!open?'':done(at)?<><Check size={14}/> Lesson finished</>:`Complete ${live.length===1?'the video':live.length?`all ${live.length} videos`:'this lesson'} and the questions to continue.`}</p>
     <div className="button-row">{index>0&&<Button variant="outline" onClick={()=>go(index-1)}><ArrowLeft size={16}/>Previous lesson</Button>}
      {index<lessons.length-1?<Button disabled={locked} onClick={()=>go(index+1)}>Next lesson<ArrowRight size={16}/></Button>:<Button disabled={locked} onClick={onTask}>Go to the task<ArrowRight size={16}/></Button>}</div>
    </footer>
   </article>
  </section>:<>
   <section><h3>What you’ll learn</h3><ul className="vg-topics">{m.topics.map(t=><li key={t}>{t}</li>)}</ul></section>
   <section><h3>Watch</h3><VideoPanel videos={videosFor(m.id,pathway)}/></section>
  </>}

  {(!item||at===lessons.length-1)&&<section className={'vg-assignment-preview'+(open?'':' locked')}>
   <span className="eyebrow">{taskLabel(m.id)}</span><h3><ListChecks size={18}/> {m.taskName}</h3>
   <p>{lesson.do}</p>
   {!open?<SelfPacedLock moduleKey={moduleKey} what="This task"/>:requireLessonsForTask&&status.done<status.total?<div className="vg-locked-inline"><LockKeyhole size={20}/><div><strong>Finish all {status.total} lessons to unlock this task.</strong><p className="small">{status.done} of {status.total} done. Watch each video and answer each lesson’s Think it through questions.</p></div></div>:<Button onClick={onTask}>Start the task</Button>}
  </section>}
 </div>;
}
