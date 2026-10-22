import {db,identity,checkOrigin,fail,errorResponse} from '../../../service';
import {isAdmin} from '../health/route';
import {ticketStatuses} from '../../../support-shared';
import {ticketReplyAlert} from '../../../email';
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
 return Response.json({tickets:rows.map(r=>({...r,context:JSON.parse(r.context||'{}')})),counts:Object.fromEntries(counts.map(c=>[c.status,c.n]))},noStore);
}catch(e){return errorResponse(e)}}

// Update a ticket: status, a reply the learner sees in My account, and a staff-only note.
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const b:any=await req.json();if(!ticketStatuses.some(s=>s[0]===b.status))return fail('Choose a status.');
 const reply=String(b.reply||'').trim().slice(0,2000),note=String(b.note||'').trim().slice(0,2000);
 const r=await db().prepare('UPDATE support_tickets SET status=?,reply=?,note=?,updated_at=? WHERE id=?').bind(b.status,reply,note,Date.now(),String(b.id||'')).run();
 if(!r.meta.changes)return fail('That ticket no longer exists.',404);
 // Emails the learner once per distinct reply text.
 if(reply)await ticketReplyAlert(String(b.id));
 return Response.json({ok:true},noStore);
}catch(e){return errorResponse(e)}}
