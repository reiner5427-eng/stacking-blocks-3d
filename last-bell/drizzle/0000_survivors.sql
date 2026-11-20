CREATE TABLE survivor_runs (
 id TEXT PRIMARY KEY,
 nickname TEXT NOT NULL,
 difficulty TEXT NOT NULL,
 started INTEGER NOT NULL,
 score INTEGER NOT NULL DEFAULT 0,
 kills INTEGER NOT NULL DEFAULT 0,
 correct INTEGER NOT NULL DEFAULT 0,
 elapsed REAL NOT NULL DEFAULT 0,
 win INTEGER NOT NULL DEFAULT 0,
 finished INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX survivor_ranking ON survivor_runs (finished, score DESC, kills DESC, elapsed DESC, started, id);
