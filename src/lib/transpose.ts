import { Interval, Note, Key } from 'tonal';

// Keys that prefer flat notation in guitar convention
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

// Theoretical spellings that never appear in guitar music — normalize immediately
const WEIRD_NOTES = new Set(['Cb', 'Fb', 'E#', 'B#']);

function transposeNote(note: string, semitones: number, preferFlats: boolean): string {
	if (semitones === 0) return note;
	let result = Note.transpose(note, Interval.fromSemitones(semitones));
	if (!result) return note;

	// Normalize unusual spellings (Cb→B, Fb→E, E#→F, B#→C)
	if (WEIRD_NOTES.has(result)) result = Note.enharmonic(result) || result;

	// Apply sharp/flat preference
	if (!preferFlats && result.includes('b')) return Note.enharmonic(result) || result;
	if (preferFlats && result.includes('#')) return Note.enharmonic(result) || result;

	return result;
}

// Parse root note: "Am7" → ["A", "m7"], "F#m" → ["F#", "m"]
function parseRoot(chord: string): [string, string] {
	if (chord.length > 1 && (chord[1] === '#' || chord[1] === 'b')) {
		return [chord.slice(0, 2), chord.slice(2)];
	}
	return [chord[0], chord.slice(1)];
}

export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
	if (semitones === 0) return chord;

	// Handle slash chords: G/B, D7(9)/A — only split on /[Note] at end of string
	const slashIdx = chord.search(/\/[A-G][#b]?$/);
	if (slashIdx !== -1) {
		const base = chord.slice(0, slashIdx);
		const bass = chord.slice(slashIdx + 1);
		return transposeChord(base, semitones, preferFlats) + '/' + transposeNote(bass, semitones, preferFlats);
	}

	const [root, quality] = parseRoot(chord);
	return transposeNote(root, semitones, preferFlats) + quality;
}

// ── Chord-line detection ──────────────────────────────────────────────────────

const CHORD_NAME_RE =
	/^(?:N\.C\.|[A-G][#b]?(?:(?:m(?:aj)?|M|dim7?|aug|sus[24]?)?(?:\d+)?M?(?:\([^)]+\))*(?:add\d+)?(?:b\d+)?)?(?:\/[A-G][#b]?)?)$/;

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

// ── Transposing content ───────────────────────────────────────────────────────

export function transposeContent(content: string, semitones: number, preferFlats = false): string {
	if (semitones === 0) return content;
	return content
		.split('\n')
		.map((line) => {
			// Inline chord format [Chord]word — section headers like [Verse 1] pass
			// through unchanged because isChordToken('Verse 1') is false
			if (/\[[^\]]+\]/.test(line)) {
				return line.replace(/\[([^\]]+)\]/g, (match, chord) =>
					isChordToken(chord) ? `[${transposeChord(chord, semitones, preferFlats)}]` : match
				);
			}
			// Chord-above-lyrics format
			if (!isChordLine(line)) return line;
			return line.replace(/\S+/g, (token) =>
				isChordToken(token) ? transposeChord(token, semitones, preferFlats) : token
			);
		})
		.join('\n');
}

export function getTransposedKey(key: string, semitones: number): string {
	return transposeChord(key, semitones, FLAT_KEYS.has(key));
}

export function shouldPreferFlats(key: string): boolean {
	return FLAT_KEYS.has(key);
}

// ── Key detection ─────────────────────────────────────────────────────────────

const GUITAR_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function detectKey(content: string): string {
	const roots: string[] = [];

	for (const line of content.split('\n')) {
		if (isChordLine(line)) {
			for (const token of line.trim().split(/\s+/)) {
				const m = token.match(/^([A-G][#b]?)/);
				if (m) roots.push(m[1]);
			}
		} else if (/\[[^\]]+\]/.test(line)) {
			for (const m of line.match(/\[([^\]]+)\]/g) ?? []) {
				const chord = m.slice(1, -1);
				if (isChordToken(chord)) {
					const rootMatch = chord.match(/^([A-G][#b]?)/);
					if (rootMatch) roots.push(rootMatch[1]);
				}
			}
		}
	}

	if (roots.length === 0) return 'C';

	let bestKey = 'C';
	let bestScore = -1;

	for (const key of GUITAR_KEYS) {
		const scale = new Set(Key.majorKey(key).scale);
		const score = roots.filter(
			(r) => scale.has(r) || scale.has(Note.enharmonic(r) ?? '')
		).length;
		if (score > bestScore) {
			bestScore = score;
			bestKey = key;
		}
	}

	return bestKey;
}
