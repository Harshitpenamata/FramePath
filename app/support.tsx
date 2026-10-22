'use client';
import React,{useEffect,useRef,useState} from 'react';
import {LifeBuoy,Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useLearning} from './ui';
import {plansOf,planTitle,parseVideoKey,moduleLesson,projectLabel} from './videography/programme';
import {ticketCategories,categoryLabel,learnerStatusLabel,messageMin,messageMax,replyMax} from './support-shared';
import {toast} from 'sonner';

// "Report a problem": a learner tells us what's wrong, and the ticket carries where they were (User ID, Course ID,
// pathway, module, lesson, page) so support knows the context without asking. The dialog shows what's attached.
// The server works the context out again from the learner's own account; this preview is only for them.
export function ReportProblem({planId,moduleKey,lesson,category:preset='',label='Report a problem',variant='outline'}:{planId?:string;moduleKey?:string;lesson?:number;category?:string;label?:string;variant?:'outline'|'ghost'}){
 const {s,user}=useLearning();
 const ref=useRef<HTMLDialogElement>(null);
 const [open,setOpen]=useState(false),[category,setCategory]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState<any>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(open&&!d.open)d.showModal();else if(!open&&d.open)d.close()},[open]);
 const plans=plansOf(s),mod=moduleKey?parseVideoKey(moduleKey):null;
 const plan=plans.find(p=>p.id===planId)||(mod&&(plans.find(p=>p.id===s.programme?.id&&p.level===mod.level)||plans.find(p=>p.level===mod.level)))||(planId||mod?null:s.programme)||null;
 const where=[(user as any)?.publicId&&`User ID ${(user as any).publicId}`,plan?.courseId&&`Course ID ${plan.courseId}`,plan&&planTitle(plan),mod&&`${mod.module.id} · ${moduleLesson(mod.module,projectLabel(plan)).title}`,lesson&&`Lesson ${lesson}`].filter(Boolean) as string[];
 const start=()=>{setCategory(preset);setMessage('');setError('');setSent(null);setOpen(true)};
 const send=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');
  try{const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category,message,planId:plan?.id,moduleKey,lesson,page:window.location.pathname+window.location.search,viewport:`${window.innerWidth}x${window.innerHeight}`})});
   const d:any=await r.json();if(!r.ok)throw Error(d.error||'That didn’t send. Please try again.');setSent(d.ticket)}
  catch(err:any){setError(err.message)}finally{setBusy(false)}};
 return <>
  <Button type="button" variant={variant} onClick={start}><LifeBuoy size={16}/>{label}</Button>
  <dialog ref={ref} className="sg-dialog" aria-labelledby="report-title" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   {sent?<>
    <h2 id="report-title"><Check size={22}/> Sent. Your ticket is {sent.id}</h2>
    <p>We’ll reply in <a className="text-link" href="/settings#help-requests">My account</a>. Quote <strong>{sent.id}</strong> if you contact us another way.</p>
    <div className="button-row"><Button type="button" onClick={()=>setOpen(false)}>Done</Button></div>
   </>:!user?<>
    <h2 id="report-title">Report a problem</h2>
    <p>Sign in so we can see which course and lesson you mean, and reply to you.</p>
    <div className="button-row"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><a data-slot="button" data-variant="default" className="sg-link-button" href={'/auth/google?return_to='+encodeURIComponent(typeof window==='undefined'?'/':window.location.pathname)}>Sign in with Google</a></div>
   </>:<form className="sg-report" onSubmit={send}>
    <h2 id="report-title">Report a problem</h2>
    <fieldset className="sg-choices sg-choices-grid" aria-label="What is it about?">{ticketCategories.map(([id,text])=><label key={id}><input type="radio" name="report-category" value={id} checked={category===id} onChange={()=>setCategory(id)} required/><span>{text}</span></label>)}</fieldset>
    <label className="vg-field">What happened?<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={5} minLength={messageMin} maxLength={messageMax} required placeholder="What were you trying to do, and what went wrong?"/></label>
    {where.length>0&&<p className="sg-attached small"><strong>We’ll include:</strong> {where.join(' · ')} · this page</p>}
    {error&&<p className="small" role="alert">{error}</p>}
    <div className="button-row"><Button type="button" variant="outline" onClick={()=>setOpen(false)} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy||!category||message.trim().length<messageMin}>{busy?'Sending…':'Send'}</Button></div>
   </form>}
  </dialog>
 </>;
}

