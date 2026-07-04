import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '../config/env.js';

mkdirSync(dirname(env.dbPath), { recursive: true });

export const db = new DatabaseSync(env.dbPath);
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_events_completed_at ON events(completed_at);
`);
