# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `bun` as the package manager (project was scaffolded with bun).

```sh
bun run dev          # Start dev server
bun run build        # Production build (outputs to build/)
bun run preview      # Preview production build
bun run check        # TypeScript + Svelte type checking
bun run check:watch  # Type checking in watch mode
```

**Database migrations** (Drizzle Kit):
```sh
bunx drizzle-kit generate   # Generate migration from schema changes
bunx drizzle-kit migrate    # Apply pending migrations
bunx drizzle-kit studio     # Open Drizzle Studio GUI
```

There are no automated tests in this project.

**Docker:**
```sh
docker build -t guitarra-app .
docker run -p 3000:3000 -v /data:/data guitarra-app
```

## Architecture

**Stack:** SvelteKit 2 (Svelte 5 runes syntax), TypeScript, Tailwind CSS v4, Drizzle ORM + better-sqlite3.

**Database:** SQLite file at `./guitarra.db` (dev) or `$DATABASE_URL` (production). Migrations live in `drizzle/` and are applied automatically on startup in `src/lib/server/db.ts`. Schema defined in `src/lib/server/schema.ts` — two tables: `songs` and `chord_library`.

**Song content format:** Plain text with chord-above-lyrics layout. Lines where ≥60% of whitespace-separated tokens are valid chord names are treated as chord lines. Section headers use `[Section Name]` bracket notation. The chord parser (`src/lib/chord-parser.ts`) and transpose engine (`src/lib/transpose.ts`) both independently implement chord-line detection — keep them in sync if changing the detection heuristic.

**Chord rendering pipeline:**
1. `chord-parser.ts` — parses raw content into typed `ParsedLine[]` (section / chords / lyrics / empty)
2. `transpose.ts` — transposes chord tokens in-place, with key detection via major scale scoring
3. `chord-lookup.ts` — maps chord names to fingering positions via `@tombatossals/chords-db`
4. `LyricsRenderer.svelte` → `ChordToken.svelte` → `ChordDiagram.svelte` — renders the result

**Routes:**
- `/` — song list with search
- `/songs/new` — create song (uses `SongForm` component)
- `/songs/[id]` — view song with sticky toolbar (Transpose / AutoScroll / Metronome panels)
- `/songs/[id]/edit` — edit song

**Server-only code** lives in `src/lib/server/` and must not be imported from client components. The `db` export from `src/lib/server/db.ts` is the single Drizzle instance.

**Svelte 5 syntax:** All components use runes (`$state`, `$derived`, `$effect`, `$props`). Do not use Svelte 4 reactive declarations (`$:`) or the `export let` prop syntax.

**Styling:** Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin — no `tailwind.config.js`). Dark theme using zinc palette; amber accent (`amber-400`/`amber-500`). Layout is `max-w-3xl mx-auto` with safe-area inset padding for mobile/PWA use.
