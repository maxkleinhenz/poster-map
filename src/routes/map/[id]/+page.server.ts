import type { PageServerLoad } from './$types';
import { trpcOnServer } from '$lib/trpc';
import { z } from 'zod';
import type { MapSchema } from '$lib/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const idResult = z.coerce.number().safeParse(params.id);
	if (idResult.success) {
		const trpc = trpcOnServer(fetch);
		const map = (await trpc.getMap.query(idResult.data)) as MapSchema | undefined;
		if (map) {
			return { map: map };
		}
	}

	error(404, 'Not found');
};
