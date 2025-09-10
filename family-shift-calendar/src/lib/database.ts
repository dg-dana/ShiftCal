import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'shifts.db');

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create shifts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create shift templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shift_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create sample users if none exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, color) 
      VALUES (?, ?, ?, ?)
    `);

    insertUser.run('John Doe', 'john@example.com', 'password123', '#3B82F6');
    insertUser.run('Sarah Smith', 'sarah@example.com', 'password123', '#EF4444');
    insertUser.run('Mike Johnson', 'mike@example.com', 'password123', '#10B981');
    
    console.log('Sample users created');
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  color: string;
  created_at: string;
}

export interface Shift {
  id: number;
  user_id: number;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface ShiftWithUser extends Shift {
  user_name: string;
  user_color: string;
}

export interface ShiftTemplate {
  id: number;
  user_id: number;
  name: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  return db.prepare('SELECT id, name, email, color, created_at FROM users ORDER BY name').all() as User[];
}

export function getUserById(id: number): User | undefined {
  const db = getDatabase();
  return db.prepare('SELECT id, name, email, color, created_at FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(name: string, email: string, password: string, color: string): number {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO users (name, email, password, color)
    VALUES (?, ?, ?, ?)
  `).run(name, email, password, color);
  
  return result.lastInsertRowid as number;
}

export function getAllShifts(): ShiftWithUser[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT 
      s.id, s.user_id, s.title, s.start_time, s.end_time, s.created_at,
      u.name as user_name, u.color as user_color
    FROM shifts s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.start_time
  `).all() as ShiftWithUser[];
}

export function createShift(userId: number, title: string, startTime: string, endTime: string): number {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO shifts (user_id, title, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `).run(userId, title, startTime, endTime);
  
  return result.lastInsertRowid as number;
}

export function updateShift(id: number, title: string, startTime: string, endTime: string): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE shifts 
    SET title = ?, start_time = ?, end_time = ?
    WHERE id = ?
  `).run(title, startTime, endTime, id);
}

export function deleteShift(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM shifts WHERE id = ?').run(id);
}

// Shift Template functions
export function getTemplatesByUserId(userId: number): ShiftTemplate[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM shift_templates WHERE user_id = ? ORDER BY name').all(userId) as ShiftTemplate[];
}

export function createShiftTemplate(userId: number, name: string, startTime: string, endTime: string): number {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO shift_templates (user_id, name, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `).run(userId, name, startTime, endTime);
  
  return result.lastInsertRowid as number;
}

export function deleteShiftTemplate(id: number): void {
  const db = getDatabase();
  db.prepare('DELETE FROM shift_templates WHERE id = ?').run(id);
}