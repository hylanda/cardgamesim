import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(__dirname, '../../data/cardgame.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Decks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      format TEXT,
      cards TEXT NOT NULL,
      sideboard TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Game sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      room_id TEXT UNIQUE NOT NULL,
      player1_id TEXT,
      player2_id TEXT,
      status TEXT NOT NULL DEFAULT 'waiting',
      started_at INTEGER,
      ended_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Game state snapshots table (for auto-save)
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_state_snapshots (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      action_count INTEGER NOT NULL,
      state_data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
    CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
    CREATE INDEX IF NOT EXISTS idx_game_state_snapshots_session_id ON game_state_snapshots(session_id);
    CREATE INDEX IF NOT EXISTS idx_game_state_snapshots_action_count ON game_state_snapshots(session_id, action_count DESC);
  `);

  console.log('Database initialized successfully');
}

export default db;
