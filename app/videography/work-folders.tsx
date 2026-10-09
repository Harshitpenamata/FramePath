'use client';
import React from 'react';
import {Folder,Trash2,X} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {useLearning,Panel,CheckField,SubmissionCard,DateText,labelForKey} from '../ui';
import {parseVideoKey} from './programme';

// Orders folders by level and module (B01 … A14), then any older lesson work.
function folderOrder(key:string){const v=parseVideoKey(key);return v?['beginner','intermediate','advanced'].indexOf(v.level)*100+v.index:1000}
const folderName=(key:string)=>{const v=parseVideoKey(key);return v?v.module.id+' · '+v.module.title:labelForKey(key)};

// My Work: everything handed in, one folder per module. Learners can remove a piece or a single file.
export function WorkFolders({ids,setIds}:{ids:string[];setIds:(fn:(prev:string[])=>string[])=>void}){
 const {s,mutate,busy}=useLearning();
 const keys=[...new Set<string>(s.submissions.map((x:any)=>x.key))].sort((a,b)=>folderOrder(a)-folderOrder(b));
 async function removePiece(id:string){if(!window.confirm('Remove this piece from My Work? This can’t be undone.'))return;if(await mutate('submission_remove',{id}))setIds(prev=>prev.filter(x=>x!==id))}
 async function removeFile(id:string,uploadId:string){if(window.confirm('Remove this file from the piece?'))await mutate('submission_file_remove',{id,uploadId})}
 return <div className="vg-folders">{keys.map(key=>{const pieces=s.submissions.filter((x:any)=>x.key===key);return <Panel key={key}><details className="vg-folder" open>
  <summary><Folder size={20}/>{folderName(key)}<span className="small">({pieces.length})</span></summary>
  <div className="stack">{pieces.map((p:any)=><div key={p.id} className="vg-piece">
   <CheckField checked={ids.includes(p.id)} onChange={(checked:boolean)=>{if(checked&&ids.length>=9){toast.error('Pick up to nine pieces to share.');return}setIds(prev=>checked?[...prev,p.id]:prev.filter(v=>v!==p.id))}}>Show this piece in my public portfolio</CheckField>
   {p.handIn?<>
    <p className="small">Hand-in {p.attempt} · <DateText value={p.createdAt}/>{p.selfScore!=null&&<> · your rating {p.selfScore}/100</>}</p>
    {p.answer&&<p className="prewrap">{p.answer}</p>}
    {p.notes&&<p className="prewrap small">{p.notes}</p>}
    {(p.uploads?.length>0||p.url)&&<ul>{p.uploads?.map((f:any)=><li key={f.id}><a className="text-link" href={'/api/file/'+f.id} target="_blank" rel="noreferrer">{f.name}</a><Button variant="ghost" size="sm" disabled={busy} aria-label={'Remove '+f.name} onClick={()=>removeFile(p.id,f.id)}><X size={14}/></Button></li>)}{p.url&&<li><a className="text-link" href={p.url} target="_blank" rel="noreferrer">Watch video link</a></li>}</ul>}
   </>:<SubmissionCard sub={p}/>}
   <div><Button variant="outline" size="sm" disabled={busy} onClick={()=>removePiece(p.id)}><Trash2 size={14}/>Remove from My Work</Button></div>
  </div>)}</div>
 </details></Panel>})}</div>;
}
