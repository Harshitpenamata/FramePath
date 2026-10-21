CREATE TABLE `course_ids` (
	`course_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_course_ids_user` ON `course_ids` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_course_ids_plan` ON `course_ids` (`user_id`,`plan_id`);--> statement-breakpoint
CREATE TABLE `id_counters` (
	`name` text PRIMARY KEY NOT NULL,
	`value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`public_user_id` text NOT NULL,
	`course_id` text,
	`plan_id` text,
	`course` text,
	`pathway` text,
	`plan_name` text,
	`level` text,
	`module_key` text,
	`module_title` text,
	`lesson` integer,
	`page` text NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`status` text NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`context` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tickets_status` ON `support_tickets` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_tickets_user` ON `support_tickets` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_tickets_course` ON `support_tickets` (`course_id`);--> statement-breakpoint
ALTER TABLE `learners` ADD `public_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_learners_public_id` ON `learners` (`public_id`);