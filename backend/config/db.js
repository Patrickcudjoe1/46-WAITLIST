import { createClient } from "@libsql/client";
import "dotenv/config";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:data.sqlite",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize table
db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    paymentLink TEXT NOT NULL,
    paymentReference TEXT NOT NULL UNIQUE,
    paymentStatus TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`).catch((err) => {
  console.error("Failed to initialize database table:", err);
});

export const userQueries = {
  findByEmail: async (email) => {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });
    return result.rows[0];
  },
  findByReference: async (reference) => {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE paymentReference = ? LIMIT 1",
      args: [reference],
    });
    return result.rows[0];
  },
  insert: async (email, phone, paymentLink, paymentReference, paymentStatus, createdAt) => {
    return await db.execute({
      sql: `INSERT INTO users (email, phone, paymentLink, paymentReference, paymentStatus, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [email, phone, paymentLink, paymentReference, paymentStatus, createdAt],
    });
  },
  markPaid: async (reference) => {
    return await db.execute({
      sql: `UPDATE users SET paymentStatus = 'paid' WHERE paymentReference = ?`,
      args: [reference],
    });
  },
};

