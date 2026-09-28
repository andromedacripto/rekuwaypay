import { type NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, type Address } from 'viem'
import { getDb, initDb } from '@/lib/db'
import { requireChain, getUsdc } from '@/src/onchain-facts'

const ARC_TESTNET_ID = 5042002
const arcChainFact = requireChain(ARC_TESTNET_ID)
const usdcFact = getUsdc(ARC_TESTNET_ID)!

const ARC_TESTNET_VIEM_CHAIN = {
  id: arcChainFact.chainId,
  name: arcChainFact.name,
  nativeCurrency: {
    name: arcChainFact.nativeCurrency.symbol,
    symbol: arcChainFact.nativeCurrency.symbol,
    decimals: arcChainFact.nativeCurrency.decimals,
  },
  rpcUrls: { default: { http: arcChainFact.rpcUrls as [string, ...string[]] } },
} as const

let initialized = false
async function ensureDb() {
  if (!initialized) {
    await initDb()
    initialized = true
  }
}

function buildRpcUrl(): string {
  const proxyChains = (process.env.RPC_PROXY_CHAINS ?? '').split(',')
  if (process.env.RPC_PROXY_BASE_URL && proxyChains.includes('Arc_Testnet')) {
    return `${process.env.RPC_PROXY_BASE_URL}/api/rpc/Arc_Testnet?_rpc_token=${process.env.RPC_PROXY_TOKEN}`
  }
  // Fallback: public RPC from onchain-facts registry (rate limit unknown)
  return arcChainFact.rpcUrls[0]
}

/**
 * GET /api/poll?wallet=0x...&txId=<uuid>&amount=25.00
 * Scans recent Transfer events on Arc Testnet for a matching incoming USDC
 * payment. Returns { found, txHash }.
 */
export async function GET(req: NextRequest) {
  await ensureDb()
  const { searchParams } = new URL(req.url)
  const wallet = searchParams.get('wallet') as Address | null
  const txId = searchParams.get('txId')
  const expectedAmount = searchParams.get('amount')

  if (!wallet || !txId || !expectedAmount) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const client = createPublicClient({
    chain: ARC_TESTNET_VIEM_CHAIN,
    transport: http(buildRpcUrl()),
  })

  try {
    const latestBlock = await client.getBlockNumber()
    const fromBlock = latestBlock > 50n ? latestBlock - 50n : 0n

    const logs = await client.getLogs({
      address: usdcFact.address as Address,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', name: 'from', indexed: true },
          { type: 'address', name: 'to', indexed: true },
          { type: 'uint256', name: 'value', indexed: false },
        ],
      },
      args: { to: wallet },
      fromBlock,
      toBlock: latestBlock,
    })

    const usdcDecimals = usdcFact.decimals
    const expectedRaw = BigInt(Math.round(parseFloat(expectedAmount) * 10 ** usdcDecimals))

    const match = logs.find((log) => {
      const val = (log.args as { value?: bigint }).value ?? 0n
      return val >= expectedRaw - 1n && val <= expectedRaw + 1n
    })

    if (match) {
      const db = getDb()
      await db.query(
        `UPDATE transactions
         SET status = 'completed',
             tx_hash = $1,
             from_address = $2,
             updated_at = NOW()
         WHERE id = $3 AND status = 'pending'`,
        [match.transactionHash ?? '', String((match.args as { from?: string }).from ?? ''), txId],
      )
      return NextResponse.json({ found: true, txHash: match.transactionHash })
    }

    return NextResponse.json({ found: false })
  } catch (err) {
    console.error('[poll] RPC error:', err)
    return NextResponse.json({ found: false, error: 'RPC error' })
  }
}
