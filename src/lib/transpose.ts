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

// Chord-above-lyrics format: transpose chord tokens on chord lines only
const CHORD_NAME_RE =
	/^(?:N\.C\.|[A-G][#b]?(?:m(?:aj)?7?|maj7?|dim7?|aug|sus[24]?|add\d+|[679]|11|13|m7b5|6\/9)?(?:\/[A-G][#b]?)?)$/;

function isChordToken(s: string): boolean {
	return CHORD_NAME_RE.test(s);
}

function isChordLine(line: string): boolean {
	if (!line.trim()) return false;
	const tokens = line.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return false;
	const chordCount = tokens.filter(isChordToken).length;
	return chordCount >= 1 && chordCount / tokens.length >= 0.6;
}

export function transposeContent(content: string, semitones: number, preferFlats = false): string {
	if (semitones === 0) return content;
	return content
		.split('\n')
		.map((line) => {
			if (!isChordLine(line)) return line;
			// Replace each chord token in the line, preserving spacing
			return line.replace(/\S+/g, (token) =>
				isChordToken(token) ? transposeChord(token, semitones, preferFlats) : token
			);
		})
		.join('\n');
}

export function getTransposedKey(key: string, semitones: number): string {
	const preferFlats = FLAT_KEYS.has(key);
	return transposeChord(key, semitones, preferFlats);
}

export function shouldPreferFlats(key: string): boolean {
	return FLAT_KEYS.has(key);
}

// ── Key detection ─────────────────────────────────────────────────────────────

// Matches chord root notes (strips quality/modifiers)
const ROOT_RE = /^[A-G][#b]?/;

// All 12 keys in guitar-friendly notation (matches SongForm KEYS array)
const KEY_CANDIDATES = [
	{ name: 'C',  semitone: 0  },
	{ name: 'C#', semitone: 1  },
	{ name: 'D',  semitone: 2  },
	{ name: 'Eb', semitone: 3  },
	{ name: 'E',  semitone: 4  },
	{ name: 'F',  semitone: 5  },
	{ name: 'F#', semitone: 6  },
	{ name: 'G',  semitone: 7  },
	{ name: 'Ab', semitone: 8  },
	{ name: 'A',  semitone: 9  },
	{ name: 'Bb', semitone: 10 },
	{ name: 'B',  semitone: 11 },
];

// Semitone intervals of a major scale: W W H W W W H
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

export function detectKey(content: string): string {
	// Extract all chord root semitones from chord lines
	const rootSemitones: number[] = [];
	for (const line of content.split('\n')) {
		if (!isChordLine(line)) continue;
		for (const token of line.trim().split(/\s+/)) {
			const match = token.match(ROOT_RE);
			if (match) {
				const idx = noteIndex(match[0]);
				if (idx !== -1) rootSemitones.push(idx);
			}
		}
	}

	if (rootSemitones.length === 0) return 'C';

	// Score each candidate key by how many chord roots fall on a diatonic note
	let bestKey = 'C';
	let bestScore = -1;

	for (const { name, semitone } of KEY_CANDIDATES) {
		const diatonic = new Set(MAJOR_INTERVALS.map((i) => (semitone + i) % 12));
		const score = rootSemitones.filter((s) => diatonic.has(s)).length;
		if (score > bestScore) {
			bestScore = score;
			bestKey = name;
		}
	}

	return bestKey;
}
