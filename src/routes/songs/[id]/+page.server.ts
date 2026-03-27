import { error } from '@sveltejs/kit';
import { getSong } from '$lib/server/songs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const song = getSong(Number(params.id));
	if (!song) error(404, 'Song not found');
	return { song };
};