// My account → Help requests: the learner's User ID and their tickets with support's replies.
// A ticket's conversation: the learner's first message, then each reply in order. viewer decides the names.
export function Thread({t,viewer}:{t:any;viewer:'learner'|'staff'}){
 const when=(n:number)=>new Date(n).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
 const who=(m:any)=>m.author==='staff'?(viewer==='staff'&&m.author_email?'Framepath · '+m.author_email:'Framepath'):viewer==='learner'?'You':'Learner';
 const all=[{id:'first',author:'learner',body:t.message,created_at:t.created_at},...(t.messages||[])];
 return <ol className="sg-thread">{all.map(m=><li key={m.id} className={m.author}><span className="small"><strong>{who(m)}</strong> · {when(m.created_at)}</span><p className="prewrap">{m.body}</p></li>)}</ol>;
}

export function HelpRequests(){
 const {user}=useLearning();
 const [tickets,setTickets]=useState<any[]|null>(null);
 const load=()=>fetch('/api/support').then(r=>r.json()).then((d:any)=>setTickets(d.tickets||[])).catch(()=>setTickets([]));
 useEffect(()=>{if(user)load()},[user]);
 // Once new replies are on screen, mark them seen so the header dot clears; they stay highlighted until the page reloads.
 useEffect(()=>{if(tickets?.some(t=>t.fresh))fetch('/api/support/seen',{method:'POST'}).catch(()=>{})},[tickets]);
 if(!user)return null;
 return <section className="panel sg-help-requests" id="help-requests">
  <div className="row between"><h2>Help requests</h2><ReportProblem/></div>
  <p className="small">Your User ID is <strong className="sg-id">{(user as any).publicId||'…'}</strong>. Quote it, with a course ID or ticket number, if you contact us.</p>
  {tickets===null?<p className="small" role="status">Loading…</p>:!tickets.length?<p className="small">No requests yet.</p>:
   <ul className="sg-tickets">{tickets.map(t=><li key={t.id} className={t.fresh?'fresh':''}>
    <div className="row between"><strong>{t.id} · {categoryLabel(t.category)}</strong><span className={'badge sg-status '+t.status}>{t.fresh?'New reply':learnerStatusLabel(t.status)}</span></div>
    <span className="small">{[t.course_id,t.plan_name,t.module_title,t.lesson&&'Lesson '+t.lesson].filter(Boolean).join(' · ')}</span>
    <Thread t={t} viewer="learner"/>
    <LearnerReply t={t} onSent={load}/>
   </li>)}</ul>}
 </section>;
}
// The learner answers support, or says a resolved problem is back (which reopens the ticket).
function LearnerReply({t,onSent}:{t:any;onSent:()=>void}){
 const [open,setOpen]=useState(false),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const resolved=t.status==='resolved';
 if(!open)return <div><Button variant="outline" size="sm" onClick={()=>setOpen(true)}>{resolved?'Still a problem? Reply':'Reply'}</Button></div>;
 async function send(){setBusy(true);setError('');try{const r=await fetch('/api/support/reply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,body})});const j:any=await r.json();if(!r.ok)throw Error(j.error);
  toast.success(resolved?'Sent. We’ve opened your request again.':'Reply sent.');setBody('');setOpen(false);onSent()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <div className="sg-reply-form"><label>Your reply<textarea rows={3} maxLength={replyMax} value={body} onChange={e=>setBody(e.target.value)} autoFocus/></label>
  {error&&<p className="small" role="alert">{error}</p>}
  <div className="button-row"><Button disabled={busy||!body.trim()} onClick={send}>{busy?'Sending…':'Send reply'}</Button><Button variant="outline" disabled={busy} onClick={()=>{setOpen(false);setBody('')}}>Cancel</Button></div></div>;
}
