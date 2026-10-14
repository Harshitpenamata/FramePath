import {db,identity,checkOrigin,safeText,fail,errorResponse} from '../../../service';
export const dynamic='force-dynamic';
// "This feedback seems wrong": one flag per review. An admin looks at it on /admin.
export const flagReasons:Record<string,string>={
 missed:'It says something is missing, but it’s in my work',
 video:'It describes the video or sound wrongly',
 score:'The score doesn’t match the feedback',
 task:'It reviewed it against the wrong task',
 other:'Something else',
};
export async function POST(req:Request){try{
 checkOrigin(req);const u=await identity();const b:any=await req.json();
 if(!flagReasons[b.reason])return fail('Choose what seems wrong.');
 const details=safeText(b.details||'',1000);
 const job:any=await db().prepare("SELECT id,answer FROM ai_jobs WHERE id=? AND user_id=? AND kind='feedback' AND status='complete'").bind(String(b.reviewId||''),u.userId).first();
 if(!job)return fail('That review is unavailable.',404);
 const key=JSON.parse(job.answer).lessonKey||'';
 const r=await db().prepare("INSERT OR IGNORE INTO review_flags(id,job_id,user_id,lesson_key,reason,details,status,note,created_at) VALUES(?,?,?,?,?,?,'open','',?)").bind(crypto.randomUUID(),job.id,u.userId,key,b.reason,details,Date.now()).run();
 if(!r.meta.changes)return fail('You’ve already flagged this review.',409);
 return Response.json({flag:{reason:b.reason,status:'open',note:''}},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
