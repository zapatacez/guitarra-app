CREATE TABLE `chord_library` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`difficulty` text NOT NULL,
	`fret_positions` text DEFAULT '[]' NOT NULL,
	`start_fret` integer DEFAULT 1 NOT NULL,
	`barre_fret` integer,
	`barre_strings` text,
	`fingers` text DEFAULT '[]' NOT NULL,
	`open_muted` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`artist` text DEFAULT '' NOT NULL,
	`key` text DEFAULT 'C' NOT NULL,
	`capo` integer DEFAULT 0 NOT NULL,
	`bpm` integer DEFAULT 100 NOT NULL,
	`time_signature` text DEFAULT '4/4' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`strumming` text DEFAULT '[]' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
