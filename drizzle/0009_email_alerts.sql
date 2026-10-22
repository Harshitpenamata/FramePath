CREATE TABLE `email_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`kind` text NOT NULL,
	`dedupe` text NOT NULL,
	`to_address` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_email_log_dedupe` ON `email_log` (`dedupe`);--> statement-breakpoint
CREATE INDEX `idx_email_log_user` ON `email_log` (`user_id`,`kind`,`created_at`);--> statement-breakpoint
CREATE TABLE `email_optouts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
