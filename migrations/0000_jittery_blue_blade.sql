CREATE TABLE IF NOT EXISTS "maps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"created_at" timestamp DEFAULT now()
);
