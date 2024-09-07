import { insertMapSchema, updateMapSchema, type MapSchema } from '$lib/db/schema';
import { getMap, getMaps, insertMap, updateMap } from '$lib/server/db/maps';
import { z } from 'zod';
import { publicProcedure, router } from './context';

export const appRouter = router({
	getMap: publicProcedure.input(z.number()).query(async (opts): Promise<MapSchema | undefined> => {
		return await getMap(opts.input);
	}),
	getAllMaps: publicProcedure.query(async (): Promise<MapSchema[]> => {
		return await getMaps();
	}),
	createMap: publicProcedure.input(insertMapSchema).mutation(async (opts) => {
		return await insertMap(opts.input);
	}),
	updateMap: publicProcedure.input(updateMapSchema).mutation(async (opts) => {
		return await updateMap(opts.input.id, opts.input);
	})
});

export type AppRouter = typeof appRouter;
