'use client';
import React,{useEffect,useState} from 'react';
import {Panel,PageHead,Badge} from './ui';
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
  <Panel><h2>AI</h2>
   <p>{d.ai.ok?<Badge tone="green">Running</Badge>:<Badge>{d.ai.reason==='credits'?'Paused: provider has no credit':'Paused: daily cap reached'}</Badge>} Today ${d.ai.spent.toFixed(2)} of ${d.ai.budget} cap ({pct}%){pct>=80&&' · close to the cap'}</p>
   <p>{d.queuedReviews} reviews and {d.pendingComments} comments waiting in the queue.</p>
   <table className="admin-table"><thead><tr><th>Day</th><th>Provider</th><th>Calls</th><th>US$</th></tr></thead><tbody>{d.spend.map((r:any)=><tr key={r.day+r.provider}><td>{r.day}</td><td>{r.provider}</td><td>{r.calls}</td><td>{r.usd}</td></tr>)}</tbody></table>
  </Panel>
  <Panel><h2>Lesson videos</h2><p className="small">{d.videos.checked} of {d.videos.total} checked · last check {when(d.videos.lastCheck)}</p>
   <h3>Dead: hidden from lessons, replace these ({d.videos.dead.length})</h3>{list(d.videos.dead)}
   <h3>Failed one check, being watched ({d.videos.failingOnce.length})</h3>{list(d.videos.failingOnce)}
   <h3>Open in a new tab, not inside FramePath ({d.videos.noframe.length})</h3>{list(d.videos.noframe)}
  </Panel>
 </>;
}
