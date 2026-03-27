import { eq, and, inArray } from 'drizzle-orm';
import { db } from './db';
import { chordLibrary } from './schema';
import { seedChords } from './seed-chords';

export async function getChord(name: string, difficulty: 'basic' | 'intermediate' | 'advanced' = 'basic') {
	await seedChords();
	return db
		.select()
		.from(chordLibrary)
		.where(and(eq(chordLibrary.name, name), eq(chordLibrary.difficulty, difficulty)))
		.get();
}

export async function getChordsMap(
	names: string[],
	difficulty: 'basic' | 'intermediate' | 'advanced' = 'basic'
): Promise<Record<string, import('./schema').ChordEntry>> {
	if (names.length === 0) return {};
	await seedChords();
	const rows = await db
		.select()
		.from(chordLibrary)
		.where(and(inArray(chordLibrary.name, names), eq(chordLibrary.difficulty, difficulty)));

	return Object.fromEntries(rows.map((r) => [r.name, r]));
}

export async function getAllChords(difficulty?: 'basic' | 'intermediate' | 'advanced') {
	await seedChords();
	if (difficulty) {
		return db.select().from(chordLibrary).where(eq(chordLibrary.difficulty, difficulty));
	}
	return db.select().from(chordLibrary).orderBy(chordLibrary.name);
}
