'use client';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,FileText,Film,Images,Play,Sparkles,X} from 'lucide-react';
import {Badge} from '../ui';
import {parseVideoKey,levelNames,type Level} from './programme';

// A gallery of handed-in work, like a Behance or ArtStation profile: a grid of covers, and a full-screen
// viewer where photos show large, videos play and video links play in place.
export type ShowFile={src:string;type:string};
export type ShowItem={id:string;key:string;moduleId:string;title:string;level:Level|null;createdAt?:string|number;notes:string;answer:string;url:string;files:ShowFile[];score?:number|null;summary?:string;token?:string;owner?:string};

const isImage=(f:ShowFile)=>f.type.startsWith('image/');
const isVideo=(f:ShowFile)=>f.type.startsWith('video/');
const youtubeId=(u:string)=>u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1];
const vimeoId=(u:string)=>u.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
const dateText=(v?:string|number)=>{if(!v)return '';const d=new Date(v);return isNaN(+d)?'':d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})};

function describe(key:string){const v=parseVideoKey(key);return v?{moduleId:v.module.id,title:v.module.taskName||v.module.title,level:v.level}:{moduleId:'',title:'Practice piece',level:null}}
// From the learner's own state (My Work). reviews: latest AI review per submission id.
export function itemsFromSubmissions(subs:any[],reviews:Record<string,any>|null):ShowItem[]{
 return subs.filter(p=>p.handIn).map(p=>({id:p.id,key:p.key,...describe(p.key),createdAt:p.createdAt,notes:p.notes||'',answer:p.answer||'',url:p.url||'',
  files:(p.uploads||[]).map((f:any)=>({src:'/api/file/'+f.id,type:f.type||''})),score:reviews?.[p.id]?.review?.total??null,summary:reviews?.[p.id]?.review?.summary}));
}
// From a shared portfolio. Older shared portfolios have no file types; those are tried as images first.
export function itemsFromPublic(items:any[],token:string):ShowItem[]{
 return items.map((p,i)=>{const files:ShowFile[]=(p.uploads?.length?p.uploads:(p.uploadIds||[]).map((id:string)=>({id,type:''}))).map((f:any)=>({src:'/api/file/'+f.id+'?portfolio='+encodeURIComponent(token),type:f.type||''}));
  return {id:p.id||String(i),key:p.key,...describe(p.key),createdAt:p.createdAt,notes:p.notes||'',answer:p.answer||'',url:p.url||'',files,token}});
}

function Cover({item}:{item:ShowItem}){
 const [broken,setBroken]=useState(false);
 const img=item.files.find(isImage)||item.files.find(f=>!f.type),vid=item.files.find(isVideo),yt=youtubeId(item.url);
 if(img&&!broken)return <img src={img.src} alt="" loading="lazy" onError={()=>setBroken(true)}/>;
 if(vid||(img&&broken))return <video src={(vid||img)!.src+'#t=0.5'} muted playsInline preload="metadata" aria-hidden="true"/>;
 if(yt)return <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy"/>;
 return <div className="vg-show-text"><FileText size={22}/><p>{(item.answer||item.notes).slice(0,180)}</p></div>;
}

function Media({file,title}:{file:ShowFile;title:string}){
 const [asVideo,setAsVideo]=useState(isVideo(file));
 const [failed,setFailed]=useState(false);
 useEffect(()=>{setAsVideo(isVideo(file));setFailed(false)},[file.src]);
 if(failed)return <div className="vg-show-fallback"><Film size={28}/><p>This video can’t play in your browser.</p><a className="text-link" href={file.src} target="_blank" rel="noreferrer">Download it to watch</a></div>;
 if(asVideo)return <video key={file.src} src={file.src} controls playsInline preload="metadata" onError={()=>setFailed(true)} aria-label={title}/>;
 return <img src={file.src} alt={title} onError={()=>file.type?setFailed(true):setAsVideo(true)}/>;
}

