CREATE TABLE `comment_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reports_once` ON `comment_reports` (`comment_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `portfolio_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`piece_id` text NOT NULL,
	`user_id` text NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comments_piece` ON `portfolio_comments` (`token`,`piece_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_user_date` ON `portfolio_comments` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `portfolio_likes` (
	`token` text NOT NULL,
	`piece_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`token`, `piece_id`, `user_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_likes_piece` ON `portfolio_likes` (`token`,`piece_id`);--> statement-breakpoint
ALTER TABLE `portfolios` ADD `visibility` text DEFAULT 'unlisted' NOT NULL;--> statement-breakpoint
ALTER TABLE `portfolios` ADD `updated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_portfolio_public` ON `portfolios` (`visibility`,`updated_at`);