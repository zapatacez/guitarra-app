<script lang="ts">
	import type { Song } from '$lib/server/schema';

	let { song, action }: { song?: Partial<Song>; action: string } = $props();

	const KEYS = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
	const TIME_SIGS = ['4/4','3/4','6/8','2/4','12/8'];
</script>

<form method="POST" {action} class="space-y-5">
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class="sm:col-span-2">
			<label class="block text-sm text-zinc-400 mb-1" for="title">Title *</label>
			<input
				id="title"
				name="title"
				type="text"
				required
				value={song?.title ?? ''}
				class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
				placeholder="Song title"
			/>
		</div>

		<div>
			<label class="block text-sm text-zinc-400 mb-1" for="artist">Artist</label>
			<input
				id="artist"
				name="artist"
				type="text"
				value={song?.artist ?? ''}
				class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
				placeholder="Artist name"
			/>
		</div>

		<div>
			<label class="block text-sm text-zinc-400 mb-1" for="key">Key</label>
			<select
				id="key"
				name="key"
				class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
			>
				{#each KEYS as k}
					<option value={k} selected={song?.key === k}>{k}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm text-zinc-400 mb-1" for="capo">Capo</label>
			<input
				id="capo"
				name="capo"
				type="number"
				min="0"
				max="11"
				value={song?.capo ?? 0}
				class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
			/>
		</div>

		<div>
			<label class="block text-sm text-zinc-400 mb-1" for="bpm">BPM</label>
			<input
				id="bpm"
				name="bpm"
				type="number"
				min="20"
				max="300"
				value={song?.bpm ?? 100}
				class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
			/>
		</div>

		<div>
			<label class="block text-sm text-zinc-400 mb-1" for="time_signature">Time Signature</label>
			<select
				id="time_signature"
				name="time_signature"
				class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm"
			>
				{#each TIME_SIGS as ts}
					<option value={ts} selected={song?.timeSignature === ts}>{ts}</option>
				{/each}
			</select>
		</div>
	</div>

	<div>
		<label class="block text-sm text-zinc-400 mb-1" for="content">
			Lyrics & Chords
			<span class="text-zinc-600 ml-1">— use [G], [Am], [C] etc. to mark chords</span>
		</label>
		<textarea
			id="content"
			name="content"
			rows="20"
			class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm font-mono resize-y"
			placeholder="[G]Let her [C]go..."
		>{song?.content ?? ''}</textarea>
		<p class="text-xs text-zinc-600 mt-1">Example: <code class="text-zinc-500">[G]When I [C]find myself in [D]times of trouble</code></p>
	</div>

	<div>
		<label class="block text-sm text-zinc-400 mb-1" for="notes">Notes</label>
		<textarea
			id="notes"
			name="notes"
			rows="2"
			class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 text-sm resize-y"
			placeholder="Optional notes about the song…"
		>{song?.notes ?? ''}</textarea>
	</div>

	<div class="flex gap-3 pt-2">
		<button
			type="submit"
			class="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2.5 rounded-lg transition-colors"
		>Save Song</button>
		<a href="/" class="px-5 py-2.5 text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</a>
	</div>
</form>
