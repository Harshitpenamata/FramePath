import {db,identity,fail,errorResponse} from '../../../service';
import {isAdmin} from '../health/route';
import {funnelSteps} from '../../../events-shared';
export const dynamic='force-dynamic';

// Pilot funnel for admins over the last N days: people reaching each step (a person is their account, or their
// anonymous browser id before sign-in), how many came back in a later week, and whether AI reviews were useful.
export async function GET(req:Request){try{
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const days=Math.min(365,Math.max(1,Number(new URL(req.url).searchParams.get('days'))||30)),since=Date.now()-days*86400000;
 const steps=await Promise.all(funnelSteps.map(async([name,label])=>{const r:any=await db().prepare('SELECT COUNT(DISTINCT COALESCE(user_id,anon_id)) AS n FROM events WHERE name=? AND created_at>?').bind(name,since).first();return {name,label,people:Number(r?.n||0)}}));
 const visitors:any=await db().prepare("SELECT COUNT(DISTINCT user_id) AS n FROM events WHERE name='visit' AND user_id IS NOT NULL AND created_at>?").bind(since).first();
 const returned:any=await db().prepare("SELECT COUNT(*) AS n FROM (SELECT user_id FROM events WHERE name='visit' AND user_id IS NOT NULL AND created_at>? GROUP BY user_id HAVING COUNT(DISTINCT strftime('%Y-%W',created_at/1000,'unixepoch'))>=2)").bind(since).first();
 const rated:any=await db().prepare('SELECT COUNT(*) AS n,COALESCE(SUM(helpful),0) AS yes FROM review_ratings WHERE created_at>?').bind(since).first();
 const comments:any[]=(await db().prepare("SELECT r.helpful,r.comment,r.created_at,json_extract(j.answer,'$.lessonKey') AS module,l.public_id FROM review_ratings r JOIN ai_jobs j ON j.id=r.job_id LEFT JOIN learners l ON l.user_id=r.user_id WHERE r.comment<>'' AND r.created_at>? ORDER BY r.created_at DESC LIMIT 15").bind(since).all()).results||[];
 return Response.json({days,steps,returning:{signedIn:Number(visitors?.n||0),cameBack:Number(returned?.n||0)},reviews:{rated:Number(rated?.n||0),useful:Number(rated?.yes||0),comments}},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
