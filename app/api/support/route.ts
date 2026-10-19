import {db,identity,readState,checkOrigin,fail,errorResponse} from '../../service';
import {ensureUserId,ensureCourseId,nextNumber} from '../../ids';
import {plansOf,planTitle,parseVideoKey,moduleLesson,projectLabel,courseNames} from '../../videography/programme';
import {ticketCategories,ticketsPerDay,messageMin,messageMax} from '../../support-shared';
export const dynamic='force-dynamic';
const noStore={headers:{'Cache-Control':'no-store'}};

// The learner's own tickets, newest first, with support's reply.
export async function GET(){try{
 const u:any=await identity();
 const rows:any[]=(await db().prepare('SELECT id,category,message,status,reply,course_id,plan_name,pathway,module_title,lesson,created_at,updated_at FROM support_tickets WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(u.userId).all()).results||[];
 return Response.json({tickets:rows},noStore);
}catch(e){return errorResponse(e)}}

// Raise a ticket. The learner writes what's wrong; the server adds who they are and where they were, from their
// own account (never trusting the page for it): User ID, Course ID, course, pathway, plan name, level, module, lesson.
export async function POST(req:Request){try{
 checkOrigin(req);const u:any=await identity();const b:any=await req.json();
 if(!ticketCategories.some(c=>c[0]===b.category))return fail('Choose what the problem is about.');
 const message=String(b.message||'').trim();
 if(message.length<messageMin)return fail(`Tell us a little more (at least ${messageMin} characters).`);
 if(message.length>messageMax)return fail(`Please keep it under ${messageMax} characters.`);
 const page=typeof b.page==='string'&&b.page.startsWith('/')?b.page.slice(0,200):'/';
 const recent:any=await db().prepare('SELECT COUNT(*) AS n FROM support_tickets WHERE user_id=? AND created_at>?').bind(u.userId,Date.now()-86400000).first();
 if((recent?.n||0)>=ticketsPerDay)return fail(`You’ve sent ${ticketsPerDay} requests today. We’ll get back to you on those first.`,429);
 const {state:s}=await readState(u.userId);const plans=plansOf(s);
 // Which plan: the one named, else the plan for the module's level (the open one first), else the open plan.
 const mod=typeof b.moduleKey==='string'?parseVideoKey(b.moduleKey):null;
 const plan:any=plans.find(p=>p.id===b.planId)||(mod&&(plans.find(p=>p.id===s.programme?.id&&p.level===mod.level)||plans.find(p=>p.level===mod.level)))||(b.planId||mod?null:s.programme)||null;
 if(plan&&!plan.courseId)await ensureCourseId(u.userId,plan);
 const lesson=Number.isInteger(b.lesson)&&b.lesson>0&&b.lesson<100?b.lesson:null;
 const publicId=await ensureUserId(u.userId),id='T-'+await nextNumber('ticket'),now=Date.now();
 const context={viewport:String(b.viewport||'').slice(0,20),browser:String(req.headers.get('user-agent')||'').slice(0,200),email:u.email||''};
 await db().prepare(`INSERT INTO support_tickets(id,user_id,public_user_id,course_id,plan_id,course,pathway,plan_name,level,module_key,module_title,lesson,page,category,message,status,reply,note,context,created_at,updated_at)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'open','','',?,?,?)`).bind(id,u.userId,publicId,plan?.courseId||null,plan?.id||null,plan?(courseNames[plan.course]||plan.course):null,plan?.primaryPathway||null,plan?planTitle(plan):null,
  mod?.level||plan?.level||null,mod?b.moduleKey:null,mod?`${mod.module.id} · ${moduleLesson(mod.module,projectLabel(plan)).title}`:null,lesson,page,b.category,message,JSON.stringify(context),now,now).run();
 return Response.json({ticket:{id,courseId:plan?.courseId||null,publicUserId:publicId}},noStore);
}catch(e){return errorResponse(e)}}
