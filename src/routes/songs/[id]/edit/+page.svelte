<script lang="ts">
	import SongForm from '$lib/components/SongForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Edit: {data.song.title} — Guitarra</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-xl font-bold text-zinc-100">Edit Song</h1>
		<form method="POST" action="?/delete" onsubmit="return confirm('Delete this song?')">
			<button type="submit" class="text-red-400 hover:text-red-300 text-sm transition-colors">
				Delete
			</button>
		</form>
	</div>
	<SongForm song={data.song} action="?/update" />
</div>
