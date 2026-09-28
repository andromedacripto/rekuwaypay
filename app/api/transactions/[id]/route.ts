import { type NextRequest, NextResponse } from 'next/server'
import { getDb, initDb } from '@/lib/db'

let initialized = false
async function ensureDb() {
  if (!initialized) {
    await initDb()
    initialized = true
  }
}

// PATCH /api/transactions/:id — update status + tx_hash
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb()
  const db = getDb()
  const body = (await req.json()) as {
    status?: string
    txHash?: string
    fromAddress?: string
  }

  const result = await db.query(
    `UPDATE transactions
     SET status = COALESCE($1, status),
         tx_hash = COALESCE($2, tx_hash),
         from_address = COALESCE($3, from_address),
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [body.status ?? null, body.txHash ?? null, body.fromAddress ?? null, params.id],
  )
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(result.rows[0])
}

// GET /api/transactions/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb()
  const db = getDb()
  const result = await db.query('SELECT * FROM transactions WHERE id = $1', [params.id])
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(result.rows[0])
}
