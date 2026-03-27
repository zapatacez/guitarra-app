import { error } from '@sveltejs/kit';
import { getSong } from '$lib/server/songs';
import { getChordsMap } from '$lib/server/chords';
import { extractChords } from '$lib/chord-parser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const song = getSong(Number(params.id));
	if (!song) error(404, 'Song not found');

	const chordNames = extractChords(song.content);
	const chordMap = await getChordsMap(chordNames, 'basic');

	return { song, chordMap };
};
