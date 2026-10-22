import {env} from 'cloudflare:workers';
import {db} from './service';
import {sign,verify,sha256} from './session';
import {siteUrl} from './whatsapp';
import {plansOf,planTitle,behindBy,parseVideoKey,moduleLesson,projectLabel,today} from './videography/programme';

// Email alerts through Resend (RESEND_API_KEY; sender EMAIL_FROM). Each send is logged in email_log under a dedupe key,
// so the same alert never goes twice. Without a key nothing is sent: the alert is logged as 'skipped'.
//  - ticket_new: a learner raised a ticket → every ADMIN_EMAILS address
//  - ticket_reply: support replied → the learner
//  - review_ready: a queued AI review finished in the hourly job → the learner
//  - reminder: the open plan is 2+ days behind → the learner, at most every 4 days, at 9am India time. Has an unsubscribe link.
const setting=(k:string)=>String((env as any)[k]||process.env[k]||'');
export const emailLive=()=>!!setting('RESEND_API_KEY');
const from=()=>setting('EMAIL_FROM')||'Framepath <hello@framepath.ai>';
const esc=(v:string)=>v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

type Mail={to:string;userId?:string|null;kind:string;dedupe:string;subject:string;heading:string;lines:string[];quote?:string;button?:{label:string;href:string};unsubscribe?:string};

