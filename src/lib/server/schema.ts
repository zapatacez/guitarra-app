import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const songs = sqliteTable('songs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	artist: text('artist').notNull().default(''),
	key: text('key').notNull().default('C'),
	capo: integer('capo').notNull().default(0),
	bpm: integer('bpm').notNull().default(100),
	timeSignature: text('time_signature').notNull().default('4/4'),
	content: text('content').notNull().default(''),
	strumming: text('strumming').notNull().default('[]'),
	notes: text('notes').notNull().default(''),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const chordLibrary = sqliteTable('chord_library', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	difficulty: text('difficulty', { enum: ['basic', 'intermediate', 'advanced'] }).notNull(),
	fretPositions: text('fret_positions').notNull().default('[]'),
	startFret: integer('start_fret').notNull().default(1),
	barreFret: integer('barre_fret'),
	barreStrings: text('barre_strings'),
	fingers: text('fingers').notNull().default('[]'),
	openMuted: text('open_muted').notNull().default('[]')
});

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type ChordEntry = typeof chordLibrary.$inferSelect;
