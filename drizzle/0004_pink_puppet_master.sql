CREATE TABLE `ai_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`kind` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`usd` real NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ai_usage_day` ON `ai_usage` (`day`);--> statement-breakpoint
CREATE TABLE `app_flags` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `video_status` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`detail` text NOT NULL,
	`fails` integer NOT NULL,
	`checked_at` integer NOT NULL
);
