import {env} from 'cloudflare:workers';
import {getUser} from './user';
import {freshState,mentors,paths,weeks} from './catalog';
import {isFreePath,moduleInfo,blockingModule} from './learning-rules';
export function db(){if(!env.DB)throw new Error('Learning storage is unavailable. Please try again.');return env.DB}
export function bucket(){if(!env.BUCKET)throw new Error('Upload storage is unavailable. Please try again.');return env.BUCKET}
export function fail(message:string,status=400){return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}})}
export async function identity(){const u=await getUser();if(!u)throw Object.assign(new Error('Sign in to save your learning.'),{status:401});return u}
export function checkOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw Object.assign(new Error('This request is not allowed.'),{status:403})}
export async function readState(id:string){await db().prepare('INSERT OR IGNORE INTO learners(user_id,data,revision,updated_at) VALUES(?,?,0,?)').bind(id,JSON.stringify(freshState()),Date.now()).run();const row:any=await db().prepare('SELECT data,revision FROM learners WHERE user_id=?').bind(id).first();return {state:JSON.parse(row.data),revision:row.revision}}
export async function saveState(id:string,state:any,revision:number){const r=await db().prepare('UPDATE learners SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(JSON.stringify(state),Date.now(),id,revision).run();if(!r.meta.changes)throw Object.assign(new Error('Your learning changed in another tab. Refresh and try again.'),{status:409});return revision+1}
export function activeExplore(s:any){return s.membership&&new Date(s.membership.expiresAt).getTime()>Date.now()}
export function craftEnrolled(s:any){return s.craft&&['paid','active'].includes(s.craft.status)}
export function safeText(v:unknown,max=4000,min=0){if(typeof v!=='string'||v.trim().length<min||v.length>max)throw new Error('Please enter valid text within the stated limit.');return v.trim()}
export function safeUrl(v:unknown){const t=safeText(v,1500);if(!t)return '';try{const u=new URL(t);if(u.protocol!=='https:'||u.username||u.password)throw 0;return u.href}catch{throw new Error('Use a complete HTTPS viewing link.')}}
export function lessonKey(key:string){const info=moduleInfo(key);return {...info,scope:info.craft?'craft':'explore'}}
export function requireLesson(s:any,key:string){const info=lessonKey(key);if(info.scope==='explore'&&!isFreePath(info.pathId)&&!activeExplore(s))throw new Error('Annual access is needed to save work on this pathway. The first two pathways are free.');if(info.scope==='craft'&&s.craft?.status!=='active')throw new Error('Your mentor needs to approve your Craft pathway first.');const blocked=blockingModule(s,key);if(blocked)throw new Error('Finish the reflection checkpoint for '+moduleInfo(blocked).lesson.title+' first.');return info}
export function mentorFor(id:string){const m=mentors.find(x=>x.id===id);if(!m)throw new Error('Choose one of the available pilot mentors.');return m}
export async function usage(id:string,s:any){const rows=await db().prepare("SELECT scope,kind,count(*) AS used FROM ai_jobs WHERE user_id=? AND status IN ('pending','complete') AND ((scope='explore' AND created_at>=?) OR (scope='craft' AND created_at>=?)) GROUP BY scope,kind").bind(id,new Date(s.membership?.startsAt||new Date()).getTime(),new Date(s.craft?.paidAt||new Date()).getTime()).all();return rows.results}
export function errorResponse(e:any){console.error('Framepath request failed',e?.status||500,e?.name||'Error');return fail(e?.message||'Something went wrong. Your work has not been changed.',e?.status||400)}

