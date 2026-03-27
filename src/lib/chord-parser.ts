export type Token =
	| { type: 'text'; value: string }
	| { type: 'chord'; value: string };

export type ParsedLine = Token[];

// Matches [ChordName] — supports root + accidental + quality + slash bass
const CHORD_REGEX = /\[([A-G][#b]?(?:m(?:aj)?|dim|aug|sus[24]?|add\d|maj|M)?(?:\d+)?(?:\/[A-G][#b]?)?)\]/g;

export function parseLine(line: string): ParsedLine {
	const tokens: ParsedLine = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	CHORD_REGEX.lastIndex = 0;
	while ((match = CHORD_REGEX.exec(line)) !== null) {
		if (match.index > lastIndex) {
			tokens.push({ type: 'text', value: line.slice(lastIndex, match.index) });
		}
		tokens.push({ type: 'chord', value: match[1] });
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < line.length) {
		tokens.push({ type: 'text', value: line.slice(lastIndex) });
	}
	return tokens;
}

export function parseSong(content: string): ParsedLine[] {
	return content.split('\n').map(parseLine);
}

export function extractChords(content: string): string[] {
	const chords = new Set<string>();
	CHORD_REGEX.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = CHORD_REGEX.exec(content)) !== null) {
		chords.add(match[1]);
	}
	return Array.from(chords);
}

export function lineHasChords(line: ParsedLine): boolean {
	return line.some((t) => t.type === 'chord');
}
