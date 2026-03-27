// Single chord name — no brackets, matches Em, B7, Am6, B7add11, C/G, N.C., etc.
const CHORD_NAME_RE =
	/^(?:N\.C\.|[A-G][#b]?(?:m(?:aj)?7?|maj7?|dim7?|aug|sus[24]?|add\d+|[679]|11|13|m7b5|6\/9)?(?:\/[A-G][#b]?)?)$/;

export function isChordName(s: string): boolean {
	return CHORD_NAME_RE.test(s);
}

function isChordLine(line: string): boolean {
	if (!line.trim()) return false;
	const tokens = line.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return false;
	const chordCount = tokens.filter(isChordName).length;
	return chordCount >= 1 && chordCount / tokens.length >= 0.6;
}

function isSectionHeader(line: string): boolean {
	return /^\[.+\]$/.test(line.trim());
}

// ── Token types ──────────────────────────────────────────────────────────────

export type ChordLineToken =
	| { type: 'chord'; value: string }
	| { type: 'space'; value: string }
	| { type: 'text'; value: string };

export type ParsedLine =
	| { lineType: 'section'; value: string }
	| { lineType: 'chords'; tokens: ChordLineToken[] }
	| { lineType: 'lyrics'; value: string }
	| { lineType: 'empty' };

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseChordLine(line: string): ChordLineToken[] {
	const tokens: ChordLineToken[] = [];
	const parts = line.split(/(\s+)/);
	for (const part of parts) {
		if (part === '') continue;
		if (/^\s+$/.test(part)) {
			tokens.push({ type: 'space', value: part });
		} else if (isChordName(part)) {
			tokens.push({ type: 'chord', value: part });
		} else {
			tokens.push({ type: 'text', value: part });
		}
	}
	return tokens;
}

export function parseSong(content: string): ParsedLine[] {
	return content.split('\n').map((line): ParsedLine => {
		if (!line.trim()) return { lineType: 'empty' };
		if (isSectionHeader(line)) return { lineType: 'section', value: line.trim().slice(1, -1) };
		if (isChordLine(line)) return { lineType: 'chords', tokens: parseChordLine(line) };
		return { lineType: 'lyrics', value: line };
	});
}

export function extractChords(content: string): string[] {
	const chords = new Set<string>();
	for (const line of content.split('\n')) {
		if (isChordLine(line)) {
			line
				.trim()
				.split(/\s+/)
				.filter(isChordName)
				.forEach((c) => chords.add(c));
		}
	}
	return Array.from(chords);
}
