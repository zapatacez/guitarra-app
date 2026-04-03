<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	let offline = $state(false);

	onMount(() => {
		offline = !navigator.onLine;
		const setOnline = () => (offline = false);
		const setOffline = () => (offline = true);
		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOffline);
		return () => {
			window.removeEventListener('online', setOnline);
			window.removeEventListener('offline', setOffline);
		};
	});
</script>

<svelte:head>
	<title>Guitarra</title>
</svelte:head>

<div class="min-h-screen bg-zinc-900 text-zinc-100">
	<header class="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800" style="padding-top: env(safe-area-inset-top)">
		<nav class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between" style="padding-left: max(1rem, env(safe-area-inset-left)); padding-right: max(1rem, env(safe-area-inset-right))">
			<a href="/" class="text-amber-400 font-bold text-lg tracking-tight">
				🎸 Guitarra
			</a>
			<div class="flex items-center gap-2">
				{#if offline}
					<span class="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">Offline</span>
				{/if}
				<a
					href="/songs/new"
					class="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3 py-1.5 rounded-md transition-colors text-sm"
				>+ New Song</a>
			</div>
		</nav>
	</header>

	<main class="max-w-3xl mx-auto px-4 py-6" style="padding-left: max(1rem, env(safe-area-inset-left)); padding-right: max(1rem, env(safe-area-inset-right)); padding-bottom: max(1.5rem, env(safe-area-inset-bottom))">
		{@render children()}
	</main>
</div>