function Viewer({items,index,setIndex,onClose,social}:{items:ShowItem[];index:number;setIndex:(i:number)=>void;onClose:()=>void;social?:(item:ShowItem)=>React.ReactNode}){
 const item=items[index],[file,setFile]=useState(0),closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setFile(0)},[index]);
 useEffect(()=>{
  const before=document.activeElement as HTMLElement|null;closeRef.current?.focus();document.body.style.overflow='hidden';
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight'&&index<items.length-1)setIndex(index+1);if(e.key==='ArrowLeft'&&index>0)setIndex(index-1)};
  window.addEventListener('keydown',key);
  return ()=>{window.removeEventListener('keydown',key);document.body.style.overflow='';before?.focus?.()};
 },[index,items.length]);
 const yt=youtubeId(item.url),vm=vimeoId(item.url);
 const stage=item.files.length?<Media file={item.files[file]} title={item.title}/>
  :yt?<iframe src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`} title={item.title} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>
  :vm?<iframe src={`https://player.vimeo.com/video/${vm}`} title={item.title} allow="fullscreen; picture-in-picture" allowFullScreen/>
  :<div className="vg-show-text large"><FileText size={28}/><p className="prewrap">{item.answer||item.notes}</p></div>;
 return <div className="vg-show-viewer" role="dialog" aria-modal="true" aria-label={item.title} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
  <button ref={closeRef} type="button" className="vg-show-close" onClick={onClose} aria-label="Close"><X size={22}/></button>
  {index>0&&<button type="button" className="vg-show-nav prev" onClick={()=>setIndex(index-1)} aria-label="Previous piece"><ArrowLeft size={22}/></button>}
  {index<items.length-1&&<button type="button" className="vg-show-nav next" onClick={()=>setIndex(index+1)} aria-label="Next piece"><ArrowRight size={22}/></button>}
  <div className="vg-show-body">
   <div className="vg-show-stage">{stage}</div>
   {item.files.length>1&&<div className="vg-show-thumbs">{item.files.map((f,i)=><button type="button" key={f.src} className={i===file?'active':''} onClick={()=>setFile(i)} aria-label={'File '+(i+1)}>{isVideo(f)?<Play size={16}/>:<img src={f.src} alt=""/>}</button>)}</div>}
   <aside className="vg-show-info">
    {item.owner&&<span className="small">by {item.owner}</span>}
    <span className="eyebrow">{[item.moduleId,item.level&&levelNames[item.level]].filter(Boolean).join(' · ')}</span>
    <h2>{item.title}</h2>
    {item.createdAt&&<p className="small">{dateText(item.createdAt)}</p>}
    {item.files.length>0&&(yt||vm||item.url)&&<a className="text-link" href={item.url} target="_blank" rel="noreferrer">Watch the video link</a>}
    {item.answer&&item.files.length>0&&<p className="prewrap">{item.answer}</p>}
    {item.notes&&<p className="prewrap small">{item.notes}</p>}
    {item.score!=null&&<div className="vg-show-ai"><Sparkles size={16}/><strong>{Math.round(item.score)}/100</strong><span>{item.summary}</span></div>}
    {social?.(item)}
   </aside>
  </div>
 </div>;
}

// social: likes and comments shown beside an open piece; tileExtra: a line under each tile (e.g. its like count).
export function Showcase({items,empty,social,tileExtra}:{items:ShowItem[];empty?:React.ReactNode;social?:(item:ShowItem)=>React.ReactNode;tileExtra?:(item:ShowItem)=>React.ReactNode}){
 const [level,setLevel]=useState<Level|'all'>('all'),[open,setOpen]=useState<number|null>(null);
 const levelsHere=useMemo(()=>(['beginner','intermediate','advanced'] as Level[]).filter(l=>items.some(i=>i.level===l)),[items]);
 const shown=useMemo(()=>[...items].filter(i=>level==='all'||i.level===level).sort((a,b)=>+new Date(b.createdAt||0)-+new Date(a.createdAt||0)),[items,level]);
 if(!items.length)return <>{empty}</>;
 return <section className="vg-showcase">
  {levelsHere.length>1&&<div className="vg-chips" role="group" aria-label="Filter by level">{(['all',...levelsHere] as const).map(l=><button type="button" key={l} aria-pressed={level===l} className={level===l?'selected':''} onClick={()=>setLevel(l)}>{l==='all'?'All work':levelNames[l]}</button>)}</div>}
  <div className="vg-show-grid">{shown.map((item,i)=><button type="button" key={item.id} className="vg-show-tile" onClick={()=>setOpen(i)} aria-label={'Open '+item.title}>
   <span className="vg-show-cover"><Cover item={item}/>{item.files.length>1&&<span className="vg-show-count"><Images size={14}/>{item.files.length}</span>}{item.files.some(isVideo)&&<span className="vg-show-play"><Play size={20}/></span>}</span>
   <span className="vg-show-meta"><strong>{item.title}</strong><span>{item.owner?item.owner+' · ':''}{item.moduleId}{item.createdAt?' · '+dateText(item.createdAt):''}</span>{item.score!=null&&<Badge tone="green">{Math.round(item.score)}/100</Badge>}{tileExtra?.(item)}</span>
  </button>)}</div>
  {open!==null&&shown[open]&&<Viewer items={shown} index={open} setIndex={setOpen} onClose={()=>setOpen(null)} social={social}/>}
 </section>;
}
