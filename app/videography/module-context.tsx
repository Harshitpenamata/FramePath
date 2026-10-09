'use client';
import React,{useState} from 'react';
import {ExternalLink,Play,Target,ListChecks,Gift} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning,Badge} from '../ui';
import {parseVideoKey,moduleLesson,projectLabel,interestFor,freeModuleCount,type Pathway} from './programme';
import {videosFor,moduleImages,imageSrcSet,type ModuleVideo} from './media';

const stages=['Ideas','Planning','Filming','Editing','Your pathway','Final project'];

// The six steps of the course, with this module's step highlighted.
function StageDiagram({current}:{current:string}){
 return <ol className="vg-stage-steps">{stages.map((s,i)=><li key={s} className={s===current?'current':''} aria-current={s===current?'step':undefined}><span>{i+1}</span>{s}</li>)}</ol>;
}

function embedUrl(v:ModuleVideo){return v.youtubeId?`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`:`https://player.vimeo.com/video/${v.vimeoId}?autoplay=1`}
function sourceUrl(v:ModuleVideo){return v.youtubeId?`https://www.youtube.com/watch?v=${v.youtubeId}`:`https://vimeo.com/${v.vimeoId}`}

// Click-to-load player: only the thumbnail image loads until the learner presses Play.
export function VideoPanel({videos}:{videos:ModuleVideo[]}){
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(false);
 if(!videos.length)return null;const v=videos[active];
 return <div className="vg-video">
  <div className="vg-video-frame">{playing
   ?<iframe src={embedUrl(v)} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy"/>
   :<button type="button" className="vg-video-cover" onClick={()=>setPlaying(true)} style={v.youtubeId?{backgroundImage:`url(https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg)`}:undefined} aria-label={'Play '+v.title}><span className="vg-play"><Play size={30}/></span><span className="vg-video-title">{v.title}<small>{v.creator}</small></span></button>}</div>
  <p className="vg-video-focus"><Target size={15}/> Watch for: {v.focus}</p>
  <div className="vg-video-list">{videos.map((x,i)=><button type="button" key={x.title} className={i===active?'active':''} onClick={()=>{setActive(i);setPlaying(false)}}><Play size={14}/><span>{x.title}<small>{x.creator} · {x.youtubeId?'YouTube':'Vimeo'}</small></span></button>)}</div>
  <a className="small vg-source" href={sourceUrl(v)} target="_blank" rel="noopener noreferrer">Open on {v.youtubeId?'YouTube':'Vimeo'} <ExternalLink size={12}/></a>
  <p className="small">These videos are made by other creators. They may change or be taken down.</p>
 </div>;
}

export function ModuleContext({moduleKey,onMake}:{moduleKey:string;onMake:()=>void}){
 const {s}=useLearning();
 const parsed=parseVideoKey(moduleKey);if(!parsed)return null;
 const m=parsed.module,p=s.programme;
 const pathway:Pathway=p?.primaryPathway||'Documentary';
 const lesson=moduleLesson(m,projectLabel(p)),image=moduleImages[m.id];
 const extras=(p?.interests||[]).slice(1).map((id:string)=>interestFor(id)?.label).filter(Boolean);
 return <div className="vg-context">
  <div className="vg-context-hero">
   {image&&<img src={`${image.base}-960.webp`} srcSet={imageSrcSet(image)} sizes="(max-width: 760px) 100vw, 640px" alt={image.alt} loading="lazy"/>}
   <div><Badge>{m.id} · {m.stageLabel}</Badge>{parsed.index<freeModuleCount&&<Badge tone="green"><Gift size={12}/> Free task</Badge>}<p className="vg-outcome">{m.outcome}</p><span className="small">About {m.hours} hours</span></div>
  </div>
  <section><h3>Where this fits in making a video</h3><StageDiagram current={m.stageLabel}/></section>
  {m.stage==='selected-pathway'&&<p className="notice">Your style: <strong>{pathway}</strong>. It comes from the first interest you picked.</p>}
  <section><h3>What you’ll learn</h3><ul className="vg-topics">{m.topics.map(t=><li key={t}>{t}</li>)}</ul></section>
  <section><h3>Watch</h3><VideoPanel videos={videosFor(m.id,pathway)}/></section>
  {extras.length>0&&<p className="small">You can also try this with your other interests: {extras.join(', ')}.</p>}
  <section className="vg-assignment-preview"><h3><ListChecks size={18}/> Your task</h3><p>{lesson.do}</p><p className="small"><strong>Good work looks like this:</strong> {m.evidence}</p><Button onClick={onMake}>Start the task</Button></section>
 </div>;
}
