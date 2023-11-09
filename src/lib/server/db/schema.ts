import { mysqlTable, serial, text, date } from 'drizzle-orm/mysql-core';

export const maps = mysqlTable('maps', {
	id: serial('id').primaryKey(),
	name: text('name'),
	description: text('description'),
	created_at: date('created_at')
});
