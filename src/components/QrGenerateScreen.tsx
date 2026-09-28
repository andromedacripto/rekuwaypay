import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import type { Screen, Transaction } from '../types'

const ARC_TESTNET_ID = 5042002
const usdcFact = getUsdc(ARC_TESTNET_ID)

interface QrGenerateScreenProps {
  amount: number
  amountStr: string
  onNavigate: (screen: Screen, data?: Partial<Transaction>) => void
  onCancel: () => void
}

// Simple QR-like SVG placeholder using the logo
function QrCodeSvg({ size = 220 }: { size?: number }) {
  // Generate a deterministic QR-like grid pattern
  const cells = 21
  const cellSize = size / cells
  const pattern: boolean[][] = []
  for (let r = 0; r < cells; r++) {
    pattern[r] = []
    for (let c = 0; c < cells; c++) {
      // Finder patterns (corners)
      const inFinder = (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)
      if (inFinder) {
        const isOuter =
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= cells - 7 && (r === cells - 7 || r === cells - 1 || c === 0 || c === 6)) ||
          (c >= cells - 7 && (r === 0 || r === 6 || c === cells - 7 || c === cells - 1))
        const isInner =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3) ||
          (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4)
        pattern[r][c] = isOuter || isInner
      } else {
        // Pseudo-random data pattern
        pattern[r][c] = (r * 31 + c * 17 + r * c * 7) % 3 === 0
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect width={size} height={size} fill="white" rx="12" />
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize + 0.5}
              y={r * cellSize + 0.5}
              width={cellSize - 0.5}
              height={cellSize - 0.5}
              fill="black"
            />
          ) : null,
        ),
      )}
      {/* Center logo overlay */}
      <rect x={size / 2 - 24} y={size / 2 - 24} width={48} height={48} rx={8} fill="white" />
      <rect x={size / 2 - 20} y={size / 2 - 20} width={40} height={40} rx={6} fill="black" />
      <text
        x={size / 2}
        y={size / 2 + 7}
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="bold"
      >
        R
      </text>
    </svg>
  )
}

export function QrGenerateScreen({
  amount,
  amountStr,
  onNavigate,
  onCancel,
}: QrGenerateScreenProps) {
  const [seconds, setSeconds] = useState(5 * 60) // 5 minutes
  const [paid, setPaid] = useState(false)
  const { address } = useAccount()

  const { data: balance } = useReadContract(
    address && usdcFact
      ? {
          address: usdcFact.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
          chainId: ARC_TESTNET_ID,
        }
      : undefined,
  )

  const formattedBalance = balance
    ? Amount.fromRaw(balance, usdcDecimalsFor(ARC_TESTNET_ID)).toFixed(2)
    : null

  const timerStr = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  useEffect(() => {
    if (paid) return
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [paid])

  // Simulate payment detection after 8 seconds for demo
  const simulatePayment = useCallback(() => {
    setPaid(true)
    setTimeout(() => {
      const tx: Partial<Transaction> = {
        id: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
        amount,
        amountStr,
        status: 'completed',
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        from: `0x7a1...c3D4`,
        to: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Sua carteira',
        txHash: `0x3f2...a7b9`,
        network: 'Arc Network',
      }
      onNavigate('pagamento-recebido', tx)
    }, 1500)
  }, [amount, amountStr, address, onNavigate])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <button
          onClick={onCancel}
          className="flex size-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft className="size-5" style={{ color: 'var(--ink)' }} />
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Gerar QR Code
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pb-6 pt-4">
        <p className="mb-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Mostre o QR Code para
          <br />
          seu cliente escanear e pagar
        </p>

        {/* QR Code */}
        <div
          className="mb-5 rounded-2xl p-4"
          style={{ background: 'white', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
        >
          <QrCodeSvg size={220} />
        </div>

        {/* Amount */}
        <div className="mb-2 text-center">
          <span className="display text-4xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
            {amountStr}
          </span>
          <span className="ml-2 text-xl font-semibold" style={{ color: 'var(--muted)' }}>
            USDC
          </span>
        </div>
        <p className="mb-1 text-sm tabular-nums" style={{ color: 'var(--subtle)' }}>
          ≈ ${amountStr} USD
        </p>

        {!paid ? (
          <div className="mt-4 flex items-center gap-2">
            <div
              className="size-2 animate-pulse rounded-full"
              style={{ background: 'var(--muted)' }}
            />
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Aguardando pagamento...
            </span>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <div className="size-2 rounded-full" style={{ background: 'var(--success)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
              Pagamento detectado!
            </span>
          </div>
        )}

        <p
          className="mt-2 text-2xl font-semibold tabular-nums"
          style={{ color: seconds < 60 ? 'var(--danger)' : 'var(--ink-2)' }}
        >
          {timerStr}
        </p>

        {formattedBalance && (
          <p className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
            Saldo disponível: {formattedBalance} USDC
          </p>
        )}

        <div className="mt-auto flex w-full flex-col gap-3 pt-4">
          {/* Demo button to simulate payment */}
          <button
            onClick={simulatePayment}
            className="w-full rounded-2xl py-4 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'white', color: 'black' }}
          >
            Simular pagamento recebido
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            Cancelar cobrança
          </button>
        </div>
      </div>
    </div>
  )
}
