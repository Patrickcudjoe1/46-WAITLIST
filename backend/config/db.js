import { createClient } from "@libsql/client";
import "dotenv/config";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:data.sqlite",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log(">>> DB Connection Initialized:", process.env.TURSO_DATABASE_URL ? "TURSO CLOUD" : "LOCAL SQLITE");

// Initialize database
const initDb = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        size TEXT NOT NULL,
        location TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        paymentLink TEXT NOT NULL,
        paymentReference TEXT NOT NULL UNIQUE,
        paymentStatus TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
    // Passively attempt to add new columns for existing schemas
    await db.execute(`ALTER TABLE users ADD COLUMN name TEXT DEFAULT '';`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN size TEXT DEFAULT '';`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN location TEXT DEFAULT '';`).catch(() => {});
    await db.execute(`ALTER TABLE users ADD COLUMN quantity INTEGER DEFAULT 1;`).catch(() => {});
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
  }
};
initDb();

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
  countPaid: async () => {
    const result = await db.execute("SELECT COUNT(*) as count FROM users WHERE paymentStatus = 'paid'");
    return result.rows[0].count;
  },
  insert: async (name, size, location, quantity, email, phone, paymentLink, paymentReference, paymentStatus, createdAt) => {
    return await db.execute({
      sql: `INSERT INTO users (name, size, location, quantity, email, phone, paymentLink, paymentReference, paymentStatus, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [name, size, location, quantity, email, phone, paymentLink, paymentReference, paymentStatus, createdAt],
    });
  },
  markPaid: async (reference) => {
    console.log(`--- Executing DB Update: markPaid for ${reference}`);
    return await db.execute({
      sql: `UPDATE users SET paymentStatus = 'paid' WHERE paymentReference = ?`,
      args: [reference],
    });
  },
};

