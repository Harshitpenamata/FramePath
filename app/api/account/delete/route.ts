import {db,bucket,identity,checkOrigin,fail,errorResponse} from '../../../service';
export const dynamic='force-dynamic';
// Deletes the learner's account and everything in it: uploaded files, plans and progress, hand-ins, AI reviews,
// portfolio (with its likes and comments), their own comments, likes, reports and review flags, support tickets and
// their messages, usage-tracker events, review ratings, and the email log and opt-out. Can't be undone.
export async function POST(req:Request){try{
 checkOrigin(req);const u=await identity();const b:any=await req.json();
 if(b.confirm!=='DELETE')return fail('Type DELETE to confirm.');
 const id=u.userId;
 // Files first: storage, in batches.
 const files:string[]=((await db().prepare('SELECT id FROM uploads WHERE user_id=?').bind(id).all()).results||[]).map((r:any)=>r.id);
 for(let i=0;i<files.length;i+=500)await bucket().delete(files.slice(i,i+500));
 const mine="(SELECT token FROM portfolios WHERE user_id=?)",theirComments="(SELECT id FROM portfolio_comments WHERE user_id=? OR token IN "+mine+")";
 await db().batch([
  db().prepare('DELETE FROM comment_reports WHERE user_id=? OR comment_id IN '+theirComments).bind(id,id,id),
  db().prepare('DELETE FROM portfolio_comments WHERE user_id=? OR token IN '+mine).bind(id,id),
  db().prepare('DELETE FROM portfolio_likes WHERE user_id=? OR token IN '+mine).bind(id,id),
  db().prepare('DELETE FROM portfolios WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM review_flags WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM wa_messages WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM ai_jobs WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM reflection_attempts WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM goal_logs WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM onboarding_attempts WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM uploads WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM support_tickets WHERE user_id=?)').bind(id),
  db().prepare('DELETE FROM support_tickets WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM events WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM review_ratings WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM email_log WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM email_optouts WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM course_ids WHERE user_id=?').bind(id),
  db().prepare('DELETE FROM learners WHERE user_id=?').bind(id),
 ]);
 return Response.json({deleted:true,files:files.length},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
