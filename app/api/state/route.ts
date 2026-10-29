import {normalisePhone} from '../../whatsapp';
import {deadVideoIds} from '../../video-health';
import {reviewDraft,completeReview} from '../../lessons/review-rules';
import {isVisualKey,visualLesson} from '../../lessons/content';
import {validateActivity,validateActivityDraft,validateReflection} from '../../lessons/activity-rules';
import {adoptReadyOnboarding} from '../../onboarding/session';
import {isScenarioProfile,isScenarioKey,scenarioPath} from '../../scenario-engine';
import {normalizeProfile} from '../../profile-validation';
import {buildPersonalPlan,isPersonalized} from '../../personalization';
import {courseKeys,isCourseKey,levels,recommendedLevel,activeLevel} from '../../selfpaced-curriculum';
import {validateReview} from '../../assignment-review';
import {partsFor,composeAnswer} from '../../videography/task-parts';
import {buildProgramme,buildTestProgramme,planName,parseVideoKey,isFreeModule,handInMissing,needsSelfCheck,levels as videoLevels,modulesFor,moduleKey,today,maxPlans,styleModuleKeys,type Level} from '../../videography/programme';
// Public portfolio data: only the pieces the learner picked to share.
// What a shared portfolio shows. File names stay private; only each file's id and type are shared, so images and videos can be shown.
function publicPortfolio(s:any){const items=s.portfolio.ids.map((x:string)=>s.submissions.find((v:any)=>v.id===x)).filter(Boolean).map((v:any)=>({id:v.id,key:v.key,moduleId:v.moduleId||'',createdAt:v.createdAt,notes:v.notes,answer:v.answer||'',url:v.url,uploadId:v.uploadId,uploadIds:v.uploadIds||[],uploads:(v.uploads||[]).map((f:any)=>({id:f.id,type:f.type})),status:v.status,total:v.total}));return JSON.stringify({title:s.portfolio.title,bio:s.portfolio.bio,name:s.profile?.name||'Framepath learner',items,simulatedReviews:true})}
// My courses: up to three plans. state.programme is the open plan and state.plans holds them all. Each plan keeps
// its own style-project hand-in (B13 / I13 / A13): opening another plan swaps that progress in and out.
function setupPlans(s:any){if(!Array.isArray(s.plans)){s.plans=s.programme?[s.programme]:[]}for(const p of s.plans)if(!p.id)p.id=crypto.randomUUID();if(s.programme&&!s.programme.id)s.programme.id=s.plans[0]?.id;delete s.styleProgress}
function openPlan(s:any,to:any){const from=s.programme;if(from?.id===to?.id)return;s.planProgress=s.planProgress||{};
 if(from){const saved:any={};for(const k of styleModuleKeys){if(s.progress[k])saved[k]=s.progress[k];delete s.progress[k]}s.planProgress[from.id]=saved}
 if(to){Object.assign(s.progress,s.planProgress[to.id]||{});delete s.planProgress[to.id]}
 s.programme=to||null}
// Keeps a published portfolio in step when a piece or file is removed.
function republish(s:any){if(!s.portfolio.token)return null;if(!s.portfolio.ids.length){const removeToken=s.portfolio.token;s.portfolio.token=null;return {removeToken}}return {token:s.portfolio.token,data:publicPortfolio(s),visibility:s.portfolio.visibility||'unlisted'}}
import {lessonsFor,lessonNeeds,lessonsStatus,requireLessonsForTask,type LessonMark} from '../../videography/lessons';
import {basicPaths,basicKeys,basicContext,curriculumVersion,journalTypes} from '../../beginner-curriculum';
import {scoreAttempt,moduleInfo,sequenceFor,assignmentRubric} from '../../learning-rules';
import {ensureUserId,ensureCourseId,retireCourseId} from '../../ids';
import {logEvent,today as dayNow} from '../../events';
import {questionsForVideos,lessonVideos} from '../../videography/lessons';
import {behindBy,catchUpStart,rhythm,schedule} from '../../videography/programme';
// Reflect question banks, loaded only when a learner tests out of a module.
const reflectBanks={beginner:()=>import('../../videography/reflect/beginner.json'),intermediate:()=>import('../../videography/reflect/intermediate.json'),advanced:()=>import('../../videography/reflect/advanced.json'),test:()=>import('../../videography/reflect/beginner.json')};
import {isAdmin} from '../admin/health/route';
import {linkProblem} from '../../handin-links';
import type {StepName} from '../../events-shared';
import {identity,readState,saveState,usage,checkOrigin,safeText,safeUrl,mentorFor,requireLesson,activeExplore,craftEnrolled,db,errorResponse} from '../../service';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const user=await identity();await adoptReadyOnboarding(req);let data=await readState(user.userId);
 // The sign-in email is kept on the learner's row so admins can find them (only written when it changes).
 await db().prepare('UPDATE learners SET email=? WHERE user_id=? AND (email IS NULL OR email<>?)').bind(user.email||null,user.userId,user.email||'').run().catch(()=>{});
 // Accounts from before plans: give the plan an id and a plan list, once.
 if(!Array.isArray(data.state.plans)){setupPlans(data.state);data={state:data.state,revision:await saveState(user.userId,data.state,data.revision)}}
 // Support IDs: the learner's User ID, and a Course ID for any plan made before Course IDs existed.
 const publicId=await ensureUserId(user.userId);let ided=false;
 await logEvent(user.userId,'visit',{},{dedupe:`visit:${user.userId}:${dayNow()}`});
 for(const p of data.state.plans||[])if(await ensureCourseId(user.userId,p))ided=true;
 const open=data.state.programme&&(data.state.plans||[]).find((p:any)=>p.id===data.state.programme.id);
 if(open&&data.state.programme.courseId!==open.courseId){data.state.programme.courseId=open.courseId;ided=true}
 // Curriculum updates can change a level's total hours (22 Oct 2026: a professional-skills module per level). Plans made
 // before keep their start date, weekly hours and days, and get new dates from the new total.
 for(const p of [...(data.state.plans||[]),data.state.programme].filter(Boolean))if(p.schedule&&p.schedule.totalHours!==rhythm[p.level as Level]?.hours){
  p.schedule=schedule(p.level,p.schedule.hoursPerWeek,p.schedule.startDate,p.schedule.daysPerWeek);ided=true}
 if(ided)data={state:data.state,revision:await saveState(user.userId,data.state,data.revision)};
 // Ticket alerts: replies the learner hasn't seen yet; for admins, how many tickets are open.
 const unseen:any=await db().prepare("SELECT COUNT(DISTINCT t.id) AS n FROM support_tickets t JOIN ticket_messages m ON m.ticket_id=t.id AND m.author='staff' WHERE t.user_id=? AND m.created_at>COALESCE(t.learner_seen_at,0)").bind(user.userId).first();
 const admin=isAdmin(user.email),openTickets:any=admin?await db().prepare("SELECT COUNT(*) AS n FROM support_tickets WHERE status='open'").first():null;
 return Response.json({...data,user:{name:user.fullName||'Learner',email:user.email,publicId,unseenReplies:Number(unseen?.n||0),...(admin?{admin:true,openTickets:Number(openTickets?.n||0)}:{})},usage:await usage(user.userId,data.state)},{headers:{'Cache-Control':'no-store'}})}catch(e){return errorResponse(e)}}
