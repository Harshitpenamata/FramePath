import {db,identity,readState,checkOrigin,fail,errorResponse} from '../../service';
import {sendWhatsApp,waLive} from '../../whatsapp';
export const dynamic='force-dynamic';
const what=(p:any)=>[p?.reviews&&'reviews',p?.deadlines&&'deadline reminders',p?.weekly&&'a weekly summary',p?.nudges&&'a nudge if you’ve been away'].filter(Boolean).join(', ')||'no updates yet';
// confirm: sent once per number after opting in. test: the same message again (3 a day at most).
export async function POST(req:Request){try{
 checkOrigin(req);const u=await identity();const b:any=await req.json();
 const {state:s}=await readState(u.userId);const w=s.whatsapp;
 if(!w?.optIn)return fail('Turn on WhatsApp updates first.');
 if(b.action==='test'){const n:any=await db().prepare("SELECT COUNT(*) AS n FROM wa_messages WHERE user_id=? AND template='fp_optin_confirm' AND dedupe_key IS NULL AND created_at>?").bind(u.userId,Date.now()-86400000).first();if((n?.n||0)>=3)return fail('You’ve sent 3 test messages today. Try again tomorrow.',429)}
 const r=await sendWhatsApp(u.userId,w,'fp_optin_confirm',[w.name||'there',what(w.prefs)],{dedupeKey:b.action==='confirm'?'optin:'+u.userId+':'+w.phone:undefined,force:true});
 return Response.json({...r,live:waLive()},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
