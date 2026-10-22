import {db,identity,checkOrigin,fail,errorResponse} from '../../../service';
import {repliesPerDay,replyMax} from '../../../support-shared';
import {learnerReplyAlert} from '../../../email';
export const dynamic='force-dynamic';

// The learner replies on one of their tickets. The ticket goes back to open (reopening a resolved one), and the
// admins get an email.
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();const b:any=await req.json();
 const body=String(b.body||'').trim();if(!body)return fail('Write your reply first.');if(body.length>replyMax)return fail(`Please keep it under ${replyMax} characters.`);
 const t:any=await db().prepare('SELECT id,public_user_id FROM support_tickets WHERE id=? AND user_id=?').bind(String(b.id||''),u.userId).first();
 if(!t)return fail('That request no longer exists.',404);
 const recent:any=await db().prepare("SELECT COUNT(*) AS n FROM ticket_messages m JOIN support_tickets t ON t.id=m.ticket_id WHERE t.user_id=? AND m.author='learner' AND m.created_at>?").bind(u.userId,Date.now()-86400000).first();
 if((recent?.n||0)>=repliesPerDay)return fail('You’ve sent a lot of replies today. We’ll get back to you on those first.',429);
 const messageId=crypto.randomUUID(),now=Date.now();
 await db().batch([db().prepare("INSERT INTO ticket_messages(id,ticket_id,author,author_email,body,created_at) VALUES(?,?,'learner',?,?,?)").bind(messageId,t.id,u.email||null,body,now),
  db().prepare("UPDATE support_tickets SET status='open',updated_at=? WHERE id=?").bind(now,t.id)]);
 await learnerReplyAlert({id:t.id,publicUserId:t.public_user_id,email:u.email},messageId,body);
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
