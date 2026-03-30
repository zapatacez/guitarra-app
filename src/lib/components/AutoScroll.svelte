<script lang="ts">
	let { songId }: { songId: number } = $props();

	const SPEED_KEY = $derived(`autoscroll_speed_${songId}`);

	let running = $state(false);
	let speed = $state(Number(typeof localStorage !== 'undefined' ? (localStorage.getItem(SPEED_KEY) ?? '8') : '8'));
	let rafId: number | null = null;
	let lastTime: number | null = null;
	let userScrolling = false;
	let resumeTimer: ReturnType<typeof setTimeout> | null = null;

	function saveSpeed() {
		if (typeof localStorage !== 'undefined') localStorage.setItem(SPEED_KEY, String(speed));
	}

	function tick(now: number) {
		if (!running) return;
		if (lastTime !== null && !userScrolling) {
			const delta = now - lastTime;
			window.scrollBy(0, (speed * delta) / 1000);
		}
		lastTime = now;
		rafId = requestAnimationFrame(tick);
	}

	function start() {
		running = true;
		lastTime = null;
		rafId = requestAnimationFrame(tick);
	}

	function stop() {
		running = false;
		if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
	}

	function toggle() {
		running ? stop() : start();
	}

	function onWheel() {
		userScrolling = true;
		if (resumeTimer) clearTimeout(resumeTimer);
		resumeTimer = setTimeout(() => { userScrolling = false; }, 2000);
	}

	$effect(() => {
		window.addEventListener('wheel', onWheel, { passive: true });
		window.addEventListener('touchmove', onWheel, { passive: true });
		return () => {
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchmove', onWheel);
			stop();
		};
	});
</script>

<div class="flex items-center gap-2 flex-wrap">
	<button
		onclick={toggle}
		class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {running
			? 'bg-amber-500 text-black hover:bg-amber-400'
			: 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'}"
		title="Auto-scroll (Space)"
	>
		{running ? '⏸ Scroll' : '▶ Scroll'}
	</button>

	<div class="flex items-center gap-2">
		<button
			onclick={() => { speed = Math.max(2, speed - 2); saveSpeed(); }}
			class="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-bold transition-colors"
			title="Slower"
		>−</button>
		<input
			type="range"
			min="2"
			max="60"
			step="1"
			bind:value={speed}
			oninput={saveSpeed}
			class="w-20 accent-amber-500"
			title="Scroll speed"
		/>
		<button
			onclick={() => { speed = Math.min(60, speed + 2); saveSpeed(); }}
			class="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 rounded text-sm font-bold transition-colors"
			title="Faster"
		>+</button>
	</div>

	<button
		onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		class="px-2 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300 transition-colors"
		title="Scroll to top"
	>↑ Top</button>
</div>
