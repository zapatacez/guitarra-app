import { redirect } from '@sveltejs/kit';
import { createSong } from '$lib/server/songs';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const song = await createSong({
			title: String(data.get('title') ?? ''),
			artist: String(data.get('artist') ?? ''),
			key: String(data.get('key') ?? 'C'),
			capo: Number(data.get('capo') ?? 0),
			bpm: Number(data.get('bpm') ?? 100),
			timeSignature: String(data.get('time_signature') ?? '4/4'),
			content: String(data.get('content') ?? ''),
			notes: String(data.get('notes') ?? ''),
			strumming: '[]'
		});
		redirect(303, `/songs/${song.id}`);
	}
};
