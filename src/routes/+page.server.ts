import { getAllSongs } from '$lib/server/songs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const songs = await getAllSongs();
	return { songs };
};
