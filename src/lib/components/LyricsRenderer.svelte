<script lang="ts">
	import { parseSong, lineHasChords } from '$lib/chord-parser';
	import { transposeContent } from '$lib/transpose';
	import type { ChordEntry } from '$lib/server/schema';
	import ChordToken from './ChordToken.svelte';

	let {
		content,
		transposeOffset = 0,
		chordMap = {}
	}: {
		content: string;
		transposeOffset?: number;
		chordMap?: Record<string, ChordEntry>;
	} = $props();

	const transposedContent = $derived(transposeContent(content, transposeOffset));
	const lines = $derived(parseSong(transposedContent));
</script>

<div class="lyrics-renderer font-mono text-sm leading-relaxed whitespace-pre-wrap">
	{#each lines as line, i}
		{@const hasChords = lineHasChords(line)}
		{#if hasChords}
			<!-- Line with chords: render tokens inline -->
			<div class="lyrics-line flex flex-wrap items-end gap-x-0">
				{#each line as token}
					{#if token.type === 'chord'}
						<ChordToken
							chord={token.value}
							chordData={chordMap[token.value] ?? null}
						/>
					{:else}
						<span class="text-zinc-200">{token.value}</span>
					{/if}
				{/each}
			</div>
		{:else}
			<!-- Pure text line -->
			<div class="lyrics-line text-zinc-200">
				{#each line as token}
					{token.value}
				{/each}
			</div>
		{/if}
	{/each}
</div>
