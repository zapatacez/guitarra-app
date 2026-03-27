<script lang="ts">
	import SongForm from '$lib/components/SongForm.svelte';
</script>

<svelte:head>
	<title>New Song — Guitarra</title>
</svelte:head>

<div class="space-y-4">
	<h1 class="text-xl font-bold text-zinc-100">New Song</h1>
	<SongForm action="?/create" />
</div>
