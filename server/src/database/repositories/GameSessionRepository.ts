import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from '../../types';

export interface GameSession {
  id: string;
  room_id: string;
  player1_id: string | null;
  player2_id: string | null;
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  started_at: number | null;
  ended_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface CreateGameSessionInput {
  room_id: string;
  player1_id?: string;
}

export class GameSessionRepository {
  create(input: CreateGameSessionInput): GameSession {
    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO game_sessions (id, room_id, player1_id, player2_id, status, started_at, ended_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.room_id,
      input.player1_id || null,
      null,
      'waiting',
      null,
      null,
      now,
      now
    );

    return this.findById(id)!;
  }

  findById(id: string): GameSession | undefined {
    const stmt = db.prepare('SELECT * FROM game_sessions WHERE id = ?');
    return stmt.get(id) as GameSession | undefined;
  }

  findByRoomId(roomId: string): GameSession | undefined {
    const stmt = db.prepare('SELECT * FROM game_sessions WHERE room_id = ?');
    return stmt.get(roomId) as GameSession | undefined;
  }

  updateStatus(id: string, status: GameSession['status']): GameSession | undefined {
    const now = Date.now();
    const updates: any = { status, updated_at: now };

    if (status === 'active' && !this.findById(id)?.started_at) {
      updates.started_at = now;
    }
    if (status === 'completed' || status === 'abandoned') {
      updates.ended_at = now;
    }

    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });

    values.push(id);

    const stmt = db.prepare(`UPDATE game_sessions SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }

  addPlayer2(id: string, player2_id: string): GameSession | undefined {
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE game_sessions
      SET player2_id = ?, status = 'active', started_at = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(player2_id, now, now, id);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM game_sessions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Cleanup old sessions (older than 24 hours with status waiting/abandoned)
  cleanupOldSessions(): number {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    const stmt = db.prepare(`
      DELETE FROM game_sessions
      WHERE (status = 'waiting' OR status = 'abandoned') AND created_at < ?
    `);
    const result = stmt.run(cutoffTime);
    return result.changes;
  }
}

export const gameSessionRepository = new GameSessionRepository();
