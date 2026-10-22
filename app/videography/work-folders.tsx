'use client';
import React,{useEffect,useState} from 'react';
import {ArrowLeft,Folder,Sparkles,Trash2,X} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,CheckField,SubmissionCard,DateText,labelForKey,confirmAction} from '../ui';
import {parseVideoKey,modulesFor,moduleKey,levelNames,type Level} from './programme';
import {moduleHref} from '../learning-rules';
import {Showcase,itemsFromSubmissions} from './showcase';

// Orders folders by level and module (B01 … A14), then any older lesson work.
function folderOrder(key:string){const v=parseVideoKey(key);return v?['beginner','intermediate','advanced'].indexOf(v.level)*100+v.index:1000}
const folderName=(key:string)=>{const v=parseVideoKey(key);return v?v.module.id+' · '+v.module.title:labelForKey(key)};

// The latest AI review of every Videography hand-in, keyed by submission id (null while loading).
export function useVideoReviews(){
 const [reviews,setReviews]=useState<Record<string,any>|null>(null);
 useEffect(()=>{fetch('/api/review?all=video').then(r=>r.ok?r.json():{reviews:{}}).then((d:any)=>setReviews(d.reviews||{})).catch(()=>setReviews({}))},[]);
 return reviews;
}
// The module a learner came from ("See it in My Work"), if any.
function useFromKey(){const [from,setFrom]=useState('');useEffect(()=>{const k=new URLSearchParams(window.location.search).get('from')||'';if(parseVideoKey(k))setFrom(k)},[]);return from}

function PieceReview({review,open}:{review:any;open:boolean}){
 const r=review.review;
 return <details className="vg-piece-review" open={open}><summary><Sparkles size={15}/> AI feedback{r.total!=null&&<strong>{Math.round(r.total)}/100</strong>}</summary>
  <p>{r.summary}</p>
  <ul>{r.criteria.map((c:any)=><li key={c.label}><strong>{c.label}: {c.rating??'–'}/4.</strong> {c.feedback}</li>)}</ul>
  <p><strong>What worked:</strong> {r.strength}</p><p><strong>What to improve:</strong> {r.improvement}</p><p><strong>Try next:</strong> {r.nextStep}</p>
 </details>;
}

// Top of My Work: a way back to the module, or an overview of the learner's training.
export function WorkHeader(){
 const {s}=useLearning();
 const from=useFromKey(),reviews=useVideoReviews();
 if(from){const v=parseVideoKey(from)!;return <a className="vg-back" href={moduleHref(from)+'?tab=feedback'}><ArrowLeft size={16}/>Back to {v.module.id} · {v.module.title}</a>}
 const p=s.programme;if(!p)return null;
 const level:Level=p.level,mods=modulesFor(level);
 const done=mods.filter((_,i)=>s.progress?.[moduleKey(level,i)]).length;
 const pieces=s.submissions.filter((x:any)=>x.handIn);
 const scores=pieces.map((x:any)=>reviews?.[x.id]?.review?.total).filter((n:any)=>typeof n==='number');
 const avg=scores.length?Math.round(scores.reduce((a:number,b:number)=>a+b,0)/scores.length):null;
 const hoursDone=mods.filter((_,i)=>s.progress?.[moduleKey(level,i)]).reduce((n,m)=>n+m.hours,0),hoursAll=mods.reduce((n,m)=>n+m.hours,0);
 const nextIndex=mods.findIndex((_,i)=>!s.progress?.[moduleKey(level,i)]);
 return <Panel className="vg-work-overview"><div className="row between"><h2>Your training · {levelNames[level]}</h2>{nextIndex>=0&&<a className="text-link" href={moduleHref(moduleKey(level,nextIndex))}>Next: {mods[nextIndex].id} {mods[nextIndex].title}</a>}</div>
  <div className="vg-stats">
   <div><strong>{done}/{mods.length}</strong><span>modules done</span></div>
   <div><strong>{pieces.length}</strong><span>pieces handed in</span></div>
   <div><strong>{avg??'–'}</strong><span>average AI score</span></div>
   <div><strong>{hoursDone}/{hoursAll} h</strong><span>course hours done</span></div>
  </div>
  <div className="vg-progress" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={mods.length} aria-label="Modules done"><span style={{width:done/mods.length*100+'%'}}/></div>
 </Panel>;
}

