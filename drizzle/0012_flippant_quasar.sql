CREATE TABLE `error_log` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`route` text,
	`status` integer NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_error_log_date` ON `error_log` (`created_at`);