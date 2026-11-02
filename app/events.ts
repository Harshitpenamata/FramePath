import {db} from './service';
import type {StepName} from './events-shared';

// Records one step of the pilot tracker. dedupe (optional) makes a step count once, e.g. 'visit:<user>:<day>'.
// Never throws: tracking must not break the learner's action.
export async function logEvent(userId:string|null,name:StepName,props:Record<string,unknown>={},opts:{anonId?:string|null;path?:string;dedupe?:string}={}){
 try{await db().prepare('INSERT OR IGNORE INTO events(id,user_id,anon_id,name,props,path,dedupe,created_at) VALUES(?,?,?,?,?,?,?,?)')
  .bind(crypto.randomUUID(),userId,opts.anonId||null,name,JSON.stringify(props).slice(0,1000),opts.path?.slice(0,200)||null,opts.dedupe||null,Date.now()).run()}
 catch(e){console.error('Tracker event failed',name,String(e).slice(0,120))}
}
// Paid checks a learner can repeat (photo and comment screening): refuses past `limit` in the window, then records this one.
// Rejected attempts count too, since each one still costs a call.
// shortcut: count-then-insert isn't atomic, so parallel requests can pass a few over the limit; fine as a spend guard.
export async function limitChecks(userId:string,what:'photo'|'comment',limit:number,windowMs:number,message:string){
 const r:any=await db().prepare("SELECT COUNT(*) AS n FROM events WHERE user_id=? AND name='ai_check' AND json_extract(props,'$.what')=? AND created_at>?").bind(userId,what,Date.now()-windowMs).first();
 if(Number(r?.n||0)>=limit)throw Object.assign(new Error(message),{status:429});
 await logEvent(userId,'ai_check',{what});
}
export const today=()=>new Date().toISOString().slice(0,10);
