<script lang="ts">
	import { parseSong } from '$lib/chord-parser';
	import { transposeContent } from '$lib/transpose';
	import ChordToken from './ChordToken.svelte';

	let {
		content,
		transposeOffset = 0
	}: {
		content: string;
		transposeOffset?: number;
	} = $props();

	const transposedContent = $derived(transposeContent(content, transposeOffset));
	const lines = $derived(parseSong(transposedContent));
</script>

<div class="lyrics-renderer font-mono text-sm leading-6 overflow-x-auto">
	{#each lines as line}
		{#if line.lineType === 'section'}
			<div class="mt-5 mb-1">
				<span class="text-xs font-semibold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
					{line.value}
				</span>
			</div>

		{:else if line.lineType === 'chords'}
			<div class="chord-line flex flex-wrap items-baseline leading-5 min-h-[1.4rem]">
				{#each line.tokens as token}
					{#if token.type === 'chord'}
						<ChordToken chord={token.value} />
					{:else}
						<!-- Preserve spaces using a span with white-space:pre -->
						<span class="whitespace-pre text-transparent select-none">{token.value}</span>
					{/if}
				{/each}
			</div>

		{:else if line.lineType === 'lyrics'}
			<div class="lyrics-line text-zinc-200 whitespace-pre leading-6">{line.value}</div>

		{:else}
			<div class="h-3"></div>
		{/if}
	{/each}
</div>
