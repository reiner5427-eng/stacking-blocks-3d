ALTER TABLE survivor_runs ADD COLUMN season INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE survivor_runs ADD COLUMN boss_defeated INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX survivor_season_ranking ON survivor_runs (season, finished, score DESC, kills DESC, elapsed DESC, started, id);
