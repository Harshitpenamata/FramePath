'use client';
import React,{useEffect,useState} from 'react';
import {ArrowRight,FileText,Film,Image as ImageIcon,Link2,Sparkles,Trash2,X} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,Go,Action,CheckField,Gate,PageHead,DateText} from '../ui';
import {moduleHref} from '../learning-rules';
import {levelNames,modulesFor,moduleKey,type Level} from './programme';
import {useVideoReviews,WorkFolders} from './work-folders';
import './studio.css';

// My Work: where a learner sees progress, every module's hand-ins with AI feedback, and builds a portfolio.
const pad=(n:number)=>String(n).padStart(2,'0');
function pieceKind(p:any){
 const files=p.uploads||[];
 if(files.some((f:any)=>String(f.type).startsWith('video/')))return {label:'Video submission',Icon:Film};
 if(files.length)return {label:files.length>1?files.length+' photos':'Photo',Icon:ImageIcon};
 if(p.url)return {label:'Video link',Icon:Link2};
 return {label:'Written answer',Icon:FileText};
}

function Thumb({p}:{p:any}){
 const f=(p.uploads||[])[0],{Icon}=pieceKind(p);
 if(f&&String(f.type).startsWith('image/'))return <img className="st-thumb" src={'/api/file/'+f.id} alt="" loading="lazy"/>;
 if(f&&String(f.type).startsWith('video/'))return <video className="st-thumb" src={'/api/file/'+f.id+'#t=0.5'} muted playsInline preload="metadata" aria-hidden="true"/>;
 return <span className="st-thumb st-thumb-icon"><Icon size={18}/></span>;
}

function StatusCard({level,reviews}:{level:Level;reviews:Record<string,any>|null}){
 const {s}=useLearning();
 const mods=modulesFor(level),keys=mods.map((_,i)=>moduleKey(level,i));
 const done=keys.filter(k=>s.progress?.[k]).length;
 const handed=keys.filter(k=>s.submissions.some((p:any)=>p.key===k&&p.handIn)).length;
 const scores=s.submissions.filter((p:any)=>p.handIn).map((p:any)=>reviews?.[p.id]?.review?.total).filter((n:any)=>typeof n==='number');
 const avg=scores.length?Math.round(scores.reduce((a:number,b:number)=>a+b,0)/scores.length):null;
 const hoursDone=mods.filter((_,i)=>s.progress?.[keys[i]]).reduce((n,m)=>n+m.hours,0),hoursAll=mods.reduce((n,m)=>n+m.hours,0);
 return <section className="st-card st-status">
  <div className="st-row"><h2>Current status</h2><span className="small">{levelNames[level]} level</span></div>
  <div className="st-stats">
   <div><span className="st-label">Modules</span><strong>{pad(done)}<small> / {pad(mods.length)}</small></strong><span className="small">finished</span></div>
   <div><span className="st-label">Tasks</span><strong>{pad(handed)}<small> / {pad(mods.length)}</small></strong><span className="small">handed in so far</span></div>
   <div><span className="st-label">Score</span><strong>{avg??'—'}<small>{avg!=null?' / 100':''}</small></strong><span className="st-bar" aria-hidden="true"><span style={{width:(avg??0)+'%'}}/></span><span className="small">average AI score</span></div>
   <div><span className="st-label">Hours</span><strong>{hoursDone}<small> / {hoursAll}</small></strong><span className="small">learning time done</span></div>
  </div>
 </section>;
}

function ModuleCard({level,index,reviews,ids,setIds,isNext}:{level:Level;index:number;reviews:Record<string,any>|null;ids:string[];setIds:(fn:(p:string[])=>string[])=>void;isNext:boolean}){
 const {s,mutate,busy}=useLearning();
 const m=modulesFor(level)[index],key=moduleKey(level,index);
 const pieces=s.submissions.filter((p:any)=>p.key===key&&p.handIn);
 const latest=pieces[0],review=latest&&reviews?.[latest.id]?.review;
 async function removePiece(id:string){if(!window.confirm('Remove this piece from My Work? This can’t be undone.'))return;if(await mutate('submission_remove',{id}))setIds(prev=>prev.filter(x=>x!==id))}
 async function removeFile(id:string,uploadId:string){if(window.confirm('Remove this file from the piece?'))await mutate('submission_file_remove',{id,uploadId})}
 function toggle(id:string,on:boolean){if(on&&ids.length>=9){toast.error('Pick up to nine pieces to share.');return}setIds(prev=>on?[...prev,id]:prev.filter(v=>v!==id))}
 const head=<div className="st-module-head"><div><span className="st-label">Module {pad(index+1)}</span><h3>{m.title}</h3></div><a className="st-icon-link" href={moduleHref(key)} aria-label={'Open module '+(index+1)}><ArrowRight size={16}/></a></div>;
 if(!pieces.length)return <article className={'st-card st-module '+(isNext?'next':'later')}>
  {head}
  <div className="st-placeholder" aria-hidden="true">{pad(index+1)}</div>
  {isNext?<><strong>Room for your next hand-in</strong><p className="small">Your task and feedback will appear here as you work through this module.</p><Go href={moduleHref(key)} outline>Go to module</Go></>
   :<><strong>{m.taskName}</strong><p className="small">{m.outcome}</p><span className="st-chip">Coming up next</span></>}
 </article>;
 return <article className="st-card st-module done">
  {head}
  <div className="st-ai">
   <div className="st-row"><span><Sparkles size={15}/> AI feedback / score</span>{review?.total!=null&&<strong>{Math.round(review.total)}<small>/100</small></strong>}</div>
   <p className="small">{review?review.summary:'No AI review for this piece yet.'}</p>
   <a className="text-link" href={moduleHref(key)+'?tab=feedback'}>{review?'See detailed review':'Get it in Feedback'} →</a>
  </div>
  <div className="st-block"><span className="st-label">Hand-ins</span>
   <ul className="st-handins">{pieces.map((p:any)=>{const k=pieceKind(p);return <li key={p.id}>
    <Thumb p={p}/>
    <div className="st-handin-text"><strong>{k.label}</strong><span className="small">Hand-in {p.attempt} · <DateText value={p.createdAt}/></span>
     {(p.uploads||[]).length>0&&<span className="st-files">{p.uploads.map((f:any)=><span key={f.id}><a className="text-link" href={'/api/file/'+f.id} target="_blank" rel="noreferrer">{f.name}</a><button type="button" aria-label={'Remove '+f.name} disabled={busy} onClick={()=>removeFile(p.id,f.id)}><X size={12}/></button></span>)}</span>}
     {p.url&&<a className="text-link small" href={p.url} target="_blank" rel="noreferrer">Watch video link</a>}
    </div>
    <div className="st-handin-actions">
     <CheckField checked={ids.includes(p.id)} onChange={(on:boolean)=>toggle(p.id,on)}>Portfolio</CheckField>
     <Button variant="ghost" size="sm" disabled={busy} aria-label="Remove from My Work" onClick={()=>removePiece(p.id)}><Trash2 size={14}/></Button>
    </div>
   </li>})}</ul>
  </div>
  {(latest.notes||latest.answer)&&<div className="st-block"><span className="st-label">Your note</span><p className="st-note prewrap">{latest.answer||latest.notes}</p>{latest.answer&&latest.notes&&<p className="st-note small prewrap">{latest.notes}</p>}</div>}
 </article>;
}

