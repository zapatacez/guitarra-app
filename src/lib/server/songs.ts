import { eq, like, or } from 'drizzle-orm';
import { db } from './db';
import { songs, type NewSong } from './schema';

export function getAllSongs() {
	return db.select().from(songs).orderBy(songs.updatedAt);
}

export function searchSongs(query: string) {
	const q = `%${query}%`;
	return db
		.select()
		.from(songs)
		.where(or(like(songs.title, q), like(songs.artist, q)))
		.orderBy(songs.title);
}

export function getSong(id: number) {
	return db.select().from(songs).where(eq(songs.id, id)).get();
}

export function createSong(data: Omit<NewSong, 'id' | 'createdAt' | 'updatedAt'>) {
	return db.insert(songs).values(data).returning().get();
}

export function updateSong(id: number, data: Partial<Omit<NewSong, 'id' | 'createdAt'>>) {
	return db
		.update(songs)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(songs.id, id))
		.returning()
		.get();
}

export function deleteSong(id: number) {
	return db.delete(songs).where(eq(songs.id, id)).run();
}
