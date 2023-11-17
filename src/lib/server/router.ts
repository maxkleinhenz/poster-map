import { z } from 'zod';
import { publicProcedure, router } from './context';
import { getMap, getMaps, insertMap } from '$lib/server/db/maps';
import { insertMapSchema } from '$lib/db/schema';

export const appRouter = router({
	getMap: publicProcedure.input(z.number()).query(async (opts) => {
		return await getMap(opts.input);
	}),
	getAllMaps: publicProcedure.query(async () => {
		return await getMaps();
	}),
	createMap: publicProcedure.input(insertMapSchema).mutation(async (opts) => {
		return await insertMap(opts.input);
	})
});

export type AppRouter = typeof appRouter;