// Plain layout in the site's colours: cream card, black text, one lime button. Every email also has a text version.
function render(m:Mail){
 const p=(t:string)=>`<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#0b0b0b">${esc(t)}</p>`;
 const html=`<!doctype html><html><body style="margin:0;padding:24px;background:#0b0b0b;font-family:Inter,Segoe UI,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#f2eee4;border-radius:20px;padding:32px">
<p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#0b0b0b">framepath</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#0b0b0b">${esc(m.heading)}</h1>
${m.lines.map(p).join('')}
${m.quote?`<div style="margin:0 0 16px;padding:16px;border-radius:12px;background:#fff;color:#0b0b0b;font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(m.quote)}</div>`:''}
${m.button?`<p style="margin:24px 0 0"><a href="${esc(m.button.href)}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#d6e86b;color:#0b0b0b;font-weight:700;text-decoration:none">${esc(m.button.label)}</a></p>`:''}
</div>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#a7a399">${m.unsubscribe?`You get these because you have a plan on Framepath. <a href="${esc(m.unsubscribe)}" style="color:#a7a399">Stop reminder emails</a>.`:'This email is about your Framepath account.'}</p>
</body></html>`;
 const text=[m.heading,'',...m.lines,...(m.quote?['',m.quote]:[]),...(m.button?['',`${m.button.label}: ${m.button.href}`]:[]),...(m.unsubscribe?['','Stop reminder emails: '+m.unsubscribe]:[])].join('\n');
 return {html,text};
}

export async function sendEmail(m:Mail):Promise<'sent'|'skipped'|'duplicate'|'failed'>{
 const id=crypto.randomUUID(),now=Date.now();
 const r=await db().prepare("INSERT OR IGNORE INTO email_log(id,user_id,kind,dedupe,to_address,status,created_at) VALUES(?,?,?,?,?,'sending',?)").bind(id,m.userId||null,m.kind,m.dedupe,m.to,now).run();
 if(!r.meta.changes)return 'duplicate';
 const done=(status:string)=>db().prepare('UPDATE email_log SET status=? WHERE id=?').bind(status,id).run();
 if(!emailLive()){await done('skipped');return 'skipped'}
 const {html,text}=render(m);
 const headers:Record<string,string>={};
 if(m.unsubscribe){headers['List-Unsubscribe']=`<${m.unsubscribe}>`;headers['List-Unsubscribe-Post']='List-Unsubscribe=One-Click'}
 try{
  const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+setting('RESEND_API_KEY'),'Content-Type':'application/json'},
   body:JSON.stringify({from:from(),to:[m.to],subject:m.subject,html,text,headers})});
  if(!res.ok){console.error('Email failed',m.kind,res.status,(await res.text()).slice(0,300));await done('failed');return 'failed'}
  await done('sent');return 'sent';
 }catch(e:any){console.error('Email failed',m.kind,String(e?.message||e).slice(0,200));await done('failed');return 'failed'}
}
// Alerts never break the request that triggered them.
const quiet=(p:Promise<unknown>)=>p.catch((e:any)=>console.error('Email alert failed',String(e?.message||e).slice(0,200)));

const adminEmails=()=>setting('ADMIN_EMAILS').toLowerCase().split(/[,\s]+/).filter(Boolean);
const moduleUrl=(key:string)=>{const m=/^(video-(?:beginner|intermediate|advanced))-(\d{1,2})$/.exec(key);return siteUrl()+(m?`/explore/${m[1]}/${m[2]}`:'/portfolio')};

export function ticketCreatedAlert(t:{id:string;publicUserId:string;courseId?:string|null;category:string;message:string;moduleTitle?:string|null;email?:string}){
 return quiet(Promise.all(adminEmails().map(to=>sendEmail({to,kind:'ticket_new',dedupe:`ticket_new:${t.id}:${to}`,
  subject:`New ticket ${t.id} (${t.category})`,heading:`New ticket ${t.id}`,
  lines:[`From ${t.email||'a learner'} · ${t.publicUserId}${t.courseId?' · '+t.courseId:''}${t.moduleTitle?' · '+t.moduleTitle:''}`],
  quote:t.message,button:{label:'Open support tickets',href:siteUrl()+'/admin'}}))));
}

export function ticketReplyAlert(ticketId:string){
 return quiet((async()=>{
  const t:any=await db().prepare('SELECT t.id,t.user_id,t.reply,t.status,l.email FROM support_tickets t LEFT JOIN learners l ON l.user_id=t.user_id WHERE t.id=?').bind(ticketId).first();
  if(!t?.email||!t.reply)return;
  await sendEmail({to:t.email,userId:t.user_id,kind:'ticket_reply',dedupe:`ticket_reply:${t.id}:${await sha256(t.reply)}`,
   subject:`We replied to your request ${t.id}`,heading:`We replied to your request ${t.id}`,
   lines:[t.status==='resolved'?'We’ve marked it resolved. If something’s still wrong, report it again from the page.':'Here’s our reply:'],
   quote:t.reply,button:{label:'See it in My account',href:siteUrl()+'/settings'}});
 })());
}

export function reviewReadyAlert(userId:string,jobId:string,lessonKey:string){
 return quiet((async()=>{
  const l:any=await db().prepare('SELECT email FROM learners WHERE user_id=?').bind(userId).first();if(!l?.email)return;
  const mod=parseVideoKey(lessonKey);
  await sendEmail({to:l.email,userId,kind:'review_ready',dedupe:`review_ready:${jobId}`,
   subject:'Your feedback is ready',heading:'Your feedback is ready',
   lines:[mod?`The AI review of your work for ${moduleLesson(mod.module,'').title} is in.`:'The AI review of your work is in.','It has what worked, what to fix, and what to try next.'],
   button:{label:'Read my feedback',href:moduleUrl(lessonKey)}});
 })());
}

// Unsubscribe links: signed, so only the learner's own email can turn their reminders off. Valid for a year.
export async function unsubscribeUrl(userId:string){return siteUrl()+'/api/email/unsubscribe?t='+encodeURIComponent(await sign({u:userId,p:'unsub',exp:Math.floor(Date.now()/1000)+365*86400}))}
export async function unsubscribeUser(token:string|null){const p:any=await verify(token||undefined);if(!p||p.p!=='unsub'||typeof p.u!=='string')return false;
 await db().prepare('INSERT OR IGNORE INTO email_optouts(user_id,created_at) VALUES(?,?)').bind(p.u,Date.now()).run();return true}

// Behind-schedule reminders. Runs from the hourly job; sends only in the 9am hour, India time.
export async function runReminders(now=new Date()){
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',hour12:false}).format(now));
 if(hour!==9)return {sent:0,checked:0};
 const day=today(),rows:any[]=(await db().prepare(`SELECT user_id,email,data,updated_at FROM learners WHERE email IS NOT NULL AND email<>''
  AND user_id NOT IN (SELECT user_id FROM email_optouts)
  AND user_id NOT IN (SELECT user_id FROM email_log WHERE kind='reminder' AND created_at>?) LIMIT 500`).bind(now.getTime()-4*86400000).all()).results||[];
 let sent=0;
 for(const r of rows){
  if(now.getTime()-r.updated_at<86400000)continue; // they were on the site in the last day
  let s:any;try{s=JSON.parse(r.data)}catch{continue}
  const p:any=s.programme&&plansOf(s).find((x:any)=>x.id===s.programme.id)||s.programme;if(!p)continue;
  const late=behindBy(p,s.progress||{},day);if(!late||late.days<2)continue;
  const mod=parseVideoKey(late.key),title=mod?moduleLesson(mod.module,projectLabel(p)).title:'your next module';
  const res=await sendEmail({to:r.email,userId:r.user_id,kind:'reminder',dedupe:`reminder:${r.user_id}:${day}`,
   subject:`Pick up ${title}`,heading:`You’re ${late.days} days behind on ${planTitle(p)}`,
   lines:[`Next up: ${title}.`,'A little today keeps the plan on track. If your week changed, you can move your dates from the plan page.'],
   button:{label:'Open my plan',href:siteUrl()+(p.id?`/workspace/${p.id}`:'/workspace')},unsubscribe:await unsubscribeUrl(r.user_id)});
  if(res==='sent')sent++;
 }
 return {sent,checked:rows.length};
}
