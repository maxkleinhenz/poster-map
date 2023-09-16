import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		map: {
			id: params.id
		}
	};
};
