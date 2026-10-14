import {env} from 'cloudflare:workers';
import {db,identity,fail,errorResponse} from '../../../service';
import {aiStatus} from '../../../ai-budget';
import {allLessonVideos} from '../../../video-health';
export const dynamic='force-dynamic';
// Admin health: AI spend and queue, and lesson videos that need replacing. Only for emails in ADMIN_EMAILS.
export function isAdmin(email?:string){const list=String((env as any).ADMIN_EMAILS||process.env.ADMIN_EMAILS||'').toLowerCase().split(/[,\s]+/).filter(Boolean);return !!email&&list.includes(email.toLowerCase())}
export async function GET(){try{
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const [ai,days,queued,pending,statuses,job]=await Promise.all([aiStatus(),
  db().prepare("SELECT day,provider,ROUND(SUM(usd),4) AS usd,COUNT(*) AS calls FROM ai_usage WHERE created_at>? GROUP BY day,provider ORDER BY day DESC").bind(Date.now()-7*86400000).all(),
  db().prepare("SELECT COUNT(*) AS n FROM ai_jobs WHERE status='queued'").first(),
  db().prepare("SELECT COUNT(*) AS n FROM portfolio_comments WHERE status='pending'").first(),
  db().prepare("SELECT id,status,detail,fails,checked_at FROM video_status").all(),
  db().prepare("SELECT value FROM app_flags WHERE key='job_last_run'").first()]);
 const all=allLessonVideos(),rows:any[]=statuses.results||[];
 const describe=(r:any)=>{const v=all.get(r.id);return {id:r.id,status:r.status,detail:r.detail,checkedAt:r.checked_at,title:v?.video.title||'',creator:v?.video.creator||'',lessons:v?[...v.lessons]:[]}};
 const lastRun=(job as any)?.value?JSON.parse((job as any).value):null;
 return Response.json({job:{lastRun,stale:!lastRun||Date.now()-lastRun.at>2*3600000},ai,spend:days.results,queuedReviews:(queued as any)?.n||0,pendingComments:(pending as any)?.n||0,
  videos:{total:all.size,checked:rows.length,lastCheck:Math.max(0,...rows.map(r=>r.checked_at)),dead:rows.filter(r=>r.status==='dead').map(describe),noframe:rows.filter(r=>r.status==='noframe').map(describe),failingOnce:rows.filter(r=>r.status==='ok'&&r.fails>0).map(describe)}},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
