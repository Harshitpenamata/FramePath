import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const learners=sqliteTable('learners',{userId:text('user_id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(0),updatedAt:integer('updated_at').notNull()});
export const uploads=sqliteTable('uploads',{id:text('id').primaryKey(),userId:text('user_id').notNull(),name:text('name').notNull(),type:text('type').notNull(),size:integer('size').notNull(),createdAt:integer('created_at').notNull()},t=>[index('idx_uploads_owner').on(t.userId)]);
export const aiJobs=sqliteTable('ai_jobs',{id:text('id').primaryKey(),userId:text('user_id').notNull(),scope:text('scope').notNull(),kind:text('kind').notNull(),status:text('status').notNull(),answer:text('answer'),createdAt:integer('created_at').notNull()},t=>[index('idx_ai_user_scope_date').on(t.userId,t.scope,t.createdAt),index('idx_ai_date').on(t.createdAt)]);
export const portfolios=sqliteTable('portfolios',{token:text('token').primaryKey(),userId:text('user_id').notNull(),data:text('data').notNull()},t=>[index('idx_portfolio_owner').on(t.userId)]);

