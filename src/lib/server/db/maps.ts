import { insertMapSchema, maps, type MapSchema } from '$lib/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';

export async function getMap(id: number) {
	const map = await db.query.maps.findFirst({
		where: eq(maps.id, id)
	});
	return map;
}

export async function getMaps(): Promise<MapSchema[]> {
	return await db.query.maps.findMany();
}

export async function insertMap(input: z.infer<typeof insertMapSchema>) {
	const exec = await db.insert(maps).values(input);
	return exec.insertId;
}
