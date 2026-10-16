'use client';
import React,{useEffect,useState} from 'react';
import {Panel,PageHead,Badge} from './ui';
import {Button} from '@/components/ui/button';
import './videography/studio.css';

// /admin: AI spend and queue, and lesson videos that need replacing. The server only answers admins (ADMIN_EMAILS).
export function AdminHealth(){
 const [d,setD]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/admin/health').then(async r=>{const j:any=await r.json();if(!r.ok)throw Error(j.error);setD(j)}).catch(e=>setError(e.message))},[]);
 if(error)return <Panel><h1>Not found</h1></Panel>;
 if(!d)return <Panel><p role="status">Loading…</p></Panel>;
 const pct=Math.round(d.ai.spent/d.ai.budget*100),when=(t:number)=>t?new Date(t).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'never';
 const list=(rows:any[])=>rows.length?<ul className="admin-list">{rows.map(v=><li key={v.id}><strong>{v.title||v.id}</strong> · {v.creator}<br/><span className="small">{v.detail} · lessons {v.lessons.join(', ')} · checked {when(v.checkedAt)}</span></li>)}</ul>:<p className="small">None.</p>;
 return <>
  <PageHead eyebrow="ADMIN" title="Health"/>
  <Panel className={d.job.stale?'admin-alert':''}><h2>Hourly job</h2>
   {d.job.stale?<p><strong>{d.job.lastRun?'The hourly job hasn’t run since '+when(d.job.lastRun.at)+'.':'The hourly job has never run.'}</strong> Lesson videos aren’t being checked, and reviews and comments waiting in the queue won’t run until it does. If it has never run, the schedule isn’t registered: open Workers &amp; Pages in the Cloudflare dashboard once, then redeploy.</p>
    :<p><Badge tone="green">Running</Badge> Last run {when(d.job.lastRun.at)}: {d.job.lastRun.videos.checked} videos checked, {d.job.lastRun.reviews} queued reviews run, {d.job.lastRun.comments} comments checked{d.job.lastRun.aiPaused?' (AI was paused)':''}.</p>}
  </Panel>
  <FlaggedReviews/>
  <ReportedComments/>
  <FindLearner/>
  <Panel><h2>AI</h2>
   <p>{d.ai.ok?<Badge tone="green">Running</Badge>:<Badge>{d.ai.reason==='credits'?'Paused: provider has no credit':'Paused: daily cap reached'}</Badge>} Today ${d.ai.spent.toFixed(2)} of ${d.ai.budget} cap ({pct}%){pct>=80&&' · close to the cap'}</p>
   <p>{d.queuedReviews} reviews and {d.pendingComments} comments waiting in the queue.</p>
   <table className="admin-table"><thead><tr><th>Day</th><th>Provider</th><th>Calls</th><th>US$</th></tr></thead><tbody>{d.spend.map((r:any)=><tr key={r.day+r.provider}><td>{r.day}</td><td>{r.provider}</td><td>{r.calls}</td><td>{r.usd}</td></tr>)}</tbody></table>
  </Panel>
  <Storage/>
  <Look/>
  <Panel><h2>Lesson videos</h2><p className="small">{d.videos.checked} of {d.videos.total} checked · last check {when(d.videos.lastCheck)}</p>
   <h3>Dead: hidden from lessons, replace these ({d.videos.dead.length})</h3>{list(d.videos.dead)}
   <h3>Failed one check, being watched ({d.videos.failingOnce.length})</h3>{list(d.videos.failingOnce)}
   <h3>Open in a new tab, not inside FramePath ({d.videos.noframe.length})</h3>{list(d.videos.noframe)}
  </Panel>
 </>;
}

