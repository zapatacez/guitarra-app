const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Keys that prefer flats
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

function noteIndex(note: string): number {
	let idx = SHARPS.indexOf(note);
	if (idx === -1) idx = FLATS.indexOf(note);
	return idx;
}

function transposeNote(note: string, semitones: number, preferFlats: boolean): string {
	const idx = noteIndex(note);
	if (idx === -1) return note;
	const newIdx = ((idx + semitones) % 12 + 12) % 12;
	const scale = preferFlats ? FLATS : SHARPS;
	return scale[newIdx];
}

// Parse root note (1 or 2 chars: letter + optional # or b)
function parseRoot(chord: string): [string, string] {
	if (chord.length > 1 && (chord[1] === '#' || chord[1] === 'b')) {
		return [chord.slice(0, 2), chord.slice(2)];
	}
	return [chord[0], chord.slice(1)];
}

export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
	if (semitones === 0) return chord;

	// Handle slash chords: G/B
	const slashIdx = chord.indexOf('/');
	if (slashIdx !== -1) {
		const base = chord.slice(0, slashIdx);
		const bass = chord.slice(slashIdx + 1);
		return transposeChord(base, semitones, preferFlats) + '/' + transposeNote(bass, semitones, preferFlats);
	}

	const [root, quality] = parseRoot(chord);
	const newRoot = transposeNote(root, semitones, preferFlats);
	return newRoot + quality;
}

export function transposeContent(content: string, semitones: number, preferFlats = false): string {
	if (semitones === 0) return content;
	return content.replace(/\[([A-G][#b]?(?:[^[\]]*)?)\]/g, (_, chord) => {
		return `[${transposeChord(chord, semitones, preferFlats)}]`;
	});
}

export function getTransposedKey(key: string, semitones: number): string {
	const preferFlats = FLAT_KEYS.has(key);
	return transposeChord(key, semitones, preferFlats);
}

export function shouldPreferFlats(key: string): boolean {
	return FLAT_KEYS.has(key);
}
