import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '../../types';

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  format: string | null;
  cards: string; // JSON serialized array of Card[]
  sideboard: string | null; // JSON serialized array of Card[]
  created_at: number;
  updated_at: number;
}

export interface DeckWithCards {
  id: string;
  user_id: string;
  name: string;
  format: string | null;
  cards: Card[];
  sideboard: Card[];
  created_at: number;
  updated_at: number;
}

export interface CreateDeckInput {
  user_id: string;
  name: string;
  format?: string;
  cards: Card[];
  sideboard?: Card[];
}

export class DeckRepository {
  create(input: CreateDeckInput): DeckWithCards {
    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO decks (id, user_id, name, format, cards, sideboard, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.user_id,
      input.name,
      input.format || null,
      JSON.stringify(input.cards),
      input.sideboard ? JSON.stringify(input.sideboard) : null,
      now,
      now
    );

    return this.findById(id)!;
  }

  findById(id: string): DeckWithCards | undefined {
    const stmt = db.prepare('SELECT * FROM decks WHERE id = ?');
    const row = stmt.get(id) as Deck | undefined;
    return row ? this.deserializeDeck(row) : undefined;
  }

  findByUserId(userId: string): DeckWithCards[] {
    const stmt = db.prepare('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC');
    const rows = stmt.all(userId) as Deck[];
    return rows.map(row => this.deserializeDeck(row));
  }

  update(id: string, updates: Partial<Pick<CreateDeckInput, 'name' | 'format' | 'cards' | 'sideboard'>>): DeckWithCards | undefined {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.format !== undefined) {
      fields.push('format = ?');
      values.push(updates.format);
    }
    if (updates.cards !== undefined) {
      fields.push('cards = ?');
      values.push(JSON.stringify(updates.cards));
    }
    if (updates.sideboard !== undefined) {
      fields.push('sideboard = ?');
      values.push(updates.sideboard ? JSON.stringify(updates.sideboard) : null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE decks SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM decks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private deserializeDeck(row: Deck): DeckWithCards {
    return {
      ...row,
      cards: JSON.parse(row.cards),
      sideboard: row.sideboard ? JSON.parse(row.sideboard) : [],
    };
  }
}

export const deckRepository = new DeckRepository();
