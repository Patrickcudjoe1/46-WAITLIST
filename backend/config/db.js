import Database from "better-sqlite3";
import path from "node:path";

const dbFile = path.join(process.cwd(), "data.sqlite");
export const db = new Database(dbFile);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    paymentLink TEXT NOT NULL,
    paymentReference TEXT NOT NULL UNIQUE,
    paymentStatus TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

export const userQueries = {
  findByEmail: db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1"),
  findByReference: db.prepare("SELECT * FROM users WHERE paymentReference = ? LIMIT 1"),
  insert: db.prepare(
    `INSERT INTO users (email, phone, paymentLink, paymentReference, paymentStatus, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ),
  markPaid: db.prepare(
    `UPDATE users SET paymentStatus = 'paid' WHERE paymentReference = ?`,
  ),
};

