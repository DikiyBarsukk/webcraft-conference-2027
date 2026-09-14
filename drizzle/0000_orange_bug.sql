CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`degree` text NOT NULL,
	`institution` text NOT NULL,
	`department` text DEFAULT '' NOT NULL,
	`paper_title` text DEFAULT '' NOT NULL,
	`topics` text NOT NULL,
	`participation` text NOT NULL,
	`visa_support` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_reference_unique` ON `registrations` (`reference`);