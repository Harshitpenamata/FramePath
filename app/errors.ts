import {AsyncLocalStorage} from 'node:async_hooks';
import {env} from 'cloudflare:workers';

// Server error monitoring. Unexpected errors are written to error_log (route, error type, a short message; never
// request bodies or learner content), and the hourly job emails a daily summary to ADMIN_EMAILS at 9am India time.
// Deliberate messages to the learner (a plain Error such as "Choose 1–20 hours") are not errors and are not logged.

const request=new AsyncLocalStorage<{route:string}>();
export function runWithRequest<T>(req:Request,run:()=>T):T{
  const url=new URL(req.url);
  return request.run({route:req.method+' '+url.pathname},run);
}

// Malformed JSON from a client (status below 500) is the client's fault, not a server error.
const unexpected=(e:any,status:number)=>status>=500||(e&&e.name&&e.name!=='Error'&&e.name!=='SyntaxError')||/^D1_|SQLITE/i.test(String(e?.message||''));

// Never throws: monitoring must not break the request it is watching.
export async function logError(source:string,e:any,status=Number(e?.status)||500){
  if(!unexpected(e,status))return;
  try{
    const DB=(env as any).DB;if(!DB)return;
    await DB.prepare('INSERT INTO error_log(id,source,route,status,name,message,created_at) VALUES(?,?,?,?,?,?,?)')
      .bind(crypto.randomUUID(),source,request.getStore()?.route||null,status,String(e?.name||'Error').slice(0,60),String(e?.message||e).slice(0,300),Date.now()).run();
  }catch(err:any){console.error('Error log write failed',String(err?.message||err).slice(0,200))}
}

const indiaHour=(now:Date)=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',hour12:false}).format(now));
const indiaDate=(now:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(now);

// Called from the hourly job. Sends at most one email a day, and only when there were errors in the last 24 hours.
// force=true (the admin "send now" button) skips the 9am check and uses its own dedupe key, so the real email still goes.
export async function runErrorDigest(now=new Date(),force=false){
  if(!force&&indiaHour(now)!==9)return {sent:0,errors:0};
  const DB=(env as any).DB;
  const since=now.getTime()-86400000;
  const rows:any[]=(await DB.prepare('SELECT source,route,status,name,message,COUNT(*) AS n,MAX(created_at) AS last FROM error_log WHERE created_at>=? GROUP BY source,route,name,message ORDER BY n DESC LIMIT 15').bind(since).all()).results||[];
  const total=rows.reduce((t,r)=>t+Number(r.n),0);
  if(!total)return {sent:0,errors:0};
  const {sendEmail}=await import('./email');
  const {siteUrl}=await import('./whatsapp');
  const admins=String((env as any).ADMIN_EMAILS||process.env.ADMIN_EMAILS||'').toLowerCase().split(/[,\s]+/).filter(Boolean);
  const day=indiaDate(now);
  const lines=rows.map(r=>`${r.n}× ${r.status} ${r.route||r.source} · ${r.name}: ${r.message}`);
  let sent=0;
  for(const to of admins){
    const status=await sendEmail({to,kind:'error_digest',dedupe:force?`error_digest_manual:${now.getTime()}:${to}`:`error_digest:${day}:${to}`,
      subject:`Framepath: ${total} server error${total===1?'':'s'} in the last 24 hours`,
      heading:`${total} server error${total===1?'':'s'} in the last 24 hours`,
      lines:['The most frequent ones are below, most common first. Learners may not have reported these.'],
      quote:lines.join('\n'),button:{label:'Open the admin page',href:siteUrl()+'/admin'}});
    if(status==='sent')sent++;
  }
  if(force)return {sent,errors:total};
  // Keep a month of history.
  await DB.prepare('DELETE FROM error_log WHERE created_at<?').bind(now.getTime()-30*86400000).run();
  return {sent,errors:total};
}
