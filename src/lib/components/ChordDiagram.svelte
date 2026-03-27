<script lang="ts">
	import type { ChordEntry } from '$lib/server/schema';

	let { chord }: { chord: ChordEntry } = $props();

	const STRING_COUNT = 6;
	const FRET_COUNT = 4;
	const CELL_W = 16;
	const CELL_H = 18;
	const MARGIN_TOP = 24;
	const MARGIN_LEFT = 20;
	const NUT_H = 5;
	const DOT_R = 6;

	const WIDTH = MARGIN_LEFT + (STRING_COUNT - 1) * CELL_W + 20;
	const HEIGHT = MARGIN_TOP + FRET_COUNT * CELL_H + 24;

	$derived.by(() => {});

	const fretPos: number[] = $derived(JSON.parse(chord.fretPositions));
	const fingers: number[] = $derived(JSON.parse(chord.fingers));
	const openMuted: string[] = $derived(JSON.parse(chord.openMuted));
	const barreFret: number | null = $derived(chord.barreFret ?? null);
	const barreStrings: number[] | null = $derived(chord.barreStrings ? JSON.parse(chord.barreStrings) : null);
	const startFret: number = $derived(chord.startFret ?? 1);

	// Dots to render: { x, y, finger }
	const dots: { cx: number; cy: number; finger: number }[] = $derived(
		fretPos
			.map((fret, i) => {
				if (fret <= 0) return null;
				const stringX = MARGIN_LEFT + (STRING_COUNT - 1 - i) * CELL_W;
				const adjustedFret = fret - startFret + 1;
				const fretY = MARGIN_TOP + (adjustedFret - 0.5) * CELL_H;
				return { cx: stringX, cy: fretY, finger: fingers[i] };
			})
			.filter((d): d is NonNullable<typeof d> => d !== null)
	);
</script>

<svg
	viewBox="0 0 {WIDTH} {HEIGHT}"
	width={WIDTH}
	height={HEIGHT}
	class="chord-diagram"
	role="img"
	aria-label="{chord.name} chord diagram"
>
	<!-- Nut or start fret indicator -->
	{#if startFret === 1}
		<rect x={MARGIN_LEFT - 1} y={MARGIN_TOP - NUT_H} width={(STRING_COUNT - 1) * CELL_W + 2} height={NUT_H} fill="currentColor" />
	{:else}
		<text x={MARGIN_LEFT - 4} y={MARGIN_TOP + CELL_H * 0.7} text-anchor="end" font-size="10" fill="currentColor">{startFret}fr</text>
	{/if}

	<!-- Fret lines -->
	{#each Array(FRET_COUNT + 1) as _, i}
		<line
			x1={MARGIN_LEFT}
			y1={MARGIN_TOP + i * CELL_H}
			x2={MARGIN_LEFT + (STRING_COUNT - 1) * CELL_W}
			y2={MARGIN_TOP + i * CELL_H}
			stroke="currentColor"
			stroke-width={i === 0 ? 1 : 0.75}
		/>
	{/each}

	<!-- String lines -->
	{#each Array(STRING_COUNT) as _, i}
		<line
			x1={MARGIN_LEFT + i * CELL_W}
			y1={MARGIN_TOP}
			x2={MARGIN_LEFT + i * CELL_W}
			y2={MARGIN_TOP + FRET_COUNT * CELL_H}
			stroke="currentColor"
			stroke-width="0.75"
		/>
	{/each}

	<!-- Barre -->
	{#if barreFret !== null && barreStrings}
		{@const adjustedFret = barreFret - startFret + 1}
		{@const x1 = MARGIN_LEFT + (STRING_COUNT - barreStrings[1]) * CELL_W}
		{@const x2 = MARGIN_LEFT + (STRING_COUNT - barreStrings[0]) * CELL_W}
		{@const cy = MARGIN_TOP + (adjustedFret - 0.5) * CELL_H}
		<rect
			x={x1}
			y={cy - DOT_R}
			width={x2 - x1}
			height={DOT_R * 2}
			rx={DOT_R}
			fill="currentColor"
			opacity="0.85"
		/>
	{/if}

	<!-- Dots -->
	{#each dots as dot}
		<circle cx={dot.cx} cy={dot.cy} r={DOT_R} fill="currentColor" />
		{#if dot.finger > 0}
			<text x={dot.cx} y={dot.cy + 4} text-anchor="middle" font-size="8" fill="white">{dot.finger}</text>
		{/if}
	{/each}

	<!-- Open / Muted indicators above nut -->
	{#each openMuted as indicator, i}
		{@const x = MARGIN_LEFT + (STRING_COUNT - 1 - i) * CELL_W}
		{#if indicator === 'o'}
			<circle cx={x} cy={MARGIN_TOP - NUT_H - 6} r={4} fill="none" stroke="currentColor" stroke-width="1.5" />
		{:else if indicator === 'x'}
			<text x={x} y={MARGIN_TOP - NUT_H - 2} text-anchor="middle" font-size="10" fill="currentColor">×</text>
		{/if}
	{/each}
</svg>