function PortfolioPanel({ids}:{ids:string[]}){
 const {s,mutate}=useLearning();
 const [title,setTitle]=useState(s.portfolio.title||'My videography journey'),[bio,setBio]=useState(s.portfolio.bio||'');
 useEffect(()=>{setTitle(s.portfolio.title||'My videography journey');setBio(s.portfolio.bio||'')},[s.portfolio.title,s.portfolio.bio]);
 const dirty=title!==(s.portfolio.title||'')||bio!==(s.portfolio.bio||'')||ids.join()!==(s.portfolio.ids||[]).join();
 const sharing=s.portfolio.token?(s.portfolio.visibility==='public'?'Public':'Unlisted'):'Private';
 return <section className="st-card st-portfolio">
  <div className="st-row"><div><span className="st-kicker">Make it yours</span><h2>Build your portfolio.</h2></div><p className="small">Give your work a name, tell your story, and pick what you want to share.</p></div>
  <div className="st-portfolio-grid">
   <label>Portfolio title<input maxLength={100} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label>A little about your learning<textarea rows={4} maxLength={1500} value={bio} onChange={e=>setBio(e.target.value)} placeholder="What have you learned so far?"/></label>
  </div>
  <div className="st-row st-portfolio-actions">
   <span className="st-chip">{ids.length} piece{ids.length===1?'':'s'} selected</span>
   <Action outline disabled={!title.trim()} onClick={()=>mutate('portfolio_save',{title,bio,ids})}>Save portfolio</Action>
  </div>
  <div className="st-row st-portfolio-actions">
   <span className="small">Sharing: <strong>{sharing}</strong>{dirty?' · save your changes first':''}</span>
   <Go href="/my-portfolio">Open your portfolio page →</Go>
  </div>
  <p className="small">This is practice work. AI reviews are not official qualifications.</p>
 </section>;
}

export function MyWorkStudio(){
 const {s}=useLearning();
 const reviews=useVideoReviews();
 const [ids,setIds]=useState<string[]>(s.portfolio.ids||[]);
 useEffect(()=>{setIds(s.portfolio.ids||[])},[(s.portfolio.ids||[]).join()]);
 const level:Level=s.programme?.level||'beginner';
 const mods=modulesFor(level),nextIndex=mods.findIndex((_,i)=>!s.submissions.some((p:any)=>p.key===moduleKey(level,i)&&p.handIn));
 const other=s.submissions.filter((p:any)=>!String(p.key).startsWith('video-'+level));
 // Opening from a module ("See it in My Work") scrolls to that module's card.
 useEffect(()=>{const from=new URLSearchParams(window.location.search).get('from');if(from)document.getElementById('mod-'+from)?.scrollIntoView({block:'start'})},[]);
 return <div className="st-page">
  <PageHead eyebrow="YOUR LEARNING SPACE" title="Everything you’ve handed in.">A clear view of your progress, your feedback, and the work you’re ready to share.</PageHead>
  <Gate>
   <StatusCard level={level} reviews={reviews}/>
   <section className="st-modules"><div className="st-row"><div><span className="st-kicker">Manage / details</span><h2>Your modules</h2></div><span className="small">Every hand-in, all in one place.</span></div>
    <div className="st-module-grid">{mods.map((_,i)=><div id={'mod-'+moduleKey(level,i)} key={i}><ModuleCard level={level} index={i} reviews={reviews} ids={ids} setIds={setIds} isNext={i===nextIndex}/></div>)}</div>
   </section>
   {other.length>0&&<section className="st-other"><h2>Other work</h2><p className="small">Hand-ins from other levels and earlier practice.</p><WorkFolders ids={ids} setIds={setIds} keys={[...new Set<string>(other.map((p:any)=>p.key))]}/></section>}
   <PortfolioPanel ids={ids}/>
  </Gate>
 </div>;
}
