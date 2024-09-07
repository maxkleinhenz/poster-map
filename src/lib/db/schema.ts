import { json, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { asOptionalString } from './helper';

export const maps = pgTable('maps', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	lat: real('lat').notNull(),
	lng: real('lng').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	geojson: json('geojson')
});

export const insertMapSchema = createInsertSchema(maps, {
	id: z.never(),
	name: z.string().trim().min(1),
	description: asOptionalString(z.string().trim().min(1)),
	lat: z.coerce.number(),
	lng: z.coerce.number(),
	created_at: z.never(),
	geojson: z.string().optional()
});

export const updateMapSchema = createSelectSchema(maps, {
	id: z.number().gt(0),
	name: z.string().trim().optional(),
	description: asOptionalString(z.string().trim().min(1)),
	lat: z.coerce.number().optional(),
	lng: z.coerce.number().optional(),
	created_at: z.never().optional(),
	geojson: z.string().optional()
});

export type InsertMapSchema = typeof insertMapSchema;
export type UpdateMapSchema = typeof updateMapSchema;
export type MapSchema = typeof maps.$inferSelect;

// const columnNameSchema = z.string().refine((s) => Object.keys(maps.$inferSelect).includes(s));

// type MapColumn = keyof typeof maps.$inferSelect;
