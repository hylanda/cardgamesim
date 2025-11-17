import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from '../../types';

export interface GameStateSnapshot {
  id: string;
  session_id: string;
  action_count: number;
  state_data: string; // JSON serialized GameRoom
  created_at: number;
}

export interface GameStateSnapshotWithData {
  id: string;
  session_id: string;
  action_count: number;
  state_data: GameRoom;
  created_at: number;
}

export class GameStateSnapshotRepository {
  create(sessionId: string, actionCount: number, gameRoom: GameRoom): GameStateSnapshot {
    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO game_state_snapshots (id, session_id, action_count, state_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      sessionId,
      actionCount,
      JSON.stringify(gameRoom),
      now
    );

    return this.findById(id)!;
  }

  findById(id: string): GameStateSnapshot | undefined {
    const stmt = db.prepare('SELECT * FROM game_state_snapshots WHERE id = ?');
    return stmt.get(id) as GameStateSnapshot | undefined;
  }

  findBySessionId(sessionId: string, limit: number = 10): GameStateSnapshot[] {
    const stmt = db.prepare(`
      SELECT * FROM game_state_snapshots
      WHERE session_id = ?
      ORDER BY action_count DESC
      LIMIT ?
    `);
    return stmt.all(sessionId, limit) as GameStateSnapshot[];
  }

  findLatestBySessionId(sessionId: string): GameStateSnapshotWithData | undefined {
    const stmt = db.prepare(`
      SELECT * FROM game_state_snapshots
      WHERE session_id = ?
      ORDER BY action_count DESC
      LIMIT 1
    `);
    const row = stmt.get(sessionId) as GameStateSnapshot | undefined;
    return row ? this.deserializeSnapshot(row) : undefined;
  }

  findByActionCount(sessionId: string, actionCount: number): GameStateSnapshotWithData | undefined {
    const stmt = db.prepare(`
      SELECT * FROM game_state_snapshots
      WHERE session_id = ? AND action_count <= ?
      ORDER BY action_count DESC
      LIMIT 1
    `);
    const row = stmt.get(sessionId, actionCount) as GameStateSnapshot | undefined;
    return row ? this.deserializeSnapshot(row) : undefined;
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM game_state_snapshots WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteBySessionId(sessionId: string): number {
    const stmt = db.prepare('DELETE FROM game_state_snapshots WHERE session_id = ?');
    const result = stmt.run(sessionId);
    return result.changes;
  }

  // Keep only the last N snapshots for a session
  pruneOldSnapshots(sessionId: string, keepCount: number = 50): number {
    const stmt = db.prepare(`
      DELETE FROM game_state_snapshots
      WHERE session_id = ? AND id NOT IN (
        SELECT id FROM game_state_snapshots
        WHERE session_id = ?
        ORDER BY action_count DESC
        LIMIT ?
      )
    `);
    const result = stmt.run(sessionId, sessionId, keepCount);
    return result.changes;
  }

  private deserializeSnapshot(row: GameStateSnapshot): GameStateSnapshotWithData {
    return {
      ...row,
      state_data: JSON.parse(row.state_data),
    };
  }
}

export const gameStateSnapshotRepository = new GameStateSnapshotRepository();
