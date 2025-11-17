import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  created_at: number;
  updated_at: number;
}

export interface CreateUserInput {
  username: string;
  password: string;
  email?: string;
}

export class UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const id = uuidv4();
    const now = Date.now();
    const password_hash = await bcrypt.hash(input.password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.username, password_hash, input.email || null, now, now);

    return this.findById(id)!;
  }

  findById(id: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  findByUsername(username: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | undefined;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  update(id: string, updates: Partial<Pick<User, 'username' | 'email'>>): User | undefined {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userRepository = new UserRepository();
