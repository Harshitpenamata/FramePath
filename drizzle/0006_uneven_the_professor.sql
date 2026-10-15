CREATE TABLE `wa_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`phone` text NOT NULL,
	`template` text NOT NULL,
	`params` text NOT NULL,
	`body` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`wa_id` text,
	`error` text,
	`dedupe_key` text,
	`cost_paise` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_wa_dedupe` ON `wa_messages` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `idx_wa_user_date` ON `wa_messages` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_wa_status` ON `wa_messages` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_wa_waid` ON `wa_messages` (`wa_id`);