import { sql } from 'drizzle-orm';
import { mysqlTable, serial, text, date, timestamp, float } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const maps = mysqlTable('maps', {
	id: serial('id').autoincrement().primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	lat: float('lat').notNull(),
	lng: float('lng').notNull(),
	created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const insertMapSchema = createInsertSchema(maps, {
	lat: z.coerce.number(),
	lng: z.coerce.number()
});
export type InsertMapSchema = z.infer<typeof insertMapSchema>;
