import {db,identity,checkOrigin,fail,errorResponse} from '../../../service';
import {logEvent} from '../../../events';
export const dynamic='force-dynamic';

// "Was this review useful?": one answer per review, which the learner can change, with an optional comment.
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();const b:any=await req.json();
 const id=String(b.reviewId||'');if(typeof b.helpful!=='boolean')return fail('Choose yes or no.');
 const own:any=await db().prepare("SELECT id FROM ai_jobs WHERE id=? AND user_id=? AND kind='feedback' AND status='complete'").bind(id,u.userId).first();
 if(!own)return fail('That review no longer exists.',404);
 const comment=String(b.comment||'').trim().slice(0,600);
 await db().prepare('INSERT INTO review_ratings(job_id,user_id,helpful,comment,created_at) VALUES(?,?,?,?,?) ON CONFLICT(job_id) DO UPDATE SET helpful=excluded.helpful,comment=excluded.comment,created_at=excluded.created_at').bind(id,u.userId,b.helpful?1:0,comment,Date.now()).run();
 await logEvent(u.userId,'review_rated',{review:id,helpful:b.helpful});
 return Response.json({rating:{job_id:id,helpful:b.helpful?1:0,comment}},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
