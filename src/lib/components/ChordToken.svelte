<script lang="ts">
	import { lookupChord } from '$lib/chord-lookup';
	import ChordDiagram from './ChordDiagram.svelte';

	let { chord }: { chord: string } = $props();

	const position = $derived(lookupChord(chord));
	let open = $state(false);

	function toggle() { open = !open; }
	function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') open = false; }
</script>

<span class="chord-token inline-block relative select-none" onkeydown={onKeyDown}>
	<button
		onclick={toggle}
		class="chord-name font-bold text-amber-400 hover:text-amber-300 active:text-amber-200 cursor-pointer text-sm leading-none px-0.5 rounded transition-colors"
		aria-expanded={open}
		aria-haspopup="dialog"
		type="button"
	>
		{chord}
	</button>

	{#if open}
		<div
			role="presentation"
			class="fixed inset-0 z-40"
			onclick={() => (open = false)}
		></div>
		<div
			role="dialog"
			aria-label="{chord} chord diagram"
			class="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-600 rounded-lg p-3 shadow-xl flex flex-col items-center gap-1 min-w-[120px]"
		>
			<p class="text-white font-bold text-base">{chord}</p>
			{#if position}
				<div class="text-zinc-200">
					<ChordDiagram {position} />
				</div>
			{:else}
				<p class="text-zinc-500 text-xs">No diagram available</p>
			{/if}
		</div>
	{/if}
</span>
