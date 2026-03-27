<script lang="ts">
	let { bpm: initialBpm = 100, timeSignature = '4/4' }: { bpm?: number; timeSignature?: string } = $props();

	let bpm = $state(0);
	$effect.pre(() => { if (bpm === 0) bpm = initialBpm; });
	let running = $state(false);
	let currentBeat = $state(0);
	let accentBeat = $state(false);

	const [beatsPerBar] = $derived(timeSignature.split('/').map(Number));

	let audioCtx: AudioContext | null = null;
	let nextNoteTime = 0;
	let schedulerTimer: ReturnType<typeof setTimeout> | null = null;
	let beatCounter = 0;

	const LOOKAHEAD = 0.1; // seconds
	const SCHEDULE_INTERVAL = 25; // ms

	function getAudioCtx(): AudioContext {
		if (!audioCtx) audioCtx = new AudioContext();
		return audioCtx;
	}

	function scheduleNote(beat: number, time: number) {
		const ctx = getAudioCtx();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.frequency.value = beat === 0 ? 880 : 440;
		gain.gain.setValueAtTime(beat === 0 ? 0.7 : 0.4, time);
		gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(time);
		osc.stop(time + 0.08);

		// Visual update (approximate)
		const delay = (time - ctx.currentTime) * 1000;
		setTimeout(() => {
			currentBeat = beat;
			accentBeat = beat === 0;
		}, Math.max(0, delay));
	}

	function advanceBeat() {
		const secondsPerBeat = 60 / bpm;
		nextNoteTime += secondsPerBeat;
		beatCounter = (beatCounter + 1) % beatsPerBar;
	}

	function scheduler() {
		const ctx = getAudioCtx();
		while (nextNoteTime < ctx.currentTime + LOOKAHEAD) {
			scheduleNote(beatCounter, nextNoteTime);
			advanceBeat();
		}
		schedulerTimer = setTimeout(scheduler, SCHEDULE_INTERVAL);
	}

	function start() {
		const ctx = getAudioCtx();
		if (ctx.state === 'suspended') ctx.resume();
		beatCounter = 0;
		nextNoteTime = ctx.currentTime + 0.05;
		running = true;
		scheduler();
	}

	function stop() {
		running = false;
		currentBeat = 0;
		accentBeat = false;
		if (schedulerTimer) { clearTimeout(schedulerTimer); schedulerTimer = null; }
	}

	function toggle() {
		running ? stop() : start();
	}

	// Tap tempo
	let tapTimes: number[] = [];
	function tapTempo() {
		const now = Date.now();
		if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 3000) {
			tapTimes = [];
		}
		tapTimes.push(now);
		if (tapTimes.length > 1) {
			const diffs = tapTimes.slice(1).map((t, i) => t - tapTimes[i]);
			const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
			bpm = Math.round(60000 / avg);
		}
		if (tapTimes.length > 4) tapTimes = tapTimes.slice(-4);
	}

	$effect(() => {
		return () => stop();
	});
</script>

<div class="space-y-3">
	<div class="flex items-center gap-3 flex-wrap">
		<button
			onclick={toggle}
			class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[90px] {running
				? 'bg-amber-500 text-black hover:bg-amber-400'
				: 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'}"
		>
			{running ? '⏹ Stop' : '▶ Click'}
		</button>

		<!-- Beat indicator dots -->
		<div class="flex gap-1.5">
			{#each Array(beatsPerBar) as _, i}
				<div
					class="w-4 h-4 rounded-full transition-all duration-75 {currentBeat === i && running
						? i === 0 ? 'bg-amber-400 scale-125' : 'bg-zinc-300 scale-110'
						: 'bg-zinc-700'}"
				></div>
			{/each}
		</div>

		<button
			onclick={tapTempo}
			class="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300 transition-colors"
		>Tap</button>
	</div>

	<div class="flex items-center gap-3">
		<button
			onclick={() => (bpm = Math.max(20, bpm - 1))}
			class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold transition-colors"
		>−</button>

		<div class="flex items-center gap-2 flex-1">
			<input
				type="range"
				min="20"
				max="300"
				bind:value={bpm}
				class="flex-1 accent-amber-500"
			/>
			<span class="text-amber-400 font-mono font-bold text-sm w-12 text-right">{bpm} BPM</span>
		</div>

		<button
			onclick={() => (bpm = Math.min(300, bpm + 1))}
			class="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold transition-colors"
		>+</button>
	</div>
</div>
