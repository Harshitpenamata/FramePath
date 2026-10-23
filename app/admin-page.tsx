'use client';
import React,{useEffect,useState} from 'react';
import {Panel,PageHead,Badge} from './ui';
import {Button} from '@/components/ui/button';
import './videography/studio.css';
import {categoryLabel,statusLabel,replyMax} from './support-shared';
import {Thread} from './support';
import {toast} from 'sonner';

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
  <WhatsAppAdmin/>
  <PilotFunnel/>
  <SupportQueue/>
  <Storage/>
<EmailChecks/>
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
  <form className="admin-search" onSubmit={find}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Email, FP-10001 or VID-B-1001" aria-label="Email, User ID or Course ID"/><Button size="sm" type="submit">Find</Button></form>
  {error&&<p className="field-error">{error}</p>}
  {users&&!users.length&&<p className="small">No learner with that email has signed in since emails started being saved.</p>}
  {users?.map(u=><article key={u.userId} className="admin-flag">
   <p><strong>{u.publicId||'No ID yet'}</strong> · {u.email}{u.name&&' · '+u.name} · last active {at(u.lastActive)}{u.paid.selfPaced&&' · Self-paced'}{u.paid.mentor&&' · Mentor'}</p>
   <p className="small">Plans: {u.plans.length?u.plans.map((p:any)=>(p.courseId?p.courseId+' ':'')+p.title+' ('+p.level+(p.open?', open':'')+')').join('; '):'none'}</p>
   <p className="small">{u.handIns.length} hand-ins · {u.reviews} AI reviews · {u.comments} comments · {u.files} files, {mb(u.bytes)}{u.portfolio&&<> · portfolio <a className="text-link" href={'/p/'+u.portfolio.token} target="_blank" rel="noreferrer">{u.portfolio.visibility}</a></>}</p>
   {u.handIns.length>0&&<details><summary>Hand-ins</summary><ul className="admin-list">{u.handIns.map((h:any)=><li key={h.id}>{h.key} · {at(h.createdAt)}{h.files.map((f:any)=><span key={f.id}> · <a className="text-link" href={'/api/file/'+f.id} target="_blank" rel="noreferrer">{f.name}</a></span>)}{h.url&&<span> · <a className="text-link" href={h.url} target="_blank" rel="noreferrer">link</a></span>}</li>)}</ul></details>}
  </article>)}
 </Panel>;
}

// Pilot funnel: how many people reach each step, who comes back, and whether AI reviews help.
function PilotFunnel(){
 const [days,setDays]=useState(30),[d,setD]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{setD(null);fetch('/api/admin/funnel?days='+days).then(async r=>{const j:any=await r.json();if(!r.ok)throw Error(j.error);setD(j)}).catch(e=>setError(e.message))},[days]);
 const pct=(a:number,b:number)=>b?Math.round(a/b*100)+'%':'–';
 return <Panel><h2>Pilot funnel</h2>
  <div className="button-row">{[7,30,90].map(n=><Button key={n} variant={days===n?'default':'outline'} aria-pressed={days===n} onClick={()=>setDays(n)}>Last {n} days</Button>)}</div>
  {error&&<p className="small" role="alert">{error}</p>}
  {!d?<p className="small" role="status">Loading…</p>:<>
   <table className="admin-table admin-funnel"><thead><tr><th>Step</th><th>People</th><th>Of the step before</th><th>Of all visitors</th></tr></thead><tbody>
    {d.steps.map((st:any,i:number)=><tr key={st.name}><td>{st.label}</td><td>{st.people}</td><td>{i?pct(st.people,d.steps[i-1].people):'–'}</td><td>{pct(st.people,d.steps[0].people)}</td></tr>)}</tbody></table>
   {d.backfilled>0&&<p className="small">Tracking started on 20 Oct 2026. {d.backfilled} earlier steps were recovered from saved data: plans made, hand-ins, modules finished, AI reviews and each learner’s last active day. Visits, plans started, videos watched and reviews opened from before then weren’t saved, so those steps undercount and the percentages for earlier dates can look uneven.</p>}
   <p className="small">Signed-in learners who came back in a later week: <strong>{d.returning.cameBack} of {d.returning.signedIn}</strong> ({pct(d.returning.cameBack,d.returning.signedIn)}).</p>
   <h3>Were AI reviews useful?</h3>
   <p className="small">{d.reviews.rated?<><strong>{pct(d.reviews.useful,d.reviews.rated)}</strong> said yes ({d.reviews.useful} of {d.reviews.rated} answers).</>:'No answers yet.'}</p>
   {d.reviews.comments.length>0&&<ul className="admin-list">{d.reviews.comments.map((c:any,i:number)=><li key={i}><strong>{c.helpful?'👍':'👎'} {c.module}</strong> · {c.public_id||'learner'} · {new Date(c.created_at).toLocaleDateString('en-IN')}<br/><span className="small">{c.comment}</span></li>)}</ul>}
  </>}
 </Panel>;
}

