ALTER TABLE `maps` MODIFY COLUMN `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `maps` MODIFY COLUMN `created_at` timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `maps` ADD `lat` float NOT NULL;--> statement-breakpoint
ALTER TABLE `maps` ADD `lng` float NOT NULL;