import {db,identity,fail,errorResponse} from '../../../service';
import {isAdmin} from '../health/route';
import {funnelSteps} from '../../../events-shared';
import {setFlag} from '../../../ai-budget';

// The tracker started recording on 20 Oct 2026. Steps from before then are recovered once from saved data:
// plans made, hand-ins, modules finished, AI reviews, and each learner's last active day (as a visit). Videos
// watched, plans started and reviews opened weren't saved with dates, so they can't be recovered.
// Only what happened before the first live event is filled in, so nothing is counted twice.
async function backfillOnce(){
 const done:any=await db().prepare("SELECT value FROM app_flags WHERE key='funnel_backfill'").first();if(done)return;
 const first:any=await db().prepare("SELECT MIN(created_at) AS t FROM events WHERE props NOT LIKE '%\"backfilled\":true%'").first();
 const cutoff=Number(first?.t)||Date.now(),rows:any[]=[];
 const add=(user:string,name:string,at:number,props:Record<string,unknown>,dedupe:string)=>{if(at>0&&at<cutoff)rows.push(db().prepare('INSERT OR IGNORE INTO events(id,user_id,anon_id,name,props,path,dedupe,created_at) VALUES(?,?,NULL,?,?,NULL,?,?)').bind(crypto.randomUUID(),user,name,JSON.stringify({...props,backfilled:true}),'backfill:'+dedupe,at))};
 const learners:any[]=(await db().prepare('SELECT user_id,data,updated_at FROM learners').all()).results||[];
 for(const l of learners){let st:any;try{st=JSON.parse(l.data||'{}')}catch{continue}
  const plans=Array.isArray(st.plans)?st.plans:st.programme?[st.programme]:[];
  for(const p of plans)add(l.user_id,'plan_created',Date.parse(p.createdAt),{courseId:p.courseId,level:p.level,pathway:p.primaryPathway},'plan:'+(p.id||p.createdAt));
  for(const x of st.submissions||[])if(x.handIn&&String(x.key).startsWith('video-'))add(l.user_id,'handin',Date.parse(x.createdAt),{module:x.key},'handin:'+x.id);
  for(const [k,v] of Object.entries(st.progress||{}) as [string,any][])if(k.startsWith('video-')&&v?.done)add(l.user_id,'module_done',Date.parse(v.at),{module:k},'module:'+l.user_id+':'+k);
  add(l.user_id,'visit',Number(l.updated_at),{},'visit:'+l.user_id+':'+new Date(Number(l.updated_at)).toISOString().slice(0,10))}
 const reviews:any[]=(await db().prepare("SELECT id,user_id,created_at,json_extract(answer,'$.lessonKey') AS k FROM ai_jobs WHERE kind='feedback' AND status='complete' AND json_valid(answer)").all()).results||[];
 for(const r of reviews)if(String(r.k||'').startsWith('video-'))add(r.user_id,'review_ready',Number(r.created_at),{module:r.k},'review:'+r.id);
 for(let i=0;i<rows.length;i+=50)await db().batch(rows.slice(i,i+50));
 await setFlag('funnel_backfill',String(rows.length));
}
export const dynamic='force-dynamic';

// Pilot funnel for admins over the last N days: people reaching each step (a person is their account, or their
// anonymous browser id before sign-in), how many came back in a later week, and whether AI reviews were useful.
export async function GET(req:Request){try{
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 await backfillOnce();
 const days=Math.min(365,Math.max(1,Number(new URL(req.url).searchParams.get('days'))||30)),since=Date.now()-days*86400000;
 const steps=await Promise.all(funnelSteps.map(async([name,label])=>{const r:any=await db().prepare('SELECT COUNT(DISTINCT COALESCE(user_id,anon_id)) AS n FROM events WHERE name=? AND created_at>?').bind(name,since).first();return {name,label,people:Number(r?.n||0)}}));
 const visitors:any=await db().prepare("SELECT COUNT(DISTINCT user_id) AS n FROM events WHERE name='visit' AND user_id IS NOT NULL AND created_at>?").bind(since).first();
 const returned:any=await db().prepare("SELECT COUNT(*) AS n FROM (SELECT user_id FROM events WHERE name='visit' AND user_id IS NOT NULL AND created_at>? GROUP BY user_id HAVING COUNT(DISTINCT strftime('%Y-%W',created_at/1000,'unixepoch'))>=2)").bind(since).first();
 const rated:any=await db().prepare('SELECT COUNT(*) AS n,COALESCE(SUM(helpful),0) AS yes FROM review_ratings WHERE created_at>?').bind(since).first();
 const comments:any[]=(await db().prepare("SELECT r.helpful,r.comment,r.created_at,json_extract(j.answer,'$.lessonKey') AS module,l.public_id FROM review_ratings r JOIN ai_jobs j ON j.id=r.job_id LEFT JOIN learners l ON l.user_id=r.user_id WHERE r.comment<>'' AND r.created_at>? ORDER BY r.created_at DESC LIMIT 15").bind(since).all()).results||[];
 const filled:any=await db().prepare("SELECT value FROM app_flags WHERE key='funnel_backfill'").first();
 return Response.json({days,backfilled:Number(filled?.value||0),steps,returning:{signedIn:Number(visitors?.n||0),cameBack:Number(returned?.n||0)},reviews:{rated:Number(rated?.n||0),useful:Number(rated?.yes||0),comments}},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
