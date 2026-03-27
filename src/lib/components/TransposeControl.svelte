<script lang="ts">
	import { getTransposedKey } from '$lib/transpose';

	let {
		originalKey = 'C',
		offset = $bindable(0)
	}: {
		originalKey?: string;
		offset?: number;
	} = $props();

	const displayKey = $derived(offset === 0 ? originalKey : getTransposedKey(originalKey, offset));
	const semitoneLabel = $derived(offset > 0 ? `+${offset}` : offset < 0 ? `${offset}` : '');
</script>

<div class="flex items-center gap-2">
	<button
		onclick={() => (offset = Math.max(-6, offset - 1))}
		class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold text-zinc-200 transition-colors"
		disabled={offset <= -6}
		title="Transpose down"
	>♭</button>

	<div class="text-center min-w-[72px]">
		<span class="text-amber-400 font-bold text-lg">{displayKey}</span>
		{#if semitoneLabel}
			<span class="text-zinc-500 text-xs ml-1">({semitoneLabel})</span>
		{/if}
	</div>

	<button
		onclick={() => (offset = Math.min(6, offset + 1))}
		class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold text-zinc-200 transition-colors"
		disabled={offset >= 6}
		title="Transpose up"
	>♯</button>

	{#if offset !== 0}
		<button
			onclick={() => (offset = 0)}
			class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-1"
			title="Reset"
		>↺</button>
	{/if}
</div>
