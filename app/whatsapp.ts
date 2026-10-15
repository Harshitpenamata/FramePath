import {env} from 'cloudflare:workers';
import {db} from './service';

// WhatsApp updates through Meta's WhatsApp Cloud API (no provider in between). Every message is a template Meta has
// approved (docs/whatsapp-templates.md), logged in wa_messages. Until WHATSAPP_MODE is 'live' and the credentials are
// set, messages are only logged ('test'), so everything can be checked without sending anything.
const setting=(k:string)=>String((env as any)[k]||process.env[k]||'');
export function waLive(){return setting('WHATSAPP_MODE')==='live'&&!!setting('WHATSAPP_TOKEN')&&!!setting('WHATSAPP_PHONE_ID')}
export const siteUrl=()=>setting('SITE_URL')||'http://127.0.0.1:5173';

// Templates as they're submitted to Meta. {{n}} are filled from params in order. All are 'utility': updates about the
// learner's own account and plan. Prices (India, per message, before GST): utility ₹0.115, marketing ₹0.8631.
export const templates={
 fp_optin_confirm:{category:'utility',params:['name','updates'],body:'Hi {{1}}, you’ll now get FramePath updates here on WhatsApp: {{2}}. Reply STOP at any time to turn them off.'},
 fp_review_ready:{category:'utility',params:['name','module','result','link'],body:'Hi {{1}}, your AI review for {{2}} is ready ({{3}}). See what worked and what to try next: {{4}}'},
 fp_deadline:{category:'utility',params:['name','module','due','done','total','link'],body:'Hi {{1}}, a reminder from your FramePath plan: {{2}} is due on {{3}}. You’ve finished {{4}} of {{5}} modules. Continue here: {{6}}'},
 fp_weekly:{category:'utility',params:['name','plan','handins','done','total','next','link'],body:'Hi {{1}}, your FramePath week in {{2}}: {{3}} handed in this week, {{4}} of {{5}} modules done. Next up: {{6}}. Keep going: {{7}}'},
 fp_inactive:{category:'utility',params:['name','days','plan','next','link'],body:'Hi {{1}}, it’s been {{2}} days since you last worked on {{3}}. Your next step: {{4}}. Pick up where you left off: {{5}}'},
} as const;
export type Template=keyof typeof templates;
const paise={utility:Math.round(11.5*1.18),marketing:Math.round(86.31*1.18)}; // estimated, GST included

// Phone numbers are stored as +<country><number>. A 10-digit number is taken as Indian (+91).
export function normalisePhone(raw:string){
 let d=String(raw||'').replace(/[\s()-]/g,'');
 if(/^0\d{10}$/.test(d))d=d.slice(1);
 if(/^\d{10}$/.test(d))d='+91'+d;
 if(/^\d{11,15}$/.test(d))d='+'+d;
 return /^\+[1-9]\d{9,14}$/.test(d)?d:'';
}
export type WaPrefs={reviews:boolean;deadlines:boolean;weekly:boolean;nudges:boolean};
export type WaSettings={phone:string;optIn:boolean;name:string;prefs:WaPrefs;quietFrom:number;quietTo:number;at:string};
export const defaultPrefs:WaPrefs={reviews:true,deadlines:true,weekly:true,nudges:true};
// India time (IST, UTC+5:30), used for quiet hours and the weekly summary.
export const istHour=(t=Date.now())=>new Date(t+5.5*3600000).getUTCHours();
export const istDay=(t=Date.now())=>new Date(t+5.5*3600000).getUTCDay();
export function inQuietHours(w:WaSettings,t=Date.now()){const h=istHour(t),from=w.quietFrom??21,to=w.quietTo??8;return from>to?(h>=from||h<to):(h>=from&&h<to)}
const perLearnerPerDay=3;
export const dailyLimit=()=>Number(setting('WHATSAPP_DAILY_LIMIT'))||300;
export const render=(t:Template,params:string[])=>templates[t].body.replace(/\{\{(\d+)\}\}/g,(_,n)=>params[Number(n)-1]??'');

