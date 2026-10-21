CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`anon_id` text,
	`name` text NOT NULL,
	`props` text DEFAULT '{}' NOT NULL,
	`path` text,
	`dedupe` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_events_name_date` ON `events` (`name`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_events_user_date` ON `events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_events_dedupe` ON `events` (`dedupe`);--> statement-breakpoint
CREATE TABLE `review_ratings` (
	`job_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`helpful` integer NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_review_ratings_date` ON `review_ratings` (`created_at`);--> statement-breakpoint
ALTER TABLE `support_tickets` ADD `learner_seen_at` integer;