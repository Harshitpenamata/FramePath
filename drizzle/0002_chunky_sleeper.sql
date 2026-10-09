CREATE TABLE `goal_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`user_id` text,
	`words` text NOT NULL,
	`case_id` text NOT NULL,
	`confidence` integer NOT NULL,
	`clarification` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_goal_log_date` ON `goal_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `onboarding_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`guest_hash` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`data` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_onboarding_owner` ON `onboarding_attempts` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_onboarding_guest` ON `onboarding_attempts` (`guest_hash`,`updated_at`);