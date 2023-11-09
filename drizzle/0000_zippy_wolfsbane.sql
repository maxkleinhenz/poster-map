CREATE TABLE `maps` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` text,
	`description` text,
	`created_at` date,
	CONSTRAINT `maps_id` PRIMARY KEY(`id`)
);
