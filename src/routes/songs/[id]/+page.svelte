<script lang="ts">
	import type { PageData } from './$types';
	import LyricsRenderer from '$lib/components/LyricsRenderer.svelte';
	import TransposeControl from '$lib/components/TransposeControl.svelte';
	import AutoScroll from '$lib/components/AutoScroll.svelte';
	import Metronome from '$lib/components/Metronome.svelte';

	let { data }: { data: PageData } = $props();

	let transposeOffset = $state(0);
	let capo = $state(data.song.capo);
	let showMetronome = $state(false);
	let activePanel = $state<'transpose' | 'capo' | 'scroll' | 'metronome' | null>(null);

	// Capo transposes the displayed shapes down relative to the sounding key.
	// e.g. key=A, capo=2 → show G shapes (A − 2), matching UG's behaviour.
	const effectiveTranspose = $derived(transposeOffset - capo);

	function togglePanel(panel: typeof activePanel) {
		activePanel = activePanel === panel ? null : panel;
	}

	// Keep screen awake while viewing a song
	$effect(() => {
		let wakeLock: WakeLockSentinel | null = null;

		async function acquire() {
			try {
				if ('wakeLock' in navigator) {
					wakeLock = await navigator.wakeLock.request('screen');
				}
			} catch {}
		}

		function onVisibilityChange() {
			if (document.visibilityState === 'visible') acquire();
		}

		acquire();
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			wakeLock?.release();
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	});
</script>

<svelte:head>
	<title>{data.song.title} — Guitarra</title>
</svelte:head>

<!-- Song header -->
<div class="mb-4 flex items-start justify-between gap-3">
	<div>
		<h1 class="text-2xl font-bold text-zinc-100 leading-tight">{data.song.title}</h1>
		{#if data.song.artist}
			<p class="text-zinc-400 mt-0.5">{data.song.artist}</p>
		{/if}
		<div class="flex gap-2 mt-1.5 flex-wrap">
			{#if data.song.key}
				<span class="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-300">
					Key: {data.song.key}
				</span>
			{/if}
			{#if capo > 0}
				<span class="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-300">
					Capo {capo}
				</span>
			{/if}
			{#if data.song.timeSignature}
				<span class="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-300">
					{data.song.timeSignature}
				</span>
			{/if}
		</div>
	</div>
	<a
		href="/songs/{data.song.id}/edit"
		class="text-zinc-500 hover:text-zinc-300 text-sm transition-colors shrink-0 mt-1"
	>Edit</a>
</div>

<!-- Sticky toolbar -->
<div class="sticky top-14 z-20 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 -mx-4 px-4 py-2 mb-4">
	<div class="flex gap-2 flex-wrap">
		<button
			onclick={() => togglePanel('transpose')}
			class="px-3 py-1.5 rounded-lg text-sm transition-colors {activePanel === 'transpose'
				? 'bg-amber-500 text-black font-semibold'
				: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
		>♯♭ Transpose</button>

		<button
			onclick={() => togglePanel('capo')}
			class="px-3 py-1.5 rounded-lg text-sm transition-colors {activePanel === 'capo'
				? 'bg-amber-500 text-black font-semibold'
				: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
		>𝄌 Capo {capo > 0 ? capo : 'off'}</button>

		<button
			onclick={() => togglePanel('scroll')}
			class="px-3 py-1.5 rounded-lg text-sm transition-colors {activePanel === 'scroll'
				? 'bg-amber-500 text-black font-semibold'
				: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
		>↓ Scroll</button>

		<button
			onclick={() => togglePanel('metronome')}
			class="px-3 py-1.5 rounded-lg text-sm transition-colors {activePanel === 'metronome'
				? 'bg-amber-500 text-black font-semibold'
				: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}"
		>♩ Metronome</button>
	</div>

	{#if activePanel === 'transpose'}
		<div class="mt-2 pb-1">
			<TransposeControl
				originalKey={data.song.key}
				bind:offset={transposeOffset}
			/>
		</div>
	{/if}

	{#if activePanel === 'capo'}
		<div class="mt-2 pb-1 flex items-center gap-2">
			<button
				onclick={() => (capo = Math.max(0, capo - 1))}
				class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold text-zinc-200 transition-colors disabled:opacity-40"
				disabled={capo <= 0}
			>−</button>
			<div class="text-center min-w-[72px]">
				<span class="text-amber-400 font-bold text-lg">{capo === 0 ? 'No capo' : `Capo ${capo}`}</span>
			</div>
			<button
				onclick={() => (capo = Math.min(11, capo + 1))}
				class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold text-zinc-200 transition-colors disabled:opacity-40"
				disabled={capo >= 11}
			>+</button>
			{#if capo !== data.song.capo}
				<button
					onclick={() => (capo = data.song.capo)}
					class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-1"
					title="Reset to saved capo"
				>↺</button>
			{/if}
		</div>
	{/if}

	{#if activePanel === 'scroll'}
		<div class="mt-2 pb-1">
			<AutoScroll songId={data.song.id} />
		</div>
	{/if}

	{#if activePanel === 'metronome'}
		<div class="mt-2 pb-1">
			<Metronome bpm={data.song.bpm} timeSignature={data.song.timeSignature} />
		</div>
	{/if}
</div>

<!-- Lyrics -->
<div class="pb-32">
	{#if data.song.content}
		<LyricsRenderer
			content={data.song.content}
			transposeOffset={effectiveTranspose}
		/>
	{:else}
		<p class="text-zinc-500 text-sm">No lyrics yet. <a href="/songs/{data.song.id}/edit" class="text-amber-400 hover:text-amber-300">Add them →</a></p>
	{/if}

	{#if data.song.notes}
		<div class="mt-8 pt-4 border-t border-zinc-800">
			<p class="text-xs text-zinc-500 uppercase tracking-wider mb-2">Notes</p>
			<p class="text-zinc-400 text-sm whitespace-pre-wrap">{data.song.notes}</p>
		</div>
	{/if}
</div>
