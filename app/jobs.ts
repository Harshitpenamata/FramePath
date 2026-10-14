import {db} from './service';
import {aiStatus,setFlag} from './ai-budget';
import {runVideoChecks} from './video-health';
import {runReview} from './api/review/route';
import {screenComment} from './api/community/route';

// The hourly job (Cloudflare cron, see build/sites-worker.ts): checks a batch of lesson videos, then, if AI is
// available again, runs reviews and checks comments that waited in the queue. Small batches keep each run short.
export async function runScheduled(){
 const out:any={videos:await runVideoChecks(30),reviews:0,comments:0,ai:await aiStatus()};
 try{return await aiWork(out)}finally{
  // The admin page shows the last run and warns when the job has stopped running.
  await setFlag('job_last_run',JSON.stringify({at:Date.now(),videos:out.videos,reviews:out.reviews,comments:out.comments,aiPaused:!out.ai.ok})).catch(()=>{});
 }
}
async function aiWork(out:any){
 if(!out.ai.ok)return out;
 const jobs:any[]=(await db().prepare("SELECT id,user_id,answer FROM ai_jobs WHERE status='queued' ORDER BY created_at LIMIT 2").all()).results||[];
 for(const j of jobs){
  try{const res=await runReview({userId:j.user_id},{...JSON.parse(j.answer).request,requestId:j.id},true);if(res.status===202)break;out.reviews++}
  catch(e:any){console.error('Queued review failed',j.id,String(e?.message||e).slice(0,200))}
  if(!(await aiStatus()).ok)return out;
 }
 const comments:any[]=(await db().prepare("SELECT id,body FROM portfolio_comments WHERE status='pending' ORDER BY created_at LIMIT 10").all()).results||[];
 for(const c of comments){
  const check=await screenComment(c.body);if(check.wait)break;
  // Comments that fail the check are kept as 'removed', like deleted ones.
  await db().prepare('UPDATE portfolio_comments SET status=? WHERE id=?').bind(check.allowed?'visible':'removed',c.id).run();out.comments++;
 }
 return out;
}
