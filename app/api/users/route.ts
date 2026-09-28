export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { getDb, initDb } from '@/lib/db'

let initialized = false
async function ensureDb() {
  if (!initialized) {
    await initDb()
    initialized = true
  }
}

// POST /api/users — register a new user (handle + address + credential)
export async function POST(req: NextRequest) {
  await ensureDb()
  const db = getDb()

  const body = (await req.json()) as {
    handle: string
    address: string
    credential: unknown
  }

  // Normalise: lowercase, strip .rekuwaypay suffix if present
  const handle = body.handle
    .toLowerCase()
    .replace(/\.rekuwaypay$/, '')
    .trim()

  if (!/^[a-z0-9_]{3,32}$/.test(handle)) {
    return NextResponse.json(
      { error: 'Handle inválido. Use letras, números e _ (3–32 caracteres).' },
      { status: 400 },
    )
  }

  try {
    const result = await db.query(
      `INSERT INTO users (handle, address, credential)
       VALUES ($1, $2, $3)
       RETURNING handle, address, created_at`,
      [handle, body.address, JSON.stringify(body.credential)],
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json({ error: 'Esse handle já está em uso.' }, { status: 409 })
    }
    throw err
  }
}

// GET /api/users?handle=landerson  OR  ?address=0x...
export async function GET(req: NextRequest) {
  await ensureDb()
  const db = getDb()

  const address = req.nextUrl.searchParams.get('address')?.trim()
  if (address) {
    const result = await db.query('SELECT handle, address FROM users WHERE address = $1', [address])
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  }

  const handle = (req.nextUrl.searchParams.get('handle') ?? '')
    .toLowerCase()
    .replace(/\.rekuwaypay$/, '')
    .trim()

  if (!handle) {
    return NextResponse.json({ error: 'handle ou address é obrigatório' }, { status: 400 })
  }

  const result = await db.query('SELECT handle, address FROM users WHERE handle = $1', [handle])
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }
  return NextResponse.json(result.rows[0])
}