// Support tickets: the queue, newest first, resolved last. Find a ticket by T-1001, a learner by FP-10001 or
// email, or a plan by VID-B-1001. Each ticket shows the context it was raised from.
function SupportQueue(){
 const [status,setStatus]=useState('open'),[q,setQ]=useState(''),[d,setD]=useState<any>(null),[error,setError]=useState('');
 const load=(st=status,query=q)=>fetch('/api/admin/support?'+new URLSearchParams({status:st,q:query})).then(async r=>{const j:any=await r.json();if(!r.ok)throw Error(j.error);setD(j)}).catch(e=>setError(e.message));
 useEffect(()=>{load()},[]);
 const counts=d?.counts||{};
 return <Panel className={(counts.open||0)>0?'admin-alert':''}><h2 id="tickets">Support tickets ({counts.open||0} open)</h2>
  <form className="admin-search" onSubmit={e=>{e.preventDefault();load(status,q)}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="T-1001, FP-10001, VID-B-1001 or email" aria-label="Find tickets"/><Button type="submit" variant="outline">Find</Button></form>
  <div className="button-row">{[['open','Open'],['in_progress','In progress'],['resolved','Resolved'],['','All']].map(([k,l])=><Button key={k} variant={status===k?'default':'outline'} aria-pressed={status===k} onClick={()=>{setStatus(k);load(k,q)}}>{l}{k&&counts[k]?` (${counts[k]})`:''}</Button>)}</div>
  {error&&<p className="small" role="alert">{error}</p>}
  {!d?<p className="small" role="status">Loading…</p>:!d.tickets.length?<p className="small">No tickets.</p>:d.tickets.map((t:any)=><Ticket key={t.id+t.updated_at} t={t} onSaved={()=>load()}/>)}
 </Panel>;
}
// One ticket: where it came from, the conversation, and the actions. Sending a reply moves it to in progress (or
// resolved), and the learner gets an email; resolving and reopening are buttons, never a status to remember to set.
function Ticket({t,onSaved}:{t:any;onSaved:()=>void}){
 const [reply,setReply]=useState(''),[note,setNote]=useState(t.note||''),[busy,setBusy]=useState(''),[error,setError]=useState('');
 const act=async(action:string,extra:any,done:string)=>{setBusy(action+(extra.resolve?'+':''));setError('');try{const r=await fetch('/api/admin/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,action,...extra})});const j:any=await r.json();if(!r.ok)throw Error(j.error);toast.success(done);if(action!=='note')onSaved()}catch(e:any){setError(e.message)}finally{setBusy('')}};
 const to=t.email||t.context?.email||'the learner',resolved=t.status==='resolved';
 const when=(n:number)=>new Date(n).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
 return <details className="admin-ticket" open={!resolved}><summary><strong>{t.id}</strong> · {categoryLabel(t.category)} · <span className={'badge sg-status '+t.status}>{statusLabel(t.status)}</span> · {when(t.created_at)}</summary>
  <dl className="admin-ticket-context">
   <div><dt>User ID</dt><dd>{t.public_user_id} · {t.email||t.context?.email||'no email'}</dd></div>
   <div><dt>Course ID</dt><dd>{t.course_id||'—'}</dd></div>
   <div><dt>Plan</dt><dd>{[...new Set([t.course,t.pathway,t.plan_name,t.level].filter(Boolean).flatMap((v:string)=>v.split(' · ')))].join(' · ')||'—'}</dd></div>
   <div><dt>Where</dt><dd>{[t.module_title,t.lesson&&'Lesson '+t.lesson].filter(Boolean).join(' · ')||'—'} · <a className="text-link" href={t.page} target="_blank" rel="noreferrer">{t.page}</a></dd></div>
   <div><dt>Device</dt><dd className="small">{t.context?.viewport} · {t.context?.browser}</dd></div>
  </dl>
  <Thread t={t} viewer="staff"/>
  {resolved?<div className="button-row"><Button variant="outline" disabled={!!busy} onClick={()=>act('reopen',{},`${t.id} reopened.`)}>{busy==='reopen'?'Reopening…':'Reopen'}</Button></div>
   :<><label>Reply to {to}<textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3} maxLength={replyMax} placeholder="They’ll get it by email and in My account."/></label>
    <div className="button-row">
     <Button disabled={!!busy||!reply.trim()} onClick={()=>act('reply',{body:reply},`Reply sent to ${to}. ${t.id} is in progress.`)}>{busy==='reply'?'Sending…':'Send reply'}</Button>
     <Button variant="outline" disabled={!!busy||!reply.trim()} onClick={()=>act('reply',{body:reply,resolve:true},`Reply sent to ${to}. ${t.id} is resolved.`)}>{busy==='reply+'?'Sending…':'Send and resolve'}</Button>
     <Button variant="outline" disabled={!!busy} onClick={()=>act('resolve',{},`${t.id} resolved. ${to} has been told.`)}>{busy==='resolve'?'Resolving…':'Resolve without reply'}</Button>
    </div></>}
  <details className="admin-note"><summary>Staff note{t.note?' (has a note)':''}</summary>
   <label>Only staff see this<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2}/></label>
   <div className="button-row"><Button variant="outline" disabled={!!busy} onClick={()=>act('note',{note},'Note saved.')}>{busy==='note'?'Saving…':'Save note'}</Button></div>
  </details>
  {error&&<p className="small" role="alert">{error}</p>}
 </details>;
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

// Email checks: send a test email (e.g. to a Gmail and an Outlook address) or the server-error summary now.
function EmailChecks(){
 const [to,setTo]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState('');
 async function send(body:any){setBusy(true);setResult('');
  try{const r=await fetch('/api/admin/email-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d:any=await r.json().catch(()=>({}));
   setResult(!r.ok?(d.error||'Not sent ('+(d.status||r.status)+').'):body.kind==='errors'?(d.errors?`Sent to ${d.sent} admin(s): ${d.errors} errors in the last 24 hours.`:'No server errors in the last 24 hours, so nothing was sent.'):`Sent to ${d.to}. Check the inbox and the spam folder.`)}
  catch{setResult('Could not reach the server.')}finally{setBusy(false)}}
 return <Panel><h2>Email checks</h2>
  <p className="small">Send a test email to check it arrives in the inbox, not spam. Leave the address empty to send it to yourself.</p>
  <div className="button-row"><input type="email" value={to} onChange={e=>setTo(e.target.value)} placeholder="someone@outlook.com" aria-label="Test email address" maxLength={200}/>
   <Button disabled={busy} onClick={()=>send({kind:'test',to})}>Send test email</Button>
   <Button variant="outline" disabled={busy} onClick={()=>send({kind:'errors'})}>Send error summary now</Button></div>
  {result&&<p className="small" role="status">{result}</p>}
 </Panel>;
}

// WhatsApp: test or live, who's opted in, this week's messages, recent messages with their text, and cost.
function WhatsAppAdmin(){
 const [d,setD]=useState<any>(null);
 useEffect(()=>{get('section=whatsapp').then(setD).catch(()=>{})},[]);
 if(!d)return null;
 return <Panel><h2>WhatsApp</h2>
  <p>{d.live?<Badge tone="green">Live</Badge>:<Badge>Test mode</Badge>} {d.live?'Messages are being sent.':'Messages are logged here but not sent. To switch on, set the WhatsApp settings (docs/whatsapp-setup.md).'} {d.optedIn} learners opted in · about ₹{d.costInr30d.toFixed(2)} in the last 30 days.</p>
  {d.week.length>0&&<table className="admin-table"><thead><tr><th>Message</th><th>Status</th><th>This week</th></tr></thead><tbody>{d.week.map((r:any)=><tr key={r.template+r.status}><td>{r.template}</td><td>{r.status}</td><td>{r.n}</td></tr>)}</tbody></table>}
  {d.recent.length>0&&<details><summary>Recent messages ({d.recent.length})</summary><ul className="admin-list">{d.recent.map((m:any,i:number)=><li key={i}><strong>{m.template}</strong> · {m.status} · {m.email||m.phone} · {at(m.created_at)}<br/><span className="small">{m.body}{m.error?' · '+m.error:''}</span></li>)}</ul></details>}
 </Panel>;
}

