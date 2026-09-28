import { NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

let initialized = false
async function ensureDb() {
  if (!initialized) {
    await initDb()
    initialized = true
  }
}

export async function GET() {
  await ensureDb()
  const db = getDb()
  const result = await db.query('SELECT * FROM wallets ORDER BY created_at DESC')
  return NextResponse.json(result.rows)
}

export async function POST(req: Request) {
  await ensureDb()
  const db = getDb()
  const body = (await req.json()) as { address: string; label?: string }

  const result = await db.query(
    `INSERT INTO wallets (address, label)
     VALUES ($1, $2)
     ON CONFLICT (address) DO UPDATE SET label = COALESCE($2, wallets.label)
     RETURNING *`,
    [body.address, body.label ?? null],
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}
