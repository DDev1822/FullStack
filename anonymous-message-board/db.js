'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const configuredPath = process.env.DB || './data/messageboard.db';

if (configuredPath.includes('://')) {
  throw new Error('DB must be a local SQLite file path, for example ./data/messageboard.db');
}

const databasePath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(__dirname, configuredPath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    board TEXT NOT NULL,
    text TEXT NOT NULL,
    created_on TEXT NOT NULL,
    bumped_on TEXT NOT NULL,
    delete_password TEXT NOT NULL,
    reported INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_on TEXT NOT NULL,
    delete_password TEXT NOT NULL,
    reported INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_threads_board_bumped
    ON threads(board, bumped_on DESC);

  CREATE INDEX IF NOT EXISTS idx_replies_thread_created
    ON replies(thread_id, created_on ASC);
`);

module.exports = db;
