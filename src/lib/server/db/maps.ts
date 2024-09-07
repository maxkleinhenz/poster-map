import { insertMapSchema, maps, updateMapSchema, type MapSchema } from '$lib/db/schema';
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
	const returning = await db.insert(maps).values(input).returning({ id: maps.id });
	return returning[0]?.id;
}

export async function updateMap(id: number, input: z.infer<typeof updateMapSchema>) {
	await db.update(maps).set(input).where(eq(maps.id, id));
}
