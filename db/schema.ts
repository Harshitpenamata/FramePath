import {sqliteTable,text,integer,real,index,uniqueIndex,primaryKey} from 'drizzle-orm/sqlite-core';
// email: the sign-in email, saved when the learner loads the app, so admins can find them.
// public_id: the learner's User ID for support and tracking (FP-10001), given once and never changed.
export const learners=sqliteTable('learners',{userId:text('user_id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(0),updatedAt:integer('updated_at').notNull(),email:text('email'),publicId:text('public_id')},t=>[index('idx_learners_email').on(t.email),uniqueIndex('idx_learners_public_id').on(t.publicId)]);
export const uploads=sqliteTable('uploads',{id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull(),type:text('type').notNull(),size:integer('size').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_uploads_owner').on(t.userId)]);
export const aiJobs=sqliteTable('ai_jobs',{id:text('id').primaryKey(),userId:text('user_id').notNull(),scope:text('scope').notNull(),kind:text('kind').notNull(),status:text('status').notNull(),answer:text('answer'),createdAt:integer('created_at').notNull()},t=>[index('idx_ai_user_scope_date').on(t.userId,t.scope,t.createdAt),index('idx_ai_date').on(t.createdAt)]);
// visibility: 'unlisted' (anyone with the link) or 'public' (also listed in the community gallery).
export const portfolios=sqliteTable('portfolios',{token:text('token').primaryKey(),userId:text('user_id').notNull(),data:text('data').notNull(),visibility:text('visibility').notNull().default('unlisted'),updatedAt:integer('updated_at').notNull().default(0)},t=>[index('idx_portfolio_owner').on(t.userId),index('idx_portfolio_public').on(t.visibility,t.updatedAt)]);
// Community: likes and comments on pieces in shared portfolios, and reports on comments.
export const portfolioLikes=sqliteTable('portfolio_likes',{token:text('token').notNull(),pieceId:text('piece_id').notNull(),userId:text('user_id').notNull(),createdAt:integer('created_at').notNull()},t=>[primaryKey({columns:[t.token,t.pieceId,t.userId]}),index('idx_likes_piece').on(t.token,t.pieceId)]);
// status: 'visible', 'reported' (hidden until reviewed) or 'removed'.
export const portfolioComments=sqliteTable('portfolio_comments',{id:text('id').primaryKey(),token:text('token').notNull(),pieceId:text('piece_id').notNull(),userId:text('user_id').notNull(),author:text('author').notNull(),body:text('body').notNull(),status:text('status').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_comments_piece').on(t.token,t.pieceId,t.createdAt),index('idx_comments_user_date').on(t.userId,t.createdAt)]);
export const commentReports=sqliteTable('comment_reports',{id:text('id').primaryKey(),commentId:text('comment_id').notNull(),userId:text('user_id').notNull(),reason:text('reason').notNull(),createdAt:integer('created_at').notNull()},t=>[uniqueIndex('idx_reports_once').on(t.commentId,t.userId)]);


export const reflectionAttempts=sqliteTable('reflection_attempts',{id:text('id').primaryKey(),userId:text('user_id').notNull(),moduleKey:text('module_key').notNull(),data:text('data').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_reflection_owner_module_date').on(t.userId,t.moduleKey,t.createdAt)]);

export const onboardingAttempts=sqliteTable('onboarding_attempts',{id:text('id').primaryKey(),userId:text('user_id'),guestHash:text('guest_hash').notNull(),revision:integer('revision').notNull().default(0),data:text('data').notNull(),status:text('status').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()},t=>[index('idx_onboarding_owner').on(t.userId,t.updatedAt),index('idx_onboarding_guest').on(t.guestHash,t.updatedAt)]);
export const goalLogs=sqliteTable('goal_logs',{id:text('id').primaryKey(),attemptId:text('attempt_id').notNull(),userId:text('user_id'),words:text('words').notNull(),caseId:text('case_id').notNull(),confidence:integer('confidence').notNull(),clarification:text('clarification').notNull(),status:text('status').notNull().default('new'),createdAt:integer('created_at').notNull()},t=>[index('idx_goal_log_date').on(t.createdAt)]);
// Lesson video health, checked by the scheduled job. status: 'ok', 'dead' (removed, private or not embeddable;
// hidden from lessons after two failed checks in a row) or 'noframe' (a page that refuses to show inside FramePath).
export const videoStatus=sqliteTable('video_status',{id:text('id').primaryKey(),status:text('status').notNull(),detail:text('detail').notNull(),fails:integer('fails').notNull(),checkedAt:integer('checked_at').notNull()});
// Every AI call's tokens and estimated cost, for the daily spend cap.
export const aiUsage=sqliteTable('ai_usage',{id:text('id').primaryKey(),day:text('day').notNull(),provider:text('provider').notNull(),model:text('model').notNull(),kind:text('kind').notNull(),inputTokens:integer('input_tokens').notNull(),outputTokens:integer('output_tokens').notNull(),usd:real('usd').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_ai_usage_day').on(t.day)]);
// Small switches the app sets for itself, e.g. 'ai_paused_until' after the AI provider reports no credit.
export const appFlags=sqliteTable('app_flags',{key:text('key').primaryKey(),value:text('value').notNull(),updatedAt:integer('updated_at').notNull()});
// A learner says an AI review seems wrong. status: 'open', 'fine' (the review stands) or 'refunded' (the review was
// wrong; it no longer counts toward the learner's review allowance). note: what the admin tells the learner.
export const reviewFlags=sqliteTable('review_flags',{id:text('id').primaryKey(),jobId:text('job_id').notNull(),userId:text('user_id').notNull(),lessonKey:text('lesson_key').notNull(),reason:text('reason').notNull(),details:text('details').notNull(),status:text('status').notNull(),note:text('note').notNull(),createdAt:integer('created_at').notNull(),resolvedAt:integer('resolved_at')},t=>[uniqueIndex('idx_flags_job').on(t.jobId),index('idx_flags_status').on(t.status,t.createdAt)]);
// WhatsApp messages: every message FramePath sends (or, in test mode, would send). dedupe_key stops the same reminder
// going twice. status: 'test' (test mode: logged, not sent), 'held' (waiting for quiet hours to end), 'sent',
// 'delivered', 'read', 'failed' or 'skipped'. cost_paise is Meta's estimated charge including GST.
export const waMessages=sqliteTable('wa_messages',{id:text('id').primaryKey(),userId:text('user_id').notNull(),phone:text('phone').notNull(),template:text('template').notNull(),params:text('params').notNull(),body:text('body').notNull(),category:text('category').notNull(),status:text('status').notNull(),waId:text('wa_id'),error:text('error'),dedupeKey:text('dedupe_key'),costPaise:integer('cost_paise').notNull().default(0),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()},t=>[uniqueIndex('idx_wa_dedupe').on(t.dedupeKey),index('idx_wa_user_date').on(t.userId,t.createdAt),index('idx_wa_status').on(t.status,t.createdAt),index('idx_wa_waid').on(t.waId)]);


// IDs for support and tracking. Counters hand out the next number for each kind of ID (user, course, ticket),
// so IDs are unique and never reused.
export const idCounters=sqliteTable('id_counters',{name:text('name').primaryKey(),value:integer('value').notNull()});
// Course IDs (VID-B-1001): one per plan, given when the plan is made and kept for good, even after a rename,
// a move up a level or deletion (deleted_at), so an old ticket still points at the right plan.
export const courseIds=sqliteTable('course_ids',{courseId:text('course_id').primaryKey(),userId:text('user_id').notNull(),planId:text('plan_id').notNull(),createdAt:integer('created_at').notNull(),deletedAt:integer('deleted_at')},t=>[index('idx_course_ids_user').on(t.userId),uniqueIndex('idx_course_ids_plan').on(t.userId,t.planId)]);
// Support tickets (T-1001). Each one records who raised it and where they were: User ID, course ID, course,
// pathway, plan name, level, module, lesson and page, so support knows the context without asking.
// status: 'open', 'in_progress' or 'resolved'. reply is shown to the learner; note is for staff only.
export const supportTickets=sqliteTable('support_tickets',{id:text('id').primaryKey(),userId:text('user_id').notNull(),publicUserId:text('public_user_id').notNull(),courseId:text('course_id'),planId:text('plan_id'),course:text('course'),pathway:text('pathway'),planName:text('plan_name'),level:text('level'),moduleKey:text('module_key'),moduleTitle:text('module_title'),lesson:integer('lesson'),page:text('page').notNull(),category:text('category').notNull(),message:text('message').notNull(),status:text('status').notNull(),reply:text('reply').notNull().default(''),note:text('note').notNull().default(''),context:text('context').notNull().default('{}'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),learnerSeenAt:integer('learner_seen_at')},t=>[index('idx_tickets_status').on(t.status,t.createdAt),index('idx_tickets_user').on(t.userId,t.createdAt),index('idx_tickets_course').on(t.courseId)]);

// Pilot tracker: one row per step a learner takes (plan started, plan created, video watched, hand-in, review
// ready, review opened, module finished, visit). user_id is null before sign-in, when anon_id links the steps.
// dedupe stops the same step being counted twice (e.g. one 'visit' per learner per day).
export const events=sqliteTable('events',{id:text('id').primaryKey(),userId:text('user_id'),anonId:text('anon_id'),name:text('name').notNull(),props:text('props').notNull().default('{}'),path:text('path'),dedupe:text('dedupe'),createdAt:integer('created_at').notNull()},t=>[index('idx_events_name_date').on(t.name,t.createdAt),index('idx_events_user_date').on(t.userId,t.createdAt),uniqueIndex('idx_events_dedupe').on(t.dedupe)]);
// Was this AI review useful? One answer per review (the learner can change it), with an optional comment.
export const reviewRatings=sqliteTable('review_ratings',{jobId:text('job_id').primaryKey(),userId:text('user_id').notNull(),helpful:integer('helpful').notNull(),comment:text('comment').notNull().default(''),createdAt:integer('created_at').notNull()},t=>[index('idx_review_ratings_date').on(t.createdAt)]);
// Emails sent (app/email.ts). dedupe stops the same alert going twice (a reply's text, a review's job, a reminder's day).
export const emailLog=sqliteTable('email_log',{id:text('id').primaryKey(),userId:text('user_id'),kind:text('kind').notNull(),dedupe:text('dedupe').notNull(),toAddress:text('to_address').notNull(),status:text('status').notNull(),createdAt:integer('created_at').notNull()},t=>[uniqueIndex('idx_email_log_dedupe').on(t.dedupe),index('idx_email_log_user').on(t.userId,t.kind,t.createdAt)]);
// Learners who turned off reminder emails (the link in each reminder, or My account). Replies to their tickets still send.
export const emailOptouts=sqliteTable('email_optouts',{userId:text('user_id').primaryKey(),createdAt:integer('created_at').notNull()});
