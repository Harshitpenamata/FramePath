CREATE TABLE `reflection_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_key` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reflection_owner_module_date` ON `reflection_attempts` (`user_id`,`module_key`,`created_at`);