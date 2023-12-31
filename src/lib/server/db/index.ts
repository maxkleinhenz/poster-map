import 'dotenv/config';
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import { maps } from '$lib/db/schema';

// create the connection
const connection = connect({
	url: process.env.DATABASE_URL
});

export const db = drizzle(connection, {
	schema: {
		maps
	}
});
