import { insertMapSchema, maps, type MapSchema } from '$lib/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';

export async function getMap(id: number) {
	return {
		id: 1,
		name: 'Test',
		description: 'Test',
		lat: 13.7373,
		lng: 51.0504,
		created_at: new Date()
	};

	// const map = await db.query.maps.findFirst({
	// 	where: eq(maps.id, id)
	// });
	// return map;
}

export async function getMaps(): Promise<MapSchema[]> {
	return [
		{
			id: 1,
			name: 'Test',
			description: 'Test',
			lat: 13.7373,
			lng: 51.0504,
			created_at: new Date()
		}
	];
	// return await db.query.maps.findMany();
}

export async function insertMap(input: z.infer<typeof insertMapSchema>) {
	const exec = await db.insert(maps).values(input);
	return exec.insertId;
}
