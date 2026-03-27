// Wraps @tombatossals/chords-db to resolve any chord name to a position object
// that our ChordDiagram component can render.

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
	frets: number[];       // 6 values, -1=muted, 0=open
	fingers: number[];     // 6 values, 0=open
	baseFret: number;
	barres: number[];      // fret numbers that are barred across all strings
}

function parseChordName(name: string): { root: string; suffix: string } | null {
	if (name === 'N.C.') return null;
	const m = name.match(/^([A-G][#b]?)(.*)$/);
	if (!m) return null;
	return { root: m[1], suffix: m[2] };
}

export function lookupChord(chordName: string): ChordPosition | null {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const db = require('@tombatossals/chords-db/lib/guitar.json') as {
		chords: Record<string, Array<{ suffix: string; positions: ChordPosition[] }>>;
	};

	const parsed = parseChordName(chordName);
	if (!parsed) return null;

	const dbKey = KEY_MAP[parsed.root];
	if (!dbKey || !db.chords[dbKey]) return null;

	const chordGroup = db.chords[dbKey];

	// Try exact suffix match first
	const dbSuffix = SUFFIX_MAP[parsed.suffix];
	if (dbSuffix) {
		const entry = chordGroup.find((c) => c.suffix === dbSuffix);
		if (entry?.positions.length) {
			// Prefer open position (baseFret === 1) when available
			const open = entry.positions.find((p) => p.baseFret === 1);
			return open ?? entry.positions[0];
		}
	}

	// Fallback: try base chord without extensions (e.g. B7add11 → B7, then B)
	const baseVariants = [
		parsed.suffix.replace(/add\d+/, ''),   // strip add9/add11
		parsed.suffix.replace(/b\d+/, ''),      // strip b5/b9
		parsed.suffix.replace(/sus[24]?/, ''),  // strip sus
		parsed.suffix.match(/^m/)?.[0] ?? '',   // just 'm'
		''                                       // major
	];

	for (const variant of baseVariants) {
		if (variant === parsed.suffix) continue;
		const fallbackSuffix = SUFFIX_MAP[variant];
		if (!fallbackSuffix) continue;
		const entry = chordGroup.find((c) => c.suffix === fallbackSuffix);
		if (entry?.positions.length) {
			const open = entry.positions.find((p) => p.baseFret === 1);
			return open ?? entry.positions[0];
		}
	}

	return null;
}
