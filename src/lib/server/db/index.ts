import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { config } from 'dotenv';
import * as schema from './../../db/schema';

config({ path: '.env' });
export const db = drizzle(sql, { schema });
