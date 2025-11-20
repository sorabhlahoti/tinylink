// backend/src/db/index.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Set it to your Neon connection string.');
}

// Use ssl: { rejectUnauthorized: false } for Neon (common and safe for cloud DBs)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Optional: increase max for production
  // max: 20,
  // idleTimeoutMillis: 30000
});

export default pool;
