import {db,identity,checkOrigin,fail,errorResponse} from '../../../service';
import {isAdmin} from '../health/route';
import {ticketStatuses,replyMax} from '../../../support-shared';
import {ticketReplyAlert,ticketResolvedAlert} from '../../../email';
export const dynamic='force-dynamic';
const noStore={headers:{'Cache-Control':'no-store'}};

// Support queue for admins. q finds tickets by ticket number (T-1001), User ID (FP-10001), Course ID
// (VID-B-1001) or email; status narrows to open, in_progress or resolved.
export async function GET(req:Request){try{
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const p=new URL(req.url).searchParams,status=p.get('status')||'',q=String(p.get('q')||'').trim();
 const where:string[]=[],args:any[]=[];
 if(ticketStatuses.some(s=>s[0]===status)){where.push('t.status=?');args.push(status)}
 if(q){const k=q.toUpperCase();
  if(/^T-\d+$/.test(k)){where.push('t.id=?');args.push(k)}
  else if(/^FP-\d+$/.test(k)){where.push('t.public_user_id=?');args.push(k)}
  else if(/^[A-Z]+-[A-Z]-\d+$/.test(k)){where.push('t.course_id=?');args.push(k)}
  else{where.push('l.email LIKE ?');args.push('%'+q.toLowerCase()+'%')}}
 const rows:any[]=(await db().prepare(`SELECT t.*,l.email FROM support_tickets t LEFT JOIN learners l ON l.user_id=t.user_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY t.status='resolved',t.created_at DESC LIMIT 100`).bind(...args).all()).results||[];
 const counts:any[]=(await db().prepare('SELECT status,COUNT(*) AS n FROM support_tickets GROUP BY status').all()).results||[];
 // Each ticket's conversation after the first message, oldest first.
 const ids=rows.map(r=>r.id),msgs:any[]=ids.length?(await db().prepare(`SELECT id,ticket_id,author,author_email,body,created_at FROM ticket_messages WHERE ticket_id IN (${ids.map(()=>'?').join(',')}) ORDER BY created_at`).bind(...ids).all()).results||[]:[];
 return Response.json({tickets:rows.map(r=>({...r,context:JSON.parse(r.context||'{}'),messages:msgs.filter(m=>m.ticket_id===r.id)})),counts:Object.fromEntries(counts.map(c=>[c.status,c.n]))},noStore);
}catch(e){return errorResponse(e)}}

// Act on a ticket. Each action sets the status, so support never has to remember to:
//  reply   → adds support's message and emails the learner; the ticket goes to in progress (resolved with resolve:true)
//  resolve → resolved without a reply; the learner gets a short email
//  reopen  → back to open
//  note    → the staff-only note; status unchanged
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const b:any=await req.json(),id=String(b.id||''),now=Date.now();
 const t:any=await db().prepare('SELECT id,status FROM support_tickets WHERE id=?').bind(id).first();
 if(!t)return fail('That ticket no longer exists.',404);
 const setStatus=(status:string)=>db().prepare('UPDATE support_tickets SET status=?,updated_at=? WHERE id=?').bind(status,now,id).run();
 if(b.action==='reply'){
  const body=String(b.body||'').trim();if(!body)return fail('Write a reply first.');if(body.length>replyMax)return fail(`Please keep it under ${replyMax} characters.`);
  const messageId=crypto.randomUUID(),status=b.resolve?'resolved':'in_progress';
  await db().batch([db().prepare("INSERT INTO ticket_messages(id,ticket_id,author,author_email,body,created_at) VALUES(?,?,'staff',?,?,?)").bind(messageId,id,u.email||null,body,now),
   db().prepare('UPDATE support_tickets SET status=?,updated_at=? WHERE id=?').bind(status,now,id)]);
  await ticketReplyAlert(id,messageId);
  return Response.json({ok:true,status},noStore);
 }
 if(b.action==='resolve'){if(t.status!=='resolved'){await setStatus('resolved');await ticketResolvedAlert(id,now)}return Response.json({ok:true,status:'resolved'},noStore)}
 if(b.action==='reopen'){await setStatus('open');return Response.json({ok:true,status:'open'},noStore)}
 if(b.action==='note'){await db().prepare('UPDATE support_tickets SET note=? WHERE id=?').bind(String(b.note||'').trim().slice(0,2000),id).run();return Response.json({ok:true},noStore)}
 return fail('Choose what to do with the ticket.');
}catch(e){return errorResponse(e)}}
