<script lang="ts">
	import type { ChordEntry } from '$lib/server/schema';
	import ChordDiagram from './ChordDiagram.svelte';

	let {
		chord,
		chordMap = {}
	}: {
		chord: string;
		chordMap: Record<string, ChordEntry>;
	} = $props();

	// Enharmonic equivalents for fallback lookup
	const ENHARMONIC: Record<string, string> = {
		'A#': 'Bb', 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab',
		'Bb': 'A#', 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#'
	};

	function resolveChordData(name: string): ChordEntry | null {
		if (chordMap[name]) return chordMap[name];

		// Try enharmonic root: e.g. A#7 → Bb7
		const root = name.length > 1 && (name[1] === '#' || name[1] === 'b')
			? name.slice(0, 2)
			: name[0];
		const quality = name.slice(root.length);
		const enh = ENHARMONIC[root];
		if (enh && chordMap[enh + quality]) return chordMap[enh + quality];

		// Try base chord without extensions: Am7 → Am, Gmaj7 → G
		const base = name.match(/^[A-G][#b]?m?/)?.[0];
		if (base && base !== name && chordMap[base]) return chordMap[base];

		return null;
	}

	const chordData = $derived(resolveChordData(chord));

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
			{#if chordData}
				<div class="text-zinc-200">
					<ChordDiagram chord={chordData} />
				</div>
				<p class="text-zinc-400 text-xs capitalize">{chordData.difficulty}</p>
			{:else}
				<p class="text-zinc-500 text-xs">No diagram available</p>
			{/if}
		</div>
	{/if}
</span>
