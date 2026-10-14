import {env} from 'cloudflare:workers';
import {db} from './service';

// AI spend guard. Every Claude and Gemini call records its tokens and estimated cost. When today's spend reaches the
// daily cap (AI_DAILY_BUDGET_USD, default $5), or a provider says the account is out of credit, AI work waits in a
// queue instead of failing; the scheduled job runs it once AI is available again.
// Prices are US$ per million tokens (checked 14 Oct 2026). Unknown models use the most expensive known rate.
const prices:Record<string,{input:number;output:number}>={
 'claude-opus-5-5':{input:4,output:20},
 'claude-sonnet-5-5':{input:2,output:10},
 'gemini-3.5-flash-lite':{input:0.3,output:2.5},
 'gemini-3.8-flash':{input:0.5,output:3},
};
const fallback={input:4,output:20};
export const day=(t=Date.now())=>new Date(t+5.5*3600000).toISOString().slice(0,10); // India date
export function dailyBudget(){const v=Number((env as any).AI_DAILY_BUDGET_USD||process.env.AI_DAILY_BUDGET_USD);return v>0?v:5}
export function costOf(model:string,input:number,output:number){const p=prices[model]||fallback;return (input*p.input+output*p.output)/1e6}

export async function recordUsage(provider:'anthropic'|'google',model:string,kind:string,input:number,output:number){
 try{await db().prepare('INSERT INTO ai_usage(id,day,provider,model,kind,input_tokens,output_tokens,usd,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),day(),provider,model,kind,input|0,output|0,costOf(model,input,output),Date.now()).run()}
 catch(e){console.error('AI usage not recorded',String(e).slice(0,200))}
}
export async function spentToday(){const r:any=await db().prepare('SELECT COALESCE(SUM(usd),0) AS usd FROM ai_usage WHERE day=?').bind(day()).first();return Number(r?.usd||0)}

async function flag(key:string){const r:any=await db().prepare('SELECT value FROM app_flags WHERE key=?').bind(key).first();return r?.value as string|undefined}
export async function setFlag(key:string,value:string){await db().prepare('INSERT INTO app_flags(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at').bind(key,value,Date.now()).run()}
// A provider said the account has no credit: pause AI for an hour, then the scheduled job tries again.
export async function pauseAI(reason:string){await setFlag('ai_paused_until',String(Date.now()+3600000));await setFlag('ai_paused_reason',reason)}

// Can AI run right now? If not, why (shown on the admin page; learners see a plain "in the queue" message).
export async function aiStatus():Promise<{ok:boolean;reason:''|'budget'|'credits';spent:number;budget:number}>{
 const [spent,until]=await Promise.all([spentToday(),flag('ai_paused_until')]);const budget=dailyBudget();
 if(until&&Number(until)>Date.now())return {ok:false,reason:'credits',spent,budget};
 if(spent>=budget)return {ok:false,reason:'budget',spent,budget};
 return {ok:true,reason:'',spent,budget};
}
export class AIQueued extends Error{status=202}