// Sends one template (or logs it in test mode). dedupeKey: the same key is never sent twice (e.g. one reminder per
// module due date). instant: during quiet hours the message is held and the hourly job sends it later.
export async function sendWhatsApp(userId:string,w:WaSettings,t:Template,params:string[],{dedupeKey,instant=false,force=false}:{dedupeKey?:string;instant?:boolean;force?:boolean}={}){
 if(!w?.optIn||!w.phone)return {status:'skipped',reason:'not opted in'};
 const now=Date.now(),id=crypto.randomUUID(),body=render(t,params);
 const day0=now-24*3600000;
 if(!force){
  const mine:any=await db().prepare("SELECT COUNT(*) AS n FROM wa_messages WHERE user_id=? AND created_at>? AND status NOT IN ('skipped','failed')").bind(userId,day0).first();
  if((mine?.n||0)>=perLearnerPerDay)return {status:'skipped',reason:'daily limit for this learner'};
  const all:any=await db().prepare("SELECT COUNT(*) AS n FROM wa_messages WHERE created_at>? AND status IN ('sent','delivered','read','held')").bind(day0).first();
  if((all?.n||0)>=dailyLimit())return {status:'skipped',reason:'daily limit for FramePath'};
 }
 const status=!waLive()?'test':instant&&inQuietHours(w,now)?'held':'pending';
 const ins=await db().prepare('INSERT OR IGNORE INTO wa_messages(id,user_id,phone,template,params,body,category,status,dedupe_key,cost_paise,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,0,?,?)')
  .bind(id,userId,w.phone,t,JSON.stringify(params),body,templates[t].category,status,dedupeKey||null,now,now).run();
 if(!ins.meta.changes)return {status:'skipped',reason:'already sent'};
 if(status!=='pending')return {status,id,body};
 return deliver(id,w.phone,t,params);
}

// Calls the Cloud API for a logged message, and records the result.
export async function deliver(id:string,phone:string,t:Template,params:string[]){
 const version=setting('WHATSAPP_API_VERSION')||'v23.0';
 try{
  const r=await fetch(`https://graph.facebook.com/${version}/${setting('WHATSAPP_PHONE_ID')}/messages`,{method:'POST',headers:{Authorization:'Bearer '+setting('WHATSAPP_TOKEN'),'Content-Type':'application/json'},
   body:JSON.stringify({messaging_product:'whatsapp',to:phone.replace('+',''),type:'template',template:{name:t,language:{code:setting('WHATSAPP_TEMPLATE_LANG')||'en'},components:[{type:'body',parameters:params.map(text=>({type:'text',text:String(text).slice(0,900)}))}]}})});
  const j:any=await r.json().catch(()=>({}));
  if(!r.ok){await db().prepare("UPDATE wa_messages SET status='failed',error=?,updated_at=? WHERE id=?").bind(String(j?.error?.message||r.status).slice(0,300),Date.now(),id).run();return {status:'failed',id}}
  await db().prepare("UPDATE wa_messages SET status='sent',wa_id=?,cost_paise=?,updated_at=? WHERE id=?").bind(j?.messages?.[0]?.id||null,paise[templates[t].category as 'utility'],Date.now(),id).run();
  return {status:'sent',id};
 }catch(e:any){await db().prepare("UPDATE wa_messages SET status='failed',error=?,updated_at=? WHERE id=?").bind(String(e?.message||e).slice(0,300),Date.now(),id).run();return {status:'failed',id}}
}

// Sends messages held for quiet hours, once it's daytime again for that learner (called by the hourly job).
export async function sendHeld(settingsFor:(userId:string)=>Promise<WaSettings|null>){
 const rows:any[]=(await db().prepare("SELECT id,user_id,phone,template,params FROM wa_messages WHERE status='held' ORDER BY created_at LIMIT 50").all()).results||[];
 let sent=0;
 for(const r of rows){const w=await settingsFor(r.user_id);
  if(!w?.optIn){await db().prepare("UPDATE wa_messages SET status='skipped',error='opted out',updated_at=? WHERE id=?").bind(Date.now(),r.id).run();continue}
  if(inQuietHours(w))continue;
  if(waLive()){await deliver(r.id,r.phone,r.template,JSON.parse(r.params));sent++}
 }
 return sent;
}