// Reviews learners flagged as wrong: read the review next to the work, then let it stand or give it back.
function FlaggedReviews(){
 const [flags,setFlags]=useState<any[]|null>(null),[notes,setNotes]=useState<Record<string,string>>({}),[busy,setBusy]=useState('');
 const load=()=>fetch('/api/admin/flags').then(r=>r.json()).then((d:any)=>setFlags(d.flags||[])).catch(()=>setFlags([]));
 useEffect(()=>{load()},[]);
 async function decide(id:string,decision:string){setBusy(id);try{await fetch('/api/admin/flags',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,decision,note:notes[id]||''})});await load()}finally{setBusy('')}}
 if(!flags)return null;
 const open=flags.filter(f=>f.status==='open'),done=flags.filter(f=>f.status!=='open');
 return <Panel className={open.length?'admin-alert':''}><h2>Flagged reviews ({open.length} open)</h2>
  {!open.length&&<p className="small">No reviews waiting to be checked.</p>}
  {open.map(f=><article key={f.id} className="admin-flag">
   <p><strong>{f.email}</strong> · {f.lessonKey} · {new Date(f.createdAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p>
   <p><Badge>{f.reason}</Badge> {f.details}</p>
   <details open><summary>The AI review{f.review?.total!=null?' · '+Math.round(f.review.total)+'/100':''}</summary>
    <p>{f.review?.summary}</p>
    <ul>{(f.review?.criteria||[]).map((c:any,i:number)=><li key={i}><strong>{c.label}:</strong> {c.rating??'not rated'}/4 · {c.feedback}</li>)}</ul>
    <p className="small">What it couldn’t check: {f.review?.evidenceLimit}</p>
    {f.watched.length>0&&<p className="small">Video watched: {f.watched.map((w:any)=>w.video+(w.ok?' ('+w.duration+')':' (could not be watched)')).join('; ')}</p>}
   </details>
   <details open><summary>The learner’s work</summary>
    {f.work?<>{f.work.answer&&<p className="prewrap"><strong>Answer:</strong> {f.work.answer}</p>}{f.work.notes&&<p className="prewrap"><strong>Notes:</strong> {f.work.notes}</p>}
     {f.work.url&&<p><a className="text-link" href={f.work.url} target="_blank" rel="noreferrer">{f.work.url}</a></p>}
     {f.work.files.map((x:any)=><p key={x.id}><a className="text-link" href={'/api/file/'+x.id} target="_blank" rel="noreferrer">{x.name}</a> <span className="small">({x.type})</span></p>)}</>
     :<p className="small">The hand-in was removed.</p>}
   </details>
   <textarea rows={2} maxLength={600} placeholder="Note to the learner (optional)" value={notes[f.id]||''} onChange={e=>setNotes({...notes,[f.id]:e.target.value})}/>
   <div className="button-row"><Button size="sm" variant="outline" disabled={busy===f.id} onClick={()=>decide(f.id,'fine')}>Review stands</Button><Button size="sm" disabled={busy===f.id} onClick={()=>decide(f.id,'refunded')}>Give review back</Button></div>
  </article>)}
  {done.length>0&&<details><summary>Resolved ({done.length})</summary><ul className="admin-list">{done.map(f=><li key={f.id}>{f.email} · {f.lessonKey} · {f.reason} · <strong>{f.status==='refunded'?'given back':'stands'}</strong>{f.note?' · '+f.note:''}</li>)}</ul></details>}
 </Panel>;
}

const mb=(b:number)=>b>=1073741824?(b/1073741824).toFixed(2)+' GB':(b/1048576).toFixed(1)+' MB';
const at=(t:any)=>t?new Date(t).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'';
const get=(q:string)=>fetch('/api/admin/console?'+q).then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error);return d});

// Comments people reported: hidden until an admin restores or removes them.
function ReportedComments(){
 const [rows,setRows]=useState<any[]|null>(null),[busy,setBusy]=useState('');
 const load=()=>get('section=comments').then(d=>setRows(d.comments)).catch(()=>setRows([]));
 useEffect(()=>{load()},[]);
 async function act(id:string,action:string){setBusy(id);try{await fetch('/api/admin/console',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action})});await load()}finally{setBusy('')}}
 if(!rows)return null;
 return <Panel className={rows.length?'admin-alert':''}><h2>Reported comments ({rows.length})</h2>
  {!rows.length&&<p className="small">No reported comments.</p>}
  {rows.map(c=><article key={c.id} className="admin-flag">
   <p className="prewrap">“{c.body}”</p>
   <p className="small">By {c.author} ({c.author_email||'unknown'}) on <a className="text-link" href={'/p/'+c.token} target="_blank" rel="noreferrer">{c.owner_email||'a portfolio'}</a> · {at(c.created_at)} · {c.reports} report{c.reports>1?'s':''}: {c.reasons}</p>
   <div className="button-row"><Button size="sm" variant="outline" disabled={busy===c.id} onClick={()=>act(c.id,'restore')}>Restore</Button><Button size="sm" disabled={busy===c.id} onClick={()=>act(c.id,'remove')}>Remove</Button></div>
  </article>)}
 </Panel>;
}

