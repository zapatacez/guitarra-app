import { error } from '@sveltejs/kit';
import { getSong } from '$lib/server/songs';
import { getAllChords } from '$lib/server/chords';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const song = getSong(Number(params.id));
	if (!song) error(404, 'Song not found');

	// Load all basic chords so transposed chord names still get diagrams
	const chords = await getAllChords('basic');
	const chordMap = Object.fromEntries(chords.map((c) => [c.name, c]));

	return { song, chordMap };
};
