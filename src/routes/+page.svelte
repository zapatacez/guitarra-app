<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let search = $state('');

	const filtered = $derived(
		search.trim()
			? data.songs.filter(
					(s) =>
						s.title.toLowerCase().includes(search.toLowerCase()) ||
						s.artist.toLowerCase().includes(search.toLowerCase())
				)
			: data.songs
	);
</script>

<svelte:head>
	<title>Guitarra — Songs</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex items-center gap-3">
		<input
			type="search"
			bind:value={search}
			placeholder="Search songs or artists…"
			class="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
		/>
	</div>

	{#if filtered.length === 0}
		<div class="text-center py-16 text-zinc-500">
			{#if data.songs.length === 0}
				<p class="text-lg">No songs yet.</p>
				<a href="/songs/new" class="text-amber-400 hover:text-amber-300 mt-2 inline-block">Add your first song →</a>
			{:else}
				<p>No songs match "{search}"</p>
			{/if}
		</div>
	{:else}
		<ul class="space-y-2">
			{#each filtered as song}
				<li>
					<a
						href="/songs/{song.id}"
						class="flex items-center justify-between bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 rounded-lg px-4 py-3 transition-colors group"
					>
						<div>
							<p class="font-semibold text-zinc-100 group-hover:text-white">{song.title}</p>
							{#if song.artist}
								<p class="text-sm text-zinc-400">{song.artist}</p>
							{/if}
						</div>
						<div class="flex items-center gap-2 text-zinc-500 text-xs">
							{#if song.key}<span class="bg-zinc-700 rounded px-1.5 py-0.5">{song.key}</span>{/if}
							{#if song.capo > 0}<span class="bg-zinc-700 rounded px-1.5 py-0.5">Capo {song.capo}</span>{/if}
							<span class="text-zinc-600">›</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
