import {db} from './service';

// IDs for support and tracking. Each comes from a counter in the database, so it is unique and never reused:
//   User ID    FP-10001    one per account, given the first time the learner's data loads
//   Course ID  VID-B-1001  one per plan, given when the plan is made; the letter is the level it started at
//   Ticket     T-1001      one per support ticket
// Course IDs never change: not when the plan is renamed, moves up a level or is deleted.
const firstNumber:Record<string,number>={user:10001,course:1001,ticket:1001};
export async function nextNumber(name:'user'|'course'|'ticket'){
 const row:any=await db().prepare('INSERT INTO id_counters(name,value) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET value=value+1 RETURNING value').bind(name,firstNumber[name]).first();
 return Number(row.value);
}

export const courseCodes:Record<string,string>={videography:'VID'};
export const levelLetter=(level:string)=>({beginner:'B',intermediate:'I',advanced:'A'} as Record<string,string>)[level]||'X';

// The learner's User ID, made once. A second request racing this one keeps whichever ID was saved first.
export async function ensureUserId(userId:string):Promise<string>{
 const row:any=await db().prepare('SELECT public_id FROM learners WHERE user_id=?').bind(userId).first();
 if(row?.public_id)return row.public_id;
 const id='FP-'+await nextNumber('user');
 await db().prepare('UPDATE learners SET public_id=? WHERE user_id=? AND public_id IS NULL').bind(id,userId).run();
 const saved:any=await db().prepare('SELECT public_id FROM learners WHERE user_id=?').bind(userId).first();
 return saved?.public_id||id;
}

// Gives a plan its Course ID if it has none yet, and records which learner and plan it belongs to.
// Returns true when the plan changed (so the caller saves it).
export async function ensureCourseId(userId:string,plan:any):Promise<boolean>{
 if(plan.courseId)return false;
 const known:any=await db().prepare('SELECT course_id FROM course_ids WHERE user_id=? AND plan_id=?').bind(userId,plan.id).first();
 if(known?.course_id){plan.courseId=known.course_id;return true}
 const code=`${courseCodes[plan.course]||'FP'}-${levelLetter(plan.level)}-${await nextNumber('course')}`;
 await db().prepare('INSERT INTO course_ids(course_id,user_id,plan_id,created_at) VALUES(?,?,?,?)').bind(code,userId,plan.id,Date.now()).run();
 plan.courseId=code;return true;
}

// Marks a deleted plan's Course ID as retired; the ID is never handed out again.
export async function retireCourseId(userId:string,planId:string){
 await db().prepare('UPDATE course_ids SET deleted_at=? WHERE user_id=? AND plan_id=? AND deleted_at IS NULL').bind(Date.now(),userId,planId).run();
}
