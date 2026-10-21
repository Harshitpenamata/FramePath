import {db} from './service';
import type {StepName} from './events-shared';

// Records one step of the pilot tracker. dedupe (optional) makes a step count once, e.g. 'visit:<user>:<day>'.
// Never throws: tracking must not break the learner's action.
export async function logEvent(userId:string|null,name:StepName,props:Record<string,unknown>={},opts:{anonId?:string|null;path?:string;dedupe?:string}={}){
 try{await db().prepare('INSERT OR IGNORE INTO events(id,user_id,anon_id,name,props,path,dedupe,created_at) VALUES(?,?,?,?,?,?,?,?)')
  .bind(crypto.randomUUID(),userId,opts.anonId||null,name,JSON.stringify(props).slice(0,1000),opts.path?.slice(0,200)||null,opts.dedupe||null,Date.now()).run()}
 catch(e){console.error('Tracker event failed',name,String(e).slice(0,120))}
}
export const today=()=>new Date().toISOString().slice(0,10);
