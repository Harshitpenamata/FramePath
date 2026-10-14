CREATE TABLE `review_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`user_id` text NOT NULL,
	`lesson_key` text NOT NULL,
	`reason` text NOT NULL,
	`details` text NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_flags_job` ON `review_flags` (`job_id`);--> statement-breakpoint
CREATE INDEX `idx_flags_status` ON `review_flags` (`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `learners` ADD `email` text;--> statement-breakpoint
CREATE INDEX `idx_learners_email` ON `learners` (`email`);