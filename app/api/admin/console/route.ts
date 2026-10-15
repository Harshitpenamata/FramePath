import {db,identity,checkOrigin,fail,errorResponse} from '../../../service';
import {isAdmin} from '../health/route';
import {plansOf,planTitle} from '../../../videography/programme';
import {waLive} from '../../../whatsapp';
export const dynamic='force-dynamic';
const noStore={headers:{'Cache-Control':'no-store'}};

// Admin console: reported comments, learner lookup by email, and storage. Only for emails in ADMIN_EMAILS.
export async function GET(req:Request){try{
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const q=new URL(req.url).searchParams,section=q.get('section');
 if(section==='comments'){
  const rows:any[]=(await db().prepare("SELECT c.id,c.token,c.piece_id,c.body,c.author,c.created_at,a.email AS author_email,o.email AS owner_email,(SELECT COUNT(*) FROM comment_reports r WHERE r.comment_id=c.id) AS reports,(SELECT GROUP_CONCAT(r.reason,' | ') FROM comment_reports r WHERE r.comment_id=c.id) AS reasons FROM portfolio_comments c LEFT JOIN learners a ON a.user_id=c.user_id LEFT JOIN portfolios p ON p.token=c.token LEFT JOIN learners o ON o.user_id=p.user_id WHERE c.status='reported' ORDER BY c.created_at DESC LIMIT 100").all()).results||[];
  return Response.json({comments:rows},noStore);
 }
 if(section==='users'){
  const email=String(q.get('email')||'').trim().toLowerCase();if(email.length<3)return fail('Type at least 3 letters of an email.');
  const rows:any[]=(await db().prepare('SELECT user_id,email,data,updated_at FROM learners WHERE email LIKE ? ORDER BY updated_at DESC LIMIT 10').bind('%'+email+'%').all()).results||[];
  const users=await Promise.all(rows.map(async r=>{const s=JSON.parse(r.data||'{}');
   const [files,reviews,comments]=await Promise.all([
    db().prepare('SELECT COUNT(*) AS n,COALESCE(SUM(size),0) AS bytes FROM uploads WHERE user_id=?').bind(r.user_id).first(),
    db().prepare("SELECT COUNT(*) AS n FROM ai_jobs WHERE user_id=? AND kind='feedback' AND status='complete'").bind(r.user_id).first(),
    db().prepare("SELECT COUNT(*) AS n FROM portfolio_comments WHERE user_id=? AND status='visible'").bind(r.user_id).first()]);
   return {email:r.email,userId:r.user_id,lastActive:r.updated_at,name:s.profile?.name||'',
    plans:plansOf(s).map((p:any)=>({title:planTitle(p),level:p.level,mode:p.mode,start:p.schedule?.startDate,open:p.id===s.programme?.id})),
    paid:{selfPaced:!!s.membership&&new Date(s.membership.expiresAt).getTime()>Date.now(),mentor:['paid','active'].includes(s.craft?.status)},
    handIns:(s.submissions||[]).filter((x:any)=>x.handIn).map((x:any)=>({id:x.id,key:x.key,createdAt:x.createdAt,files:(x.uploads||[]).map((f:any)=>({id:f.id,name:f.name,type:f.type})),url:x.url||''})),
    reviews:(reviews as any)?.n||0,comments:(comments as any)?.n||0,files:(files as any)?.n||0,bytes:(files as any)?.bytes||0,
    portfolio:s.portfolio?.token?{token:s.portfolio.token,visibility:s.portfolio.visibility||'unlisted'}:null}}));
  return Response.json({users},noStore);
 }
 if(section==='storage'){
  const [total,top]=await Promise.all([db().prepare('SELECT COUNT(*) AS files,COALESCE(SUM(size),0) AS bytes,COUNT(DISTINCT user_id) AS users FROM uploads').first(),
   db().prepare('SELECT u.user_id,l.email,COUNT(*) AS files,SUM(u.size) AS bytes FROM uploads u LEFT JOIN learners l ON l.user_id=u.user_id GROUP BY u.user_id ORDER BY bytes DESC LIMIT 10').all()]);
  return Response.json({total,top:top.results||[]},noStore);
 }
 if(section==='whatsapp'){
  const [opted,byStatus,recent,cost]=await Promise.all([
   db().prepare("SELECT COUNT(*) AS n FROM learners WHERE json_extract(data,'$.whatsapp.optIn')=1").first(),
   db().prepare("SELECT template,status,COUNT(*) AS n FROM wa_messages WHERE created_at>? GROUP BY template,status ORDER BY template").bind(Date.now()-7*86400000).all(),
   db().prepare("SELECT w.template,w.status,w.body,w.error,w.created_at,w.phone,l.email FROM wa_messages w LEFT JOIN learners l ON l.user_id=w.user_id ORDER BY w.created_at DESC LIMIT 25").all(),
   db().prepare("SELECT COALESCE(SUM(cost_paise),0) AS paise FROM wa_messages WHERE created_at>?").bind(Date.now()-30*86400000).first()]);
  return Response.json({live:waLive(),optedIn:(opted as any)?.n||0,week:byStatus.results||[],recent:recent.results||[],costInr30d:((cost as any)?.paise||0)/100},noStore);
 }
 return fail('Unknown section.');
}catch(e){return errorResponse(e)}}

// Reported comments: restore (shown again) or remove.
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const b:any=await req.json();if(!['restore','remove'].includes(b.action))return fail('Choose restore or remove.');
 const r=await db().prepare("UPDATE portfolio_comments SET status=? WHERE id=? AND status='reported'").bind(b.action==='restore'?'visible':'removed',String(b.id||'')).run();
 if(!r.meta.changes)return fail('That comment is no longer waiting.',404);
 return Response.json({ok:true},noStore);
}catch(e){return errorResponse(e)}}