// My Work: everything handed in, one folder per module. Learners can remove a piece or a single file.
export function WorkFolders({ids,setIds,keys:only}:{ids:string[];setIds:(fn:(prev:string[])=>string[])=>void;keys?:string[]}){
 const {s,mutate,busy}=useLearning();
 const reviews=useVideoReviews(),from=useFromKey();
 const keys=[...new Set<string>(s.submissions.map((x:any)=>x.key))].filter(k=>!only||only.includes(k)).sort((a,b)=>folderOrder(a)-folderOrder(b));
 useEffect(()=>{if(from)document.getElementById('folder-'+from)?.scrollIntoView({block:'start'})},[from]);
 async function removePiece(id:string){if(!await confirmAction('This piece and its files leave My Work and your portfolio. This can’t be undone.','Remove this piece'))return;if(await mutate('submission_remove',{id}))setIds(prev=>prev.filter(x=>x!==id))}
 async function removeFile(id:string,uploadId:string){if(await confirmAction('The file is removed from this piece.','Remove this file'))await mutate('submission_file_remove',{id,uploadId})}
 return <div className="vg-folders">{keys.map(key=>{const pieces=s.submissions.filter((x:any)=>x.key===key);return <Panel key={key}><details className="vg-folder" id={'folder-'+key} open={!from||from===key}>
  <summary><Folder size={20}/>{folderName(key)}<span className="small">({pieces.length})</span></summary>
  <div className="stack">{pieces.map((p:any)=><div key={p.id} className="vg-piece">
   <CheckField checked={ids.includes(p.id)} onChange={(checked:boolean)=>{if(checked&&ids.length>=9){toast.error('Pick up to nine pieces to share.');return}setIds(prev=>checked?[...prev,p.id]:prev.filter(v=>v!==p.id))}}>Show this piece in my public portfolio</CheckField>
   {p.handIn?<>
    <p className="small">Hand-in {p.attempt} · <DateText value={p.createdAt}/>{p.selfScore!=null&&<> · your rating {p.selfScore}/100</>}</p>
    {p.answer&&<p className="prewrap">{p.answer}</p>}
    {p.notes&&<p className="prewrap small">{p.notes}</p>}
    {(p.uploads?.length>0||p.url)&&<ul>{p.uploads?.map((f:any)=><li key={f.id}><a className="text-link" href={'/api/file/'+f.id} target="_blank" rel="noreferrer">{f.name}</a><Button variant="ghost" size="sm" disabled={busy} aria-label={'Remove '+f.name} onClick={()=>removeFile(p.id,f.id)}><X size={14}/></Button></li>)}{p.url&&<li><a className="text-link" href={p.url} target="_blank" rel="noreferrer">Watch video link</a></li>}</ul>}
    {reviews?.[p.id]?<PieceReview review={reviews[p.id]} open={from===key&&p===pieces[0]}/>:reviews&&<p className="small">No AI feedback yet. <a className="text-link" href={moduleHref(key)+'?tab=feedback'}>Get it in Reflect</a></p>}
   </>:<SubmissionCard sub={p}/>}
   <div><Button variant="outline" size="sm" className="sg-danger" disabled={busy} onClick={()=>removePiece(p.id)}><Trash2 size={14}/>Remove from My Work</Button></div>
  </div>)}</div>
 </details></Panel>})}</div>;
}

// My Work: the showcase first, then a tab to manage, remove and share pieces.
export function WorkTabs({manage}:{manage:React.ReactNode}){
 const {s}=useLearning(),reviews=useVideoReviews();
 const [tab,setTab]=useState<'showcase'|'manage'>('showcase');
 useEffect(()=>{if(new URLSearchParams(window.location.search).get('from'))setTab('manage')},[]);
 const items=itemsFromSubmissions(s.submissions,reviews);
 return <div className="vg-work-tabs">
  <div className="vg-chips" role="tablist" aria-label="My Work view">{([['showcase','Showcase'],['manage','Manage & share']] as const).map(([id,label])=><button type="button" role="tab" key={id} aria-selected={tab===id} className={tab===id?'selected':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
  {tab==='showcase'?<Showcase items={items} empty={<Panel className="empty"><h2>Nothing to show yet.</h2><p>Hand in a task. Your photos and videos will appear here.</p></Panel>}/>:manage}
 </div>;
}
