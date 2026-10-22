CREATE TABLE `ticket_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`author` text NOT NULL,
	`author_email` text,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ticket_messages_ticket` ON `ticket_messages` (`ticket_id`,`created_at`);--> statement-breakpoint
INSERT INTO `ticket_messages` (`id`,`ticket_id`,`author`,`author_email`,`body`,`created_at`) SELECT 'm-' || `id`, `id`, 'staff', NULL, `reply`, `updated_at` FROM `support_tickets` WHERE `reply` <> '';
