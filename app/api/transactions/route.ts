export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'
import { randomUUID } from 'crypto'

let initialized = false
async function ensureDb() {
  if (!initialized) {
    await initDb()
    initialized = true
  }
}

// GET /api/transactions?handle=landerson — list for a handle, newest first
export async function GET(req: NextRequest) {
  await ensureDb()
  const db = getDb()
  const handle = req.nextUrl.searchParams.get('handle')

  const result = handle
    ? await db.query(
        `SELECT * FROM transactions
         WHERE from_handle = $1 OR to_handle = $1
         ORDER BY created_at DESC LIMIT 100`,
        [handle],
      )
    : await db.query('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100')

  return NextResponse.json(result.rows)
}

// POST /api/transactions — create a pending transaction
export async function POST(req: NextRequest) {
  await ensureDb()
  const db = getDb()
  const body = (await req.json()) as {
    amount: number
    amountStr: string
    toAddress: string
    toHandle?: string
    fromAddress?: string
    fromHandle?: string
  }

  const id = randomUUID()
  const result = await db.query(
    `INSERT INTO transactions
       (id, amount, amount_str, status, from_address, from_handle, to_address, to_handle)
     VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)
     RETURNING *`,
    [
      id,
      body.amount,
      body.amountStr,
      body.fromAddress ?? null,
      body.fromHandle ?? null,
      body.toAddress,
      body.toHandle ?? null,
    ],
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}
