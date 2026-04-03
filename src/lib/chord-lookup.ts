// Wraps @tombatossals/chords-db to resolve any chord name to a position object
// that our ChordDiagram component can render.
import guitarDb from '@tombatossals/chords-db/lib/guitar.json';

// Database key names use "Csharp"/"Fsharp" instead of "C#"/"F#"
const KEY_MAP: Record<string, string> = {
	'C': 'C', 'C#': 'Csharp', 'Db': 'Csharp',
	'D': 'D', 'D#': 'Eb',     'Eb': 'Eb',
	'E': 'E',
	'F': 'F', 'F#': 'Fsharp', 'Gb': 'Fsharp',
	'G': 'G', 'G#': 'Ab',     'Ab': 'Ab',
	'A': 'A', 'A#': 'Bb',     'Bb': 'Bb',
	'B': 'B'
};

// Maps common chord suffix notation → database suffix names
const SUFFIX_MAP: Record<string, string> = {
	'':       'major',
	'maj':    'major',
	'major':  'major',
	'm':      'minor',
	'min':    'minor',
	'minor':  'minor',
	'7':      '7',
	'm7':     'm7',
	'maj7':   'maj7',
	'M7':     'maj7',
	'dim':    'dim',
	'dim7':   'dim7',
	'aug':    'aug',
	'sus2':   'sus2',
	'sus4':   'sus4',
	'sus':    'sus4',
	'6':      '6',
	'm6':     'm6',
	'9':      '9',
	'm9':     'm9',
	'maj9':   'maj9',
	'11':     '11',
	'13':     '13',
	'add9':   'add9',
	'madd9':  'madd9',
	'm7b5':   'm7b5',
	'7b5':    '7b5',
	'aug7':   'aug7',
	'7sus4':  '7sus4',
};

export interface ChordPosition {
	frets: number[];
	fingers: number[];
	baseFret: number;
	barres: number[];
}

type GuitarDb = {
	chords: Record<string, Array<{ suffix: string; positions: ChordPosition[] }>>;
};

const db = guitarDb as unknown as GuitarDb;

function parseChordName(name: string): { root: string; suffix: string } | null {
	if (name === 'N.C.') return null;
	const m = name.match(/^([A-G][#b]?)(.*)$/);
	if (!m) return null;
	return { root: m[1], suffix: m[2] };
}

export function lookupChord(chordName: string): ChordPosition | null {
	// Strip slash bass note: D7(9)/A → D7(9) for lookup purposes
	const name = chordName.replace(/\/[A-G][#b]?$/, '');
	const parsed = parseChordName(name);
	if (!parsed) return null;

	const dbKey = KEY_MAP[parsed.root];
	if (!dbKey || !db.chords[dbKey]) return null;

	const chordGroup = db.chords[dbKey];

	function find(suffix: string): ChordPosition | null {
		const dbSuffix = SUFFIX_MAP[suffix];
		if (!dbSuffix) return null;
		const entry = chordGroup.find((c) => c.suffix === dbSuffix);
		return entry?.positions[0] ?? null;
	}

	const raw = parsed.suffix;
	// Normalize M-major suffix: 7M → maj7, M7 already in SUFFIX_MAP
	const normalizeM = (s: string) => s.replace(/(\d+)M$/, 'maj$1');
	// Strip parenthesized extensions: C7(9) → C7, Bm7(b5) → Bm7
	const noParens = raw.replace(/\([^)]*\)/g, '');
	// Unwrap flat extensions: (b5) → b5 (for m7b5 lookup)
	const unwrappedFlat = raw.replace(/\(b(\d+)\)/g, 'b$1');

	const variants = [
		raw,
		normalizeM(raw),
		unwrappedFlat,
		noParens,
		normalizeM(noParens),
		noParens.replace(/add\d+/, ''),
		noParens.replace(/b\d+/, ''),
		raw.startsWith('m') ? noParens.match(/^m\d*/)?.[0] ?? 'm' : null,
		raw.startsWith('m') ? 'm' : null,
		'',
	].filter((v): v is string => v !== null);

	for (const v of variants) {
		const pos = find(v);
		if (pos) return pos;
	}

	return null;
}