export async function POST(req:Request){try{
checkOrigin(req);const user=await identity();const raw=await req.text();if(raw.length>24000)throw new Error('This submission is too long.');const b=JSON.parse(raw);const {state:s,revision}=await readState(user.userId);if(b.revision!==revision)throw Object.assign(new Error('Your learning changed in another tab. Refresh and try again.'),{status:409});
const now=new Date().toISOString(),a=b.action,id=()=>crypto.randomUUID();let portfolioChange:any=null;let reflectionChange:any=null;
// Pilot tracker steps from this action, recorded once the change has been saved.
const steps:[StepName,Record<string,unknown>,string][]=[];
setupPlans(s);
switch(a){
case 'learning_level':{if(!s.profile)throw new Error('Complete your starting-point diagnostic first.');if(!levels.includes(b.level))throw new Error('Choose a published level.');s.profile.level=b.level;if(isPersonalized(s.profile)){s.profile.levelOverride=b.level;s.personalPlan=buildPersonalPlan(s.profile);}break;}
case 'profile':{s.profile=normalizeProfile(b.profile);s.basicPlan={...basicContext(s.profile),createdAt:now,basis:'curriculum template'};if(isPersonalized(s.profile)||isScenarioProfile(s.profile)){s.personalPlan=buildPersonalPlan(s.profile);if(s.personalPlan.notices?.some((n:any)=>n.blocking))throw new Error('Adjust the blocked format or time choice in your diagnostic before saving this route.');const first=s.personalPlan.paths.slice(0,2).map((p:any)=>p.id);if(isScenarioProfile(s.profile)&&first.length===1)first.push('need-'+s.profile.request.scenario.use_case.toLowerCase()+'-prepare');s.trialPathIds=s.trialPathIds||first;}break;}
case 'explore_activate':{if(b.terms!==true)throw new Error('Confirm the pilot terms before continuing.');if(activeExplore(s))break;const expiry=new Date();expiry.setUTCFullYear(expiry.getUTCFullYear()+1);s.membership={startsAt:now,expiresAt:expiry.toISOString(),plan:'Explore annual',price:999,simulated:true};s.receipts.unshift({id:id(),product:'Explore · one year',amount:999,date:now,simulated:true});break;}
case 'visual_session_save':
case 'visual_session_complete':{
 const key=safeText(b.key,80,1);if(!isVisualKey(key))throw new Error('Choose a published visual session.');requireLesson(s,key);
 const notes=safeText(b.notes,4000,a==='visual_session_complete'?20:0),url=safeUrl(b.url||''),uploadId=safeText(b.uploadId||'',100);let uploadType='';
 if(uploadId){const owned:any=await db().prepare('SELECT type FROM uploads WHERE id=? AND user_id=?').bind(uploadId,user.userId).first();if(!owned)throw new Error('That upload is not available in your account.');uploadType=owned.type;}
 const draftActivity=validateActivityDraft(key,b.activity);if(b.ratings&&(!Array.isArray(b.ratings)||b.ratings.length!==3||b.ratings.some((n:any)=>!Number.isInteger(n)||n< -1||n>4)))throw new Error('Check the three reflection answers.');
 s.drafts[key]={...(s.drafts[key]||{}),notes,url,uploadId,uploadType,visualActivity:draftActivity||null,visualWorkMode:b.workMode==='plan'?'plan':b.workMode==='record'?'record':s.drafts[key]?.visualWorkMode||'record',visualRatings:Array.isArray(b.ratings)?b.ratings.slice(0,3):s.drafts[key]?.visualRatings||[],visualConsent:b.consent===true,visualReview:b.review?reviewDraft(b.review):s.drafts[key]?.visualReview||null,visualCard:Math.max(0,Math.min(5,Number.isInteger(b.card)?b.card:0)),updatedAt:now};
 if(a==='visual_session_complete'){
  const activity=validateActivity(key,b.activity),reflection=b.review?completeReview(key,b.review):validateReflection(key,b.ratings);
  if(!uploadId&&!url&&b.workMode!=='plan')throw new Error('Attach your work or choose a written plan.');
  if(!uploadId&&!url&&notes.trim().length<60)throw new Error('Describe your written plan in at least 60 characters, including what remains untested.');
  if(b.consent!==true)throw new Error('Confirm that your practice is safe to save and you have permission.');
  s.visualSessions=s.visualSessions||{};const prior=s.visualSessions[key];s.visualSessions[key]={version:b.review?2:1,activity,reflection,workMode:b.workMode==='plan'?'plan':'record',consentAt:now,completedAt:prior?.completedAt||now,updatedAt:now};
  s.progress[key]={...(s.progress[key]||{}),done:true,at:s.progress[key]?.at||now,source:'completed-practice',feedbackScore:reflection.score,scoreBasis:b.review?'lesson-knowledge-check':'reflection-feedback'};
  const sub=s.submissions.find((x:any)=>x.visualSession===key);if(!sub&&s.submissions.length>=60)throw new Error('Your saved-work space is full. Export your work from My account before adding another piece.');
  const piece={id:sub?.id||id(),key,notes,url,uploadId,uploadType,createdAt:sub?.createdAt||now,updatedAt:now,status:'saved',feedback:'',scores:null,visualSession:key,practiceScore:reflection.score,practiceBasis:b.review?'lesson-knowledge-check':'reflection-feedback',correction:b.review&&'correction' in reflection?reflection.correction:'',reviewFocus:b.review?reflection.focus:null,workMode:b.workMode==='plan'?'plan':'record'};
  if(sub)s.submissions=s.submissions.map((x:any)=>x.id===sub.id?piece:x);else s.submissions.unshift(piece);
 }
 break;
}
// Age: 'adult' (18 or older) or 'guardian' (13 to 17, with a parent or guardian's agreement). Asked once, before
// the first plan. Under 13s can't use FramePath. Learners under 18 can share portfolios by link, not publicly.
// WhatsApp updates: the number, explicit opt-in, which updates, and quiet hours (India time).
case 'whatsapp_save':{const phone=normalisePhone(b.phone);if(b.optIn===true&&!phone)throw new Error('Enter your WhatsApp number with its country code, for example +91 98765 43210.');
 const pr=b.prefs||{},hour=(v:any,d:number)=>Number.isInteger(v)&&v>=0&&v<24?v:d;
 s.whatsapp={phone:phone||s.whatsapp?.phone||'',optIn:b.optIn===true,name:safeText(b.name||'',40)||String(user.fullName||'').split(' ')[0]||'',prefs:{reviews:pr.reviews!==false,deadlines:pr.deadlines!==false,weekly:pr.weekly!==false,nudges:pr.nudges!==false},quietFrom:hour(b.quietFrom,21),quietTo:hour(b.quietTo,8),at:now};break;}
case 'consent_save':{if(!['adult','guardian'].includes(b.age))throw new Error('Choose your age group.');s.consent={age:b.age,at:now};break;}
case 'programme_save':{if(['adult','guardian'].includes(b.programme?.age))s.consent={age:b.programme.age,at:now};if(!s.consent)throw new Error('Tell us your age group first.');
 if(s.plans.length>=maxPlans)throw new Error('You have '+maxPlans+' plans already. Delete one to make another.');
 const plan={...buildProgramme(b.programme,null),id:id()};await ensureCourseId(user.userId,plan);s.plans.push(plan);openPlan(s,plan);steps.push(['plan_created',{courseId:plan.courseId,level:plan.level,pathway:plan.primaryPathway},'']);break;}
// Admins only: a three-module test plan (B01, B05, B14) to walk the whole course end to end.
case 'test_plan':{if(!isAdmin(user.email))throw new Error('Only admins can start a test pathway.');
 if(s.plans.length>=maxPlans)throw new Error('You have '+maxPlans+' plans already. Delete one to make another.');
 const plan={...buildTestProgramme(s.programme?.interests||['wedding']),id:id()};await ensureCourseId(user.userId,plan);s.plans.push(plan);openPlan(s,plan);break;}
// Behind on the plan's dates: move the open plan's remaining modules forward from today (hours already done count
// as time spent). The server works the new start date out, so it may be in the past.
case 'plan_reschedule':{if(!s.programme||s.programme.id!==b.id)throw new Error('Open this plan first.');const p=s.programme;
 if(!behindBy(p,s.progress))throw new Error('Your plan is on schedule.');const start=catchUpStart(p,s.progress);
 s.programme={...buildProgramme({...p,startDate:start},{...p,schedule:{...p.schedule,startDate:start}}),id:p.id};break;}
// "Already know this?": answer every question of a module's lessons in one go. If every answer is right first time,
// those lessons count as finished (videos and questions). One try per module per day.
case 'lesson_testout':{
 const key=safeText(b.key,80,1),video=parseVideoKey(key);if(!video)throw new Error('Choose a Videography module.');
 if(!isFreeModule(key)&&!activeExplore(s)&&!craftEnrolled(s))throw new Error('This module’s practice is part of Self-paced.');
 s.testOuts=s.testOuts||{};if(s.testOuts[key]===dayNow())throw new Error('You’ve already tried this today. Work through the lessons, or try again tomorrow.');
 s.testOuts[key]=dayNow();
 const pathway=s.programme?.primaryPathway||'Documentary',bank:any=(await reflectBanks[video.level]()).default;
 const picks=b.answers&&typeof b.answers==='object'?b.answers:{};let right=true,checked=0;const passed:number[]=[];
 lessonsFor(video.module.id).forEach((_:any,i:number)=>{const qs=questionsForVideos(bank[video.module.id]?.[i]||[],lessonVideos(video.module.id,i,pathway));if(!qs.length)return;
  const mine=Array.isArray(picks[i])?picks[i]:[];qs.forEach((_q:any,n:number)=>{checked++;if(mine[n]!==0)right=false});if(right)passed.push(i)});
 if(!checked)throw new Error('This module has no questions to answer.');
 if(right){s.lessonProgress=s.lessonProgress||{};const marks=(s.lessonProgress[key]=s.lessonProgress[key]||{});
  for(const i of passed){const mark:LessonMark=(marks[i]=marks[i]||{v:[],t:false});for(const id of lessonNeeds(video.module.id,i,pathway))if(!mark.v.includes(id))mark.v.push(id);mark.t=true}
  steps.push(['test_out',{module:key,lessons:passed.length},''])}
 s.lastTestOut={key,passed:right,at:now};break;}
case 'plan_rename':{const plan=s.plans.find((x:any)=>x.id===b.id);if(!plan)throw new Error('That plan no longer exists.');const name=planName(b.name);
 for(const x of [plan,s.programme])if(x?.id===plan.id){if(name)x.name=name;else delete x.name}break;}
case 'plan_open':{const plan=s.plans.find((x:any)=>x.id===b.id);if(!plan)throw new Error('That plan no longer exists.');openPlan(s,plan);break;}
case 'programme_update':{if(!s.programme)throw new Error('Make your plan first.');const u=b.update||{};
 // Moving up a level: only to the next one, once every module of the current level is handed in. The new plan starts today.
 let level=s.programme.level,startDate=u.startDate??s.programme.schedule.startDate;
 if(u.level!==undefined&&u.level!==level){const cur=level as Level;if(u.level!==videoLevels[videoLevels.indexOf(cur)+1]||modulesFor(cur).some((_,i)=>!s.progress[moduleKey(cur,i)]))throw new Error('Finish every module in this level first.');level=u.level;startDate=today()}
 s.programme={...buildProgramme({...s.programme,level,hoursPerWeek:u.level&&u.level!==s.programme.level?undefined:u.hoursPerWeek??s.programme.schedule.hoursPerWeek,startDate,daysPerWeek:u.daysPerWeek??s.programme.schedule.daysPerWeek,mode:u.mode??s.programme.mode},s.programme),id:s.programme.id};break;}
case 'lesson_progress':{
 // Marks one lesson's video as watched, or its practice tool as solved. The task unlocks when every lesson is finished.
 const key=safeText(b.key,80,1),video=parseVideoKey(key);if(!video)throw new Error('Choose a Videography module.');
 // Lessons can be done ahead of earlier tasks, so only the plan is checked here (Free covers modules 1–2).
 if(!isFreeModule(key)&&!activeExplore(s)&&!craftEnrolled(s))throw new Error('This lesson’s practice is part of Self-paced.');
 const pathway=s.programme?.primaryPathway||'Documentary';
 const index=Number(b.index);if(!Number.isInteger(index)||index<0||index>=lessonsFor(video.module.id,pathway).length)throw new Error('That lesson doesn’t exist.');
 s.lessonProgress=s.lessonProgress||{};const marks=(s.lessonProgress[key]=s.lessonProgress[key]||{});const mark:LessonMark=(marks[index]=marks[index]||{v:[],t:false});
 if(b.video!==undefined){const id=safeText(b.video,300,1);if(!lessonNeeds(video.module.id,index,pathway).includes(id))throw new Error('That video isn’t part of this lesson.');if(!mark.v.includes(id)){mark.v.push(id);steps.push(['video_watched',{module:key,lesson:index+1},`video_watched:${user.userId}:${key}:${id}`])}}
 if(b.tool===true)mark.t=true;
 break;}
case 'video_submit':{
 // Hand in a Videography module: the work, a self-rating and two reflections. It goes straight into My Work.
 const key=safeText(b.key,80,1),video=parseVideoKey(key);if(!video)throw new Error('Choose a Videography module.');requireLesson(s,key);
 const lessons=lessonsStatus(video.module.id,s.programme?.primaryPathway||'Documentary',s.lessonProgress?.[key],requireLessonsForTask?await deadVideoIds():[]);
 if(requireLessonsForTask&&lessons.done<lessons.total)throw new Error(`Finish the lessons first: ${lessons.done} of ${lessons.total} done. Watch each video and try each practice tool.`);
 const ids:string[]=Array.isArray(b.uploadIds)?[...new Set<string>(b.uploadIds.map((x:unknown)=>safeText(x,100,1)))]:[];
 // A module whose task has parts: each text part and each file slot is checked on its own, and the text parts become the answer.
 const partList=partsFor(video.module.id),parts=partList.length&&b.parts&&typeof b.parts==='object'?{
  text:Object.fromEntries(partList.filter(x=>x.kind==='text').map(x=>[x.id,safeText(b.parts.text?.[x.id]||'',2000)])) as Record<string,string>,
  files:Object.fromEntries(partList.filter(x=>x.kind==='media').map(x=>[x.id,(Array.isArray(b.parts.files?.[x.id])?b.parts.files[x.id]:[]).map(String).filter((f:string)=>ids.includes(f)).slice(0,6)])) as Record<string,string[]>}:undefined;
 const handIn={answer:parts?safeText(composeAnswer(partList,parts),6000):safeText(b.answer||'',6000),parts,notes:safeText(b.notes||'',2000),url:safeUrl(b.url||''),uploadIds:ids,ratings:Array.isArray(b.ratings)?b.ratings:[],reflections:{well:safeText(b.reflections?.well||'',600),change:safeText(b.reflections?.change||'',600)}};
 const selfCheck=needsSelfCheck(key),missing=handInMissing(video.module,handIn,selfCheck);if(missing.length)throw new Error('Before you hand in: '+missing.join(', ')+'.');
 {const why=await linkProblem(handIn.url);if(why)throw new Error(why)}
 const uploads:any[]=[];for(const uploadId of ids){const own:any=await db().prepare('SELECT id,name,type FROM uploads WHERE id=? AND user_id=?').bind(uploadId,user.userId).first();if(!own)throw new Error('That upload is not available in your account.');uploads.push({id:own.id,name:own.name,type:own.type})}
 if(s.submissions.length>=100)throw new Error('My Work is full (100 pieces). Remove a piece you no longer need, then hand in again.');
 const self=selfCheck?scoreAttempt(key,handIn.ratings,s.profile):null,attempt=s.submissions.filter((x:any)=>x.key===key).length+1;
 s.submissions.unshift({id:id(),key,moduleId:video.module.id,...(styleModuleKeys.includes(key)&&s.programme?{pathway:s.programme.primaryPathway}:{}),handIn:true,attempt,answer:handIn.answer,...(handIn.parts?{parts:handIn.parts}:{}),notes:handIn.notes,url:handIn.url,uploads,uploadId:uploads[0]?.id||'',uploadIds:ids,selfRatings:self?handIn.ratings:null,selfScore:self?self.total:null,reflections:selfCheck?handIn.reflections:null,status:'saved',feedback:'',scores:null,createdAt:now,updatedAt:now});
 // Handing in unlocks the next module; the AI score in Reflect is feedback, not a gate.
 steps.push(['handin',{module:key},'']);if(!s.progress[key]?.done)steps.push(['module_done',{module:key},`module_done:${user.userId}:${key}`]);
 s.progress[key]={...(s.progress[key]||{}),done:true,at:s.progress[key]?.at||now,source:'hand-in',score:self?.total??null};
 delete s.drafts[key];
 break;}
// Reflect, after the AI review: what went well and what to change next time, saved on that hand-in (optional).
case 'video_reflect':{
 const piece=s.submissions.find((x:any)=>x.id===b.id&&x.handIn);if(!piece)throw new Error('That piece is no longer in My Work.');
 piece.reflections={well:safeText(b.well||'',600),change:safeText(b.change||'',600)};piece.updatedAt=now;break;}
case 'submission_remove':{
 const piece=s.submissions.find((x:any)=>x.id===b.id);if(!piece)throw new Error('That piece is no longer in My Work.');
 s.submissions=s.submissions.filter((x:any)=>x.id!==piece.id);s.portfolio.ids=s.portfolio.ids.filter((x:string)=>x!==piece.id);
 portfolioChange=republish(s);break;}
case 'submission_file_remove':{
 const piece=s.submissions.find((x:any)=>x.id===b.id);if(!piece||!(piece.uploads||[]).some((f:any)=>f.id===b.uploadId))throw new Error('That file is no longer in this piece.');
 piece.uploads=piece.uploads.filter((f:any)=>f.id!==b.uploadId);piece.uploadIds=piece.uploads.map((f:any)=>f.id);piece.uploadId=piece.uploadIds[0]||'';piece.updatedAt=now;
 portfolioChange=republish(s);break;}
case 'attach':{const key=safeText(b.key,80,1);requireLesson(s,key);const uploadId=b.uploadId?safeText(b.uploadId,100):'';let uploadType='';if(uploadId){const owned:any=await db().prepare('SELECT type FROM uploads WHERE id=? AND user_id=?').bind(uploadId,user.userId).first();if(!owned)throw new Error('This upload is not available in your account.');uploadType=owned.type}s.drafts[key]={...(s.drafts[key]||{}),uploadId,uploadType,updatedAt:now};break;}
case 'assignment_save':{const key=safeText(b.key,80,1);requireLesson(s,key);const notes=safeText(b.notes,4000);const uploadId=safeText(b.uploadId||'',100);let uploadType='';if(uploadId){const own:any=await db().prepare('SELECT type FROM uploads WHERE id=? AND user_id=?').bind(uploadId,user.userId).first();if(!own)throw new Error('That upload is not available in your account.');uploadType=own.type}s.drafts[key]={...(s.drafts[key]||{}),notes,url:safeUrl(b.url||''),uploadId,uploadType,updatedAt:now};break;}
case 'lesson_save':{const key=safeText(b.key,80,1);const info=requireLesson(s,key);const checks=Array.isArray(b.checks)?b.checks:[];if(checks.length!==info.lesson.checks.length||checks.some((x:any)=>typeof x!=='boolean'))throw new Error('Check your lesson checklist.');const notes=safeText(b.notes,4000);s.drafts[key]={...(s.drafts[key]||{}),notes,checks,updatedAt:now};if(b.complete){if(!s.progress[key])throw new Error('Complete the scored Reflect checkpoint to unlock the next module.');}else if(b.undo){if(isCourseKey(key)||isVisualKey(key))throw new Error('An earned course pass stays available. You can record another attempt.');delete s.progress[key]}break;}
case 'ai_review_accept':
case 'practice_assess':{
 let acceptedReview:any=null;
 if(a==='ai_review_accept'){
  const job:any=await db().prepare("SELECT id,answer FROM ai_jobs WHERE id=? AND user_id=? AND status='complete' AND kind='feedback'").bind(safeText(b.reviewId,100,12),user.userId).first();
  if(!job)throw new Error('That review is not available in your account.');
  const saved=JSON.parse(job.answer);if(saved.type!=='assignment-review-v1')throw new Error('Choose an assignment review.');
  if(saved.rubricSignature&&saved.rubricSignature!==JSON.stringify(assignmentRubric(saved.lessonKey,s.profile)))throw new Error('Your assignment criteria changed. Request a fresh review before saving it to progress.');acceptedReview=validateReview(saved.review,saved.lessonKey,s.profile);if(acceptedReview.total===null)throw new Error('This review needs more evidence before it can be scored.');
  const applied=await db().prepare("SELECT id FROM reflection_attempts WHERE user_id=? AND json_extract(data,'$.reviewId')=? LIMIT 1").bind(user.userId,job.id).first();if(applied)throw new Error('This review has already been saved to your progress.');
  b.key=saved.lessonKey;b.notes=saved.notes;b.uploadId=saved.uploadId;b.url=s.drafts?.[saved.lessonKey]?.url||'';b.ratings=acceptedReview.ratings;b.reviewId=job.id;
 }

 const key=safeText(b.key,80,1);const info=requireLesson(s,key);const notes=safeText(b.notes,4000,20);const url=safeUrl(b.url||'');const uploadId=b.uploadId?safeText(b.uploadId,100):'';let uploadType='';
 if(uploadId){const owned:any=await db().prepare('SELECT id,type FROM uploads WHERE id=? AND user_id=?').bind(uploadId,user.userId).first();if(!owned)throw new Error('This upload is not available in your account.');uploadType=owned.type}
 if(!isCourseKey(key)&&!isScenarioKey(key)&&info.phase!=='pre'&&!url&&!uploadId)throw new Error('Add a still, short video or viewing link from your tryout before scoring it.');
 const result=scoreAttempt(key,b.ratings,s.profile);s.assessments=s.assessments||{};const previous=s.assessments[key];const attempt={id:id(),key,notes,url,uploadId,uploadType,...result,basis:acceptedReview?'ai-first-pass':'self-check',source:acceptedReview?'ai-review':'self-check',reviewId:acceptedReview?b.reviewId:null,aiFeedback:acceptedReview,at:now};
 if(isCourseKey(key)||isScenarioKey(key))reflectionChange=attempt;const history=[attempt,...(previous?.history||[])].slice(0,5);s.assessments[key]={...attempt,attemptCount:(previous?.attemptCount||0)+1,bestScore:Math.max(previous?.bestScore||0,result.total),history};
 s.drafts[key]={...(s.drafts[key]||{}),notes,checks:result.ratings.map(v=>v>=3),ratings:result.ratings,url,uploadId,uploadType,updatedAt:now};
 if(result.passed&&!isVisualKey(key))s.progress[key]={done:true,at:now,source:acceptedReview?'ai-review':'practice-checkpoint',score:result.total};
 if(result.passed&&((isCourseKey(key)&&info.index===4)||(isScenarioKey(key)&&info.index===scenarioPath(info.pathId,s.profile)!.lessons.length-1))){const existing=s.submissions.find((v:any)=>v.weeklyPath===info.pathId);const weekly={id:existing?.id||id(),key,notes,url,uploadId,createdAt:now,status:'saved',feedback:'',scores:null,practiceScore:result.total,practiceBasis:acceptedReview?'ai-review':'self-check',weeklyPath:info.pathId,sessionKeys:isScenarioKey(key)?scenarioPath(info.pathId,s.profile)!.keys:courseKeys.filter(k=>k.startsWith(info.pathId+'-'))};if(existing)s.submissions=s.submissions.map((v:any)=>v.id===existing.id?weekly:v);else s.submissions.unshift(weekly);if(basicKeys.every(k=>s.progress[k]))s.basicCompletedAt=s.basicCompletedAt||now;}
 if(b.submit===true){if(s.submissions.length>=60)throw new Error('This pilot supports up to 60 saved submissions.');s.submissions.unshift({id:id(),key,notes,url,uploadId,createdAt:now,status:info.craft?'awaiting_review':'saved',feedback:'',scores:null,practiceScore:result.total,practiceBasis:acceptedReview?'ai-review':'self-check'})}
 break;
}
case 'journal_save':{const kind=safeText(b.kind,40,1);if(!journalTypes.some(j=>j.id===kind))throw new Error('Choose a learning journal.');s.journals=s.journals||{};s.journals[kind]={text:safeText(b.text,16000),updatedAt:now};break;}
case 'basic_mentor_review':{if(!basicKeys.every(k=>s.progress[k]))throw new Error('Complete the beginner capstone first.');const mentor=mentorFor(b.mentorId);const scores=b.scores;if(!Array.isArray(scores)||scores.length!==6||scores.some((x:any)=>!Number.isInteger(x)||x<0||x>4))throw new Error('Rate all six criteria from 0 to 4.');const total=scores.reduce((n:number,v:number,i:number)=>n+v/4*[25,20,15,20,10,10][i],0);s.basicMentorReview={mentorId:mentor.id,scores,total,approved:total>=70&&scores.every((x:number)=>x>=2),feedback:safeText(b.feedback,4000,20),at:now,simulated:true};break;}
case 'mentor_request':{if(!s.profile)throw new Error('Complete your diagnostic first.');if(b.consent!==true)throw new Error('Consent is needed to share your diagnostic with the selected mentor.');if(s.craft&&!['declined','expired'].includes(s.craft.status))throw new Error('You already have a mentor request or an active Craft journey.');const m=mentorFor(b.mentorId);if(!m.slots.includes(b.slot))throw new Error('Choose an available call preference.');s.craft={mentorId:m.id,slot:b.slot,status:'requested',requestedAt:now,consentAt:now,plan:'',planApproved:false};break;}
case 'mentor_decision':{if(s.craft?.status!=='requested')throw new Error('There is no pending mentor request.');if(b.accept===true){s.craft.status='accepted';s.craft.holdUntil=new Date(Date.now()+48*3600000).toISOString()}else{s.craft.status='declined'}break;}
case 'craft_activate':{if(s.craft?.status!=='accepted')throw new Error('The mentor must accept before checkout.');if(new Date(s.craft.holdUntil).getTime()<=Date.now())throw new Error('Your mentor reservation has expired. Choose a mentor again.');if(b.terms!==true)throw new Error('Confirm the pilot terms.');s.craft.status='paid';s.craft.paidAt=now;s.craft.endsAt=new Date(Date.now()+84*86400000).toISOString();s.receipts.unshift({id:id(),product:'Craft · Beginner Videography',amount:30000,date:now,simulated:true});break;}
case 'mentor_cancel':{if(!s.craft||craftEnrolled(s))throw new Error('An enrolled course cannot be cancelled from this demo control.');s.craft=null;break;}
case 'craft_plan':{if(!craftEnrolled(s))throw new Error('Complete Craft checkout first.');s.craft.plan=safeText(b.plan,10000,80);s.craft.planApproved=false;s.craft.status='paid';break;}
case 'mentor_approve_plan':{if(s.craft?.status!=='paid'||s.craft.plan.length<80)throw new Error('Prepare the learner pathway first.');s.craft.planApproved=true;s.craft.approvedAt=now;s.craft.status='active';break;}
case 'submit':{const key=safeText(b.key,80,1);requireLesson(s,key);const notes=safeText(b.notes,4000,20);const url=safeUrl(b.url||'');const uploadId=b.uploadId?safeText(b.uploadId,100):'';if(uploadId){const owned=await db().prepare('SELECT id FROM uploads WHERE id=? AND user_id=?').bind(uploadId,user.userId).first();if(!owned)throw new Error('This upload is not available in your account.')}if(s.submissions.length>=60)throw new Error('This pilot supports up to 60 saved submissions.');s.submissions.unshift({id:id(),key,notes,url,uploadId,createdAt:now,status:key.startsWith('craft-')?'awaiting_review':'saved',feedback:'',scores:null});break;}
case 'mentor_review':{if(s.craft?.status!=='active')throw new Error('Activate your Craft journey first.');const sub=s.submissions.find((x:any)=>x.id===b.id&&x.key.startsWith('craft-'));if(!sub)throw new Error('That Craft submission was not found.');const scores=b.scores;if(!Array.isArray(scores)||scores.length!==6||scores.some((x:any)=>!Number.isInteger(x)||x<0||x>4))throw new Error('Score every criterion from 0 to 4.');sub.feedback=safeText(b.feedback,4000,20);sub.scores=scores;sub.total=Math.round(scores.reduce((n:number,v:number,i:number)=>n+v/4*[25,20,15,20,10,10][i],0));sub.status=b.approve===true?'approved':'revision_requested';if(sub.status==='approved'&&(sub.total<70||scores.some((x:number)=>x<2)))throw new Error('Approval requires at least 70/100 and every criterion at 2 or higher.');sub.reviewedAt=now;sub.reviewedBy=s.craft.mentorId;break;}
case 'message':{if(!craftEnrolled(s))throw new Error('Enrol in Craft to use the mentor workspace.');s.messages.push({id:id(),text:safeText(b.text,2000,1),role:b.role==='mentor'?'mentor':'learner',at:now});s.messages=s.messages.slice(-100);break;}
case 'checkin':{if(s.craft?.status!=='active')throw new Error('Your Craft pathway is not active yet.');s.checkins.unshift({id:id(),text:safeText(b.text,1500,5),at:now});s.checkins=s.checkins.slice(0,100);break;}
case 'book_call':{if(s.craft?.status!=='active')throw new Error('Activate your Craft pathway first.');const date=safeText(b.date,10,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Choose a valid date.');const at=new Date(date+'T00:00:00+05:30').getTime();if(!Number.isFinite(at)||at<Date.now()-86400000||at>Date.now()+100*86400000)throw new Error('Choose a date within the next 100 days.');const slot=mentorFor(s.craft.mentorId).slots.find(x=>x===b.slot);if(!slot)throw new Error('Choose one of your mentor’s call windows.');const day=new Date(date+'T12:00:00Z').getUTCDay();if(day!==({Tuesday:2,Thursday:4,Saturday:6} as any)[slot.split(' ')[0]])throw new Error('Choose a date that matches the call window.');if(s.bookings.some((x:any)=>x.date===date&&x.slot===slot))throw new Error('You already saved this call.');if(s.bookings.length>=12)throw new Error('Your pilot includes 12 weekly calls.');s.bookings.push({id:id(),date,slot,mentorId:s.craft.mentorId,simulated:true});break;}
case 'cancel_call':s.bookings=s.bookings.filter((x:any)=>x.id!==b.id);break;
case 'switch_request':{if(s.craft?.status!=='active')throw new Error('Activate Craft before requesting a mentor change.');const m=mentorFor(b.mentorId);if(m.id===s.craft.mentorId)throw new Error('Choose a different mentor.');if(!m.slots.includes(b.slot))throw new Error('Choose a call preference.');s.craft.switchRequest={mentorId:m.id,slot:b.slot,at:now};break;}
case 'switch_accept':{if(!s.craft?.switchRequest)throw new Error('No mentor change is pending.');s.craft.mentorId=s.craft.switchRequest.mentorId;s.craft.slot=s.craft.switchRequest.slot;s.craft.switchRequest=null;break;}
case 'portfolio_save':{s.portfolio.title=safeText(b.title,100,1);s.portfolio.bio=safeText(b.bio,1500);const ids=Array.isArray(b.ids)?b.ids:[];if(ids.length>9||new Set(ids).size!==ids.length||ids.some((x:string)=>!s.submissions.find((v:any)=>v.id===x)))throw new Error('Select up to nine of your submissions.');s.portfolio.ids=ids;portfolioChange=republish(s);break;}
case 'portfolio_publish':{if(b.consent!==true)throw new Error('Confirm that the selected work may be shared publicly.');if(b.visibility==='public'&&s.consent?.age!=='adult')throw new Error(s.consent?'Public portfolios are for learners 18 and over. You can still share it by link (Unlisted).':'Tell us your age group first.');if(!s.portfolio.ids.length)throw new Error('Select at least one portfolio piece first.');s.portfolio.visibility=b.visibility==='public'?'public':'unlisted';s.portfolio.token=s.portfolio.token||id();portfolioChange={token:s.portfolio.token,data:publicPortfolio(s),visibility:s.portfolio.visibility};break;}
// Deletes the learner's plan. keepWork: only the plan goes (level, dates, styles); hand-ins and progress stay, and a
// new plan at the same level picks them up. Otherwise everything from the plan goes too: Videography progress,
// lesson progress and hand-ins (and their portfolio pieces), and the older "previous learning" plan.
// Deletes one plan (b.id, or the open one). keepWork: hand-ins and progress stay. Otherwise the work for that plan's
// level goes too, unless another plan is at the same level. previous: only the older previous learning plan.
case 'plan_delete':{
 if(b.previous===true){s.profile=null;break}
 const plan=s.plans.find((x:any)=>x.id===(b.id||s.programme?.id));if(!plan)throw new Error('That plan no longer exists.');
 if(s.programme?.id===plan.id)openPlan(s,null);
 await retireCourseId(user.userId,plan.id);
 s.plans=s.plans.filter((x:any)=>x.id!==plan.id);
 if(s.planProgress)delete s.planProgress[plan.id];
 if(b.keepWork!==true&&!s.plans.some((x:any)=>x.level===plan.level)){
  const mine=(k:string)=>k.startsWith('video-'+plan.level+'-');
  for(const k of Object.keys(s.progress||{}))if(mine(k))delete s.progress[k];
  for(const k of Object.keys(s.lessonProgress||{}))if(mine(k))delete s.lessonProgress[k];
  const gone=new Set(s.submissions.filter((x:any)=>mine(String(x.key))).map((x:any)=>x.id));
  s.submissions=s.submissions.filter((x:any)=>!gone.has(x.id));
  s.portfolio.ids=s.portfolio.ids.filter((x:string)=>!gone.has(x));portfolioChange=republish(s);
 }
 // The most recent remaining plan opens, if there is one.
 if(!s.programme&&s.plans.length)openPlan(s,s.plans[s.plans.length-1]);
 break;}
case 'portfolio_unpublish':{if(s.portfolio.token)portfolioChange={removeToken:s.portfolio.token};s.portfolio.token=null;break;}
default:throw new Error('That action is not available.')}
if(s.programme)s.plans=s.plans.map((x:any)=>x.id===s.programme.id?s.programme:x);
let next:number;if(reflectionChange){const encoded=JSON.stringify(s);const results=await db().batch([db().prepare('UPDATE learners SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(encoded,Date.now(),user.userId,revision),db().prepare('INSERT INTO reflection_attempts(id,user_id,module_key,data,created_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM learners WHERE user_id=? AND revision=? AND data=?)').bind(reflectionChange.id,user.userId,reflectionChange.key,JSON.stringify(reflectionChange),Date.now(),user.userId,revision+1,encoded)]);if(!results[0].meta.changes)throw Object.assign(new Error('Your learning changed in another tab. Refresh and retry.'),{status:409});next=revision+1}else if(portfolioChange){const encoded=JSON.stringify(s);const update=db().prepare('UPDATE learners SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(encoded,Date.now(),user.userId,revision);const condition='EXISTS (SELECT 1 FROM learners WHERE user_id=? AND revision=? AND data=?)';const change=portfolioChange.removeToken?db().prepare('DELETE FROM portfolios WHERE token=? AND user_id=? AND '+condition).bind(portfolioChange.removeToken,user.userId,user.userId,revision+1,encoded):db().prepare('INSERT INTO portfolios(token,user_id,data,visibility,updated_at) SELECT ?,?,?,?,? WHERE '+condition+' ON CONFLICT(token) DO UPDATE SET data=excluded.data,visibility=excluded.visibility,updated_at=excluded.updated_at').bind(portfolioChange.token,user.userId,portfolioChange.data,portfolioChange.visibility,Date.now(),user.userId,revision+1,encoded);const results=await db().batch([update,change]);if(!results[0].meta.changes)throw Object.assign(new Error('Your learning changed in another tab. Refresh and try again.'),{status:409});next=revision+1}else{next=await saveState(user.userId,s,revision)}for(const [name,props,dedupe] of steps)await logEvent(user.userId,name,props,{dedupe});return Response.json({state:s,revision:next,usage:await usage(user.userId,s)},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e)}}

