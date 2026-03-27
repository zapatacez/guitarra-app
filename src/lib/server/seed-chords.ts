import { db } from './db';
import { chordLibrary } from './schema';

// fretPositions: array of 6 fret numbers (string 6=low E to string 1=high e), 0=open, -1=muted
// fingers: which finger (1=index,2=middle,3=ring,4=pinky), 0=open,-1=muted
// openMuted: 'o'=open, 'x'=muted, ''=fretted (per string, 6 to 1)

const CHORDS = [
	// ── BASIC (open chords) ──────────────────────────────────────────
	{ name: 'C',   difficulty: 'basic', startFret: 1, fretPositions: [-1,3,2,0,1,0], fingers: [-1,3,2,0,1,0], openMuted: ['x','','','o','','o'] },
	{ name: 'D',   difficulty: 'basic', startFret: 1, fretPositions: [-1,-1,0,2,3,2], fingers: [-1,-1,0,1,3,2], openMuted: ['x','x','o','','',''] },
	{ name: 'Dm',  difficulty: 'basic', startFret: 1, fretPositions: [-1,-1,0,2,3,1], fingers: [-1,-1,0,2,3,1], openMuted: ['x','x','o','','',''] },
	{ name: 'E',   difficulty: 'basic', startFret: 1, fretPositions: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0], openMuted: ['o','','','','o','o'] },
	{ name: 'Em',  difficulty: 'basic', startFret: 1, fretPositions: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0], openMuted: ['o','','','o','o','o'] },
	{ name: 'F',   difficulty: 'basic', startFret: 1, fretPositions: [-1,-1,3,2,1,1], fingers: [-1,-1,3,2,1,1], openMuted: ['x','x','','','',''] },
	{ name: 'G',   difficulty: 'basic', startFret: 1, fretPositions: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3], openMuted: ['','','o','o','o',''] },
	{ name: 'A',   difficulty: 'basic', startFret: 1, fretPositions: [-1,0,2,2,2,0], fingers: [-1,0,2,3,4,0], openMuted: ['x','o','','','','o'] },
	{ name: 'Am',  difficulty: 'basic', startFret: 1, fretPositions: [-1,0,2,2,1,0], fingers: [-1,0,2,3,1,0], openMuted: ['x','o','','','','o'] },
	{ name: 'B7',  difficulty: 'basic', startFret: 1, fretPositions: [-1,2,1,2,0,2], fingers: [-1,2,1,3,0,4], openMuted: ['x','','','','o',''] },
	{ name: 'E7',  difficulty: 'basic', startFret: 1, fretPositions: [0,2,0,1,0,0], fingers: [0,2,0,1,0,0], openMuted: ['o','','o','','o','o'] },
	{ name: 'A7',  difficulty: 'basic', startFret: 1, fretPositions: [-1,0,2,0,2,0], fingers: [-1,0,2,0,3,0], openMuted: ['x','o','','o','','o'] },
	{ name: 'D7',  difficulty: 'basic', startFret: 1, fretPositions: [-1,-1,0,2,1,2], fingers: [-1,-1,0,2,1,3], openMuted: ['x','x','o','','',''] },
	{ name: 'G7',  difficulty: 'basic', startFret: 1, fretPositions: [3,2,0,0,0,1], fingers: [3,2,0,0,0,1], openMuted: ['','','o','o','o',''] },
	{ name: 'C7',  difficulty: 'basic', startFret: 1, fretPositions: [-1,3,2,3,1,0], fingers: [-1,3,2,4,1,0], openMuted: ['x','','','','','o'] },

	// ── INTERMEDIATE ─────────────────────────────────────────────────
	{ name: 'Bm',  difficulty: 'intermediate', startFret: 2, fretPositions: [-1,2,4,4,3,2], fingers: [-1,1,3,4,2,1], openMuted: ['x','','','','',''], barreFret: 2, barreStrings: [1,5] },
	{ name: 'F#m', difficulty: 'intermediate', startFret: 2, fretPositions: [2,4,4,2,2,2], fingers: [1,3,4,1,1,1], openMuted: ['','','','','',''], barreFret: 2, barreStrings: [1,6] },
	{ name: 'Cmaj7', difficulty: 'intermediate', startFret: 1, fretPositions: [-1,3,2,0,0,0], fingers: [-1,3,2,0,0,0], openMuted: ['x','','','o','o','o'] },
	{ name: 'Dmaj7', difficulty: 'intermediate', startFret: 1, fretPositions: [-1,-1,0,2,2,2], fingers: [-1,-1,0,1,2,3], openMuted: ['x','x','o','','',''] },
	{ name: 'Emaj7', difficulty: 'intermediate', startFret: 1, fretPositions: [0,2,1,1,0,0], fingers: [0,3,1,2,0,0], openMuted: ['o','','','','o','o'] },
	{ name: 'Am7',   difficulty: 'intermediate', startFret: 1, fretPositions: [-1,0,2,0,1,0], fingers: [-1,0,2,0,1,0], openMuted: ['x','o','','o','','o'] },
	{ name: 'Em7',   difficulty: 'intermediate', startFret: 1, fretPositions: [0,2,2,0,3,0], fingers: [0,1,2,0,3,0], openMuted: ['o','','','o','','o'] },
	{ name: 'Dm7',   difficulty: 'intermediate', startFret: 1, fretPositions: [-1,-1,0,2,1,1], fingers: [-1,-1,0,2,1,1], openMuted: ['x','x','o','','',''] },
	{ name: 'G#m',   difficulty: 'intermediate', startFret: 4, fretPositions: [4,6,6,5,4,4], fingers: [1,3,4,2,1,1], openMuted: ['','','','','',''], barreFret: 4, barreStrings: [1,6] },
	{ name: 'Gsus4', difficulty: 'intermediate', startFret: 1, fretPositions: [3,3,0,0,1,3], fingers: [2,3,0,0,1,4], openMuted: ['','','o','o','',''] },
	{ name: 'Asus2', difficulty: 'intermediate', startFret: 1, fretPositions: [-1,0,2,2,0,0], fingers: [-1,0,1,2,0,0], openMuted: ['x','o','','','o','o'] },
	{ name: 'Dsus2', difficulty: 'intermediate', startFret: 1, fretPositions: [-1,-1,0,2,3,0], fingers: [-1,-1,0,1,3,0], openMuted: ['x','x','o','','','o'] },
	{ name: 'Cadd9', difficulty: 'intermediate', startFret: 1, fretPositions: [-1,3,2,0,3,0], fingers: [-1,3,2,0,4,0], openMuted: ['x','','','o','','o'] },

	// ── ADVANCED ─────────────────────────────────────────────────────
	{ name: 'F',    difficulty: 'advanced', startFret: 1, fretPositions: [1,3,3,2,1,1], fingers: [1,3,4,2,1,1], openMuted: ['','','','','',''], barreFret: 1, barreStrings: [1,6] },
	{ name: 'Bm',   difficulty: 'advanced', startFret: 2, fretPositions: [2,2,4,4,3,2], fingers: [1,1,3,4,2,1], openMuted: ['','','','','',''], barreFret: 2, barreStrings: [1,6] },
	{ name: 'B',    difficulty: 'advanced', startFret: 2, fretPositions: [-1,2,4,4,4,2], fingers: [-1,1,2,3,4,1], openMuted: ['x','','','','',''], barreFret: 2, barreStrings: [1,5] },
	{ name: 'Cm',   difficulty: 'advanced', startFret: 3, fretPositions: [3,3,5,5,4,3], fingers: [1,1,3,4,2,1], openMuted: ['','','','','',''], barreFret: 3, barreStrings: [1,6] },
	{ name: 'C#m',  difficulty: 'advanced', startFret: 4, fretPositions: [4,4,6,6,5,4], fingers: [1,1,3,4,2,1], openMuted: ['','','','','',''], barreFret: 4, barreStrings: [1,6] },
	{ name: 'Ebm',  difficulty: 'advanced', startFret: 6, fretPositions: [6,6,8,8,7,6], fingers: [1,1,3,4,2,1], openMuted: ['','','','','',''], barreFret: 6, barreStrings: [1,6] },
	{ name: 'Gm',   difficulty: 'advanced', startFret: 3, fretPositions: [3,5,5,3,3,3], fingers: [1,3,4,1,1,1], openMuted: ['','','','','',''], barreFret: 3, barreStrings: [1,6] },
	{ name: 'Fm',   difficulty: 'advanced', startFret: 1, fretPositions: [1,3,3,1,1,1], fingers: [1,3,4,1,1,1], openMuted: ['','','','','',''], barreFret: 1, barreStrings: [1,6] },
	{ name: 'Gmaj7', difficulty: 'advanced', startFret: 2, fretPositions: [3,2,0,0,0,2], fingers: [3,2,0,0,0,1], openMuted: ['','','o','o','o',''] },
	{ name: 'Fmaj7', difficulty: 'advanced', startFret: 1, fretPositions: [-1,-1,3,2,1,0], fingers: [-1,-1,3,2,1,0], openMuted: ['x','x','','','','o'] },
	{ name: 'Bb',    difficulty: 'advanced', startFret: 1, fretPositions: [-1,1,3,3,3,1], fingers: [-1,1,2,3,4,1], openMuted: ['x','','','','',''], barreFret: 1, barreStrings: [1,5] },
	{ name: 'Eb',    difficulty: 'advanced', startFret: 6, fretPositions: [-1,6,8,8,8,6], fingers: [-1,1,2,3,4,1], openMuted: ['x','','','','',''], barreFret: 6, barreStrings: [1,5] },
];

export async function seedChords() {
	const existing = await db.select().from(chordLibrary).limit(1);
	if (existing.length > 0) return; // already seeded

	for (const chord of CHORDS) {
		await db.insert(chordLibrary).values({
			name: chord.name,
			difficulty: chord.difficulty as 'basic' | 'intermediate' | 'advanced',
			startFret: chord.startFret,
			fretPositions: JSON.stringify(chord.fretPositions),
			barreFret: chord.barreFret ?? null,
			barreStrings: chord.barreStrings ? JSON.stringify(chord.barreStrings) : null,
			fingers: JSON.stringify(chord.fingers),
			openMuted: JSON.stringify(chord.openMuted)
		});
	}
}
