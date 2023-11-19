import { mysqlTable, serial, text, timestamp, float } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { asOptionalString } from './helper';

export const maps = mysqlTable('maps', {
	id: serial('id').autoincrement().primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	lat: float('lat').notNull(),
	lng: float('lng').notNull(),
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
