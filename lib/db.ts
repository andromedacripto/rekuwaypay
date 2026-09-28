import { Pool } from 'pg'

let pool: Pool | null = null

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

export async function initDb(): Promise<void> {
  const db = getDb()
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      handle       TEXT PRIMARY KEY,
      address      TEXT NOT NULL UNIQUE,
      credential   JSONB NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id           TEXT PRIMARY KEY,
      amount       NUMERIC(18,6) NOT NULL,
      amount_str   TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending',
      tx_hash      TEXT,
      from_address TEXT,
      from_handle  TEXT,
      to_address   TEXT NOT NULL,
      to_handle    TEXT,
      network      TEXT NOT NULL DEFAULT 'Arc Network',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}
