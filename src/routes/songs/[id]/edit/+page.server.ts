import { error, redirect } from '@sveltejs/kit';
import { getSong, updateSong, deleteSong } from '$lib/server/songs';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const song = getSong(Number(params.id));
	if (!song) error(404, 'Song not found');
	return { song };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		await updateSong(Number(params.id), {
			title: String(data.get('title') ?? ''),
			artist: String(data.get('artist') ?? ''),
			key: String(data.get('key') ?? 'C'),
			capo: Number(data.get('capo') ?? 0),
			bpm: Number(data.get('bpm') ?? 100),
			timeSignature: String(data.get('time_signature') ?? '4/4'),
			content: String(data.get('content') ?? ''),
			notes: String(data.get('notes') ?? '')
		});
		redirect(303, `/songs/${params.id}`);
	},

	delete: async ({ params }) => {
		deleteSong(Number(params.id));
		redirect(303, '/');
	}
};