// Find a learner by email: their plans, hand-ins, reviews, storage and portfolio.
function FindLearner(){
 const [q,setQ]=useState(''),[users,setUsers]=useState<any[]|null>(null),[error,setError]=useState('');
 async function find(e:React.FormEvent){e.preventDefault();setError('');try{setUsers((await get('section=users&email='+encodeURIComponent(q))).users)}catch(e:any){setError(e.message)}}
 return <Panel><h2>Find a learner</h2>
  <form className="admin-search" onSubmit={find}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Email, or part of it" aria-label="Email"/><Button size="sm" type="submit">Find</Button></form>
  {error&&<p className="field-error">{error}</p>}
  {users&&!users.length&&<p className="small">No learner with that email has signed in since emails started being saved.</p>}
  {users?.map(u=><article key={u.userId} className="admin-flag">
   <p><strong>{u.email}</strong>{u.name&&' · '+u.name} · last active {at(u.lastActive)}{u.paid.selfPaced&&' · Self-paced'}{u.paid.mentor&&' · Mentor'}</p>
   <p className="small">Plans: {u.plans.length?u.plans.map((p:any)=>p.title+' ('+p.level+(p.open?', open':'')+')').join('; '):'none'}</p>
   <p className="small">{u.handIns.length} hand-ins · {u.reviews} AI reviews · {u.comments} comments · {u.files} files, {mb(u.bytes)}{u.portfolio&&<> · portfolio <a className="text-link" href={'/p/'+u.portfolio.token} target="_blank" rel="noreferrer">{u.portfolio.visibility}</a></>}</p>
   {u.handIns.length>0&&<details><summary>Hand-ins</summary><ul className="admin-list">{u.handIns.map((h:any)=><li key={h.id}>{h.key} · {at(h.createdAt)}{h.files.map((f:any)=><span key={f.id}> · <a className="text-link" href={'/api/file/'+f.id} target="_blank" rel="noreferrer">{f.name}</a></span>)}{h.url&&<span> · <a className="text-link" href={h.url} target="_blank" rel="noreferrer">link</a></span>}</li>)}</ul></details>}
  </article>)}
 </Panel>;
}

// Look: photos across the site in colour or black and white.
function Look(){
 const [v,setV]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{fetch('/api/look').then(r=>r.json()).then((d:any)=>setV(d.photos)).catch(()=>{})},[]);
 const choose=async(photos:string)=>{setBusy(true);setError('');try{const r=await fetch('/api/look',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({photos})});const d:any=await r.json();if(!r.ok)throw Error(d.error);setV(d.photos);document.documentElement.dataset.photos=d.photos;try{localStorage.setItem('fp-photos',d.photos)}catch{}}catch(e:any){setError(e.message)}finally{setBusy(false)}};
 return <Panel><h2>Look</h2><p className="small">Photos across the site. Learners see a change within a minute.</p>
  <div className="button-row">{([['bw','Black and white'],['colour','Colour']] as const).map(([k,l])=><Button key={k} variant={v===k?'default':'outline'} disabled={busy} aria-pressed={v===k} onClick={()=>choose(k)}>{l}</Button>)}</div>
  {error&&<p className="small" role="alert">{error}</p>}
 </Panel>;
}

// Uploads in storage: the total and the biggest users.
function Storage(){
 const [d,setD]=useState<any>(null);
 useEffect(()=>{get('section=storage').then(setD).catch(()=>{})},[]);
 if(!d)return null;
 return <Panel><h2>Storage</h2>
  <p>{mb(d.total.bytes)} in {d.total.files} files from {d.total.users} learners. <span className="small">Cloudflare R2 includes 10 GB free; after that about $0.015 per GB a month.</span></p>
  {d.top.length>0&&<table className="admin-table"><thead><tr><th>Learner</th><th>Files</th><th>Used</th></tr></thead><tbody>{d.top.map((r:any)=><tr key={r.user_id}><td>{r.email||r.user_id}</td><td>{r.files}</td><td>{mb(r.bytes)}</td></tr>)}</tbody></table>}
 </Panel>;
}

