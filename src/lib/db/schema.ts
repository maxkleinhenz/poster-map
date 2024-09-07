import { integer, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { asOptionalString } from './helper';

export const maps = pgTable('maps', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	lat: real('lat').notNull(),
	lng: real('lng').notNull(),
	created_at: timestamp('created_at').defaultNow()
});

export const insertMapSchema = createInsertSchema(maps, {
	id: z.never(),
	name: z.string().trim().min(1),
	description: asOptionalString(z.string().trim().min(1)),
	lat: z.coerce.number(),
	lng: z.coerce.number()
});

export type InsertMapSchema = typeof insertMapSchema;
export type MapSchema = typeof maps.$inferSelect;

// const columnNameSchema = z.string().refine((s) => Object.keys(maps.$inferSelect).includes(s));

// type MapColumn = keyof typeof maps.$inferSelect;
