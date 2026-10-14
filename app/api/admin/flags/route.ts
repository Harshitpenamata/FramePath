import {db,identity,checkOrigin,safeText,fail,errorResponse} from '../../../service';
import {isAdmin} from '../health/route';
import {flagReasons} from '../../review/flag/route';
export const dynamic='force-dynamic';
export async function GET(){try{
 const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const rows:any[]=(await db().prepare("SELECT f.*,j.answer,l.email,l.data FROM review_flags f JOIN ai_jobs j ON j.id=f.job_id LEFT JOIN learners l ON l.user_id=f.user_id ORDER BY f.status='open' DESC,f.created_at DESC LIMIT 100").all()).results||[];
 return Response.json({flags:rows.map(r=>{const a=JSON.parse(r.answer||'{}'),s=JSON.parse(r.data||'{}'),piece=(s.submissions||[]).find((x:any)=>x.id===a.submissionId);
  return {id:r.id,status:r.status,reason:flagReasons[r.reason]||r.reason,details:r.details,note:r.note,createdAt:r.created_at,resolvedAt:r.resolved_at,email:r.email||r.user_id,lessonKey:r.lesson_key,
   review:a.review,watched:a.watched||[],
   work:piece?{answer:piece.answer||'',notes:piece.notes||'',url:piece.url||'',files:(piece.uploads||[]).map((f:any)=>({id:f.id,name:f.name,type:f.type}))}:null}})},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}
// decision: 'fine' (the review stands) or 'refunded' (it was wrong: it no longer counts, so the learner can ask again).
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();if(!isAdmin(u.email))return fail('Not found.',404);
 const b:any=await req.json();if(!['fine','refunded'].includes(b.decision))return fail('Choose a decision.');
 const note=safeText(b.note||'',600);
 const r=await db().prepare("UPDATE review_flags SET status=?,note=?,resolved_at=? WHERE id=?").bind(b.decision,note,Date.now(),String(b.id||'')).run();
 if(!r.meta.changes)return fail('Flag not found.',404);
 return Response.json({ok:true});
}catch(e){return errorResponse(e)}}
