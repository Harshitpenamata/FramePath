import {db} from './service';
import {sendWhatsApp,sendHeld,inQuietHours,istDay,istHour,siteUrl,type WaSettings} from './whatsapp';
import {moduleDueDates,planTitle,today,addDays} from './videography/programme';

// WhatsApp messages the hourly job sends (app/jobs.ts), each only to learners who chose that kind of update:
// - deadlines: 2 days before the next module in the open plan is due (once per module and date)
// - weekly: Sunday between 10 and 11 am India time
// - nudges: after 7 days without any activity (at most once a fortnight)
// Nothing goes out during a learner's quiet hours; the next hourly run picks it up.
export async function settingsFor(userId:string):Promise<WaSettings|null>{const r:any=await db().prepare('SELECT data FROM learners WHERE user_id=?').bind(userId).first();return r?JSON.parse(r.data).whatsapp||null:null}

export async function runWhatsAppJobs(){
 const out={deadlines:0,weekly:0,nudges:0,held:0};
 const rows:any[]=(await db().prepare("SELECT user_id,data,updated_at FROM learners WHERE json_extract(data,'$.whatsapp.optIn')=1 LIMIT 1000").all()).results||[];
 const now=Date.now(),d=today();
 for(const r of rows){
  const s=JSON.parse(r.data),w:WaSettings=s.whatsapp,p=s.programme;
  if(!w?.optIn||inQuietHours(w,now)||!p)continue;
  const name=w.name||'there',plan=planTitle(p),due=moduleDueDates(p),next=due.find(x=>!s.progress?.[x.key]);
  const done=due.filter(x=>s.progress?.[x.key]).length,link=siteUrl()+'/workspace/'+(p.id||'');
  if(w.prefs?.deadlines&&next&&next.due>=d&&next.due<=addDays(d,2)){
   const when=new Date(next.due+'T00:00:00Z').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short',timeZone:'UTC'});
   const res=await sendWhatsApp(r.user_id,w,'fp_deadline',[name,next.module.id+' · '+next.module.title,when,String(done),String(due.length),link],{dedupeKey:`deadline:${r.user_id}:${p.id}:${next.key}:${next.due}`});
   if(res.status==='sent'||res.status==='test')out.deadlines++;
  }
  if(w.prefs?.weekly&&istDay(now)===0&&istHour(now)===10){
   const week=(s.submissions||[]).filter((x:any)=>x.handIn&&Date.parse(x.createdAt)>now-7*86400000).length;
   const res=await sendWhatsApp(r.user_id,w,'fp_weekly',[name,plan,week===1?'1 task':week+' tasks',String(done),String(due.length),next?next.module.id+' · '+next.module.title:'your final project review',link],{dedupeKey:`weekly:${r.user_id}:${d}`});
   if(res.status==='sent'||res.status==='test')out.weekly++;
  }
  const idle=Math.floor((now-Number(r.updated_at||now))/86400000);
  if(w.prefs?.nudges&&idle>=7&&next){
   const recent:any=await db().prepare("SELECT 1 FROM wa_messages WHERE user_id=? AND template='fp_inactive' AND created_at>?").bind(r.user_id,now-14*86400000).first();
   if(!recent){const res=await sendWhatsApp(r.user_id,w,'fp_inactive',[name,String(idle),plan,next.module.id+' · '+next.module.title,link],{dedupeKey:`inactive:${r.user_id}:${d}`});if(res.status==='sent'||res.status==='test')out.nudges++}
  }
 }
 out.held=await sendHeld(settingsFor);
 return out;
}
