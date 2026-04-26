import { createClient } from "@libsql/client";
import "dotenv/config";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:backend/data.sqlite",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkDb() {
  try {
    const result = await db.execute("SELECT paymentStatus, COUNT(*) as count FROM users GROUP BY paymentStatus;");
    console.log(JSON.stringify(result.rows, null, 2));
    
    const recent = await db.execute("SELECT email, paymentStatus, createdAt FROM users ORDER BY createdAt DESC LIMIT 5;");
    console.log("Recent registrations:");
    console.log(JSON.stringify(recent.rows, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkDb();
