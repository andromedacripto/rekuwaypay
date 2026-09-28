import { useState, useCallback } from 'react'
import { ArrowRight, QrCode, Scan } from 'lucide-react'
import { Numpad } from './Numpad'
import type { Screen, Transaction } from '../types'

interface CobrarScreenProps {
  onNavigate: (screen: Screen, data?: Partial<Transaction>) => void
}

export function CobrarScreen({ onNavigate }: CobrarScreenProps) {
  const [amount, setAmount] = useState('0')

  const handleKey = useCallback((key: string) => {
    setAmount((prev) => {
      if (key === '⌫') {
        const next = prev.slice(0, -1)
        return next === '' ? '0' : next
      }
      if (key === '.' && prev.includes('.')) return prev
      if (prev === '0' && key !== '.') return key
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1]
        if (decimals && decimals.length >= 2) return prev
      }
      return prev + key
    })
  }, [])

  const parsed = parseFloat(amount) || 0
  const formatted = parsed.toFixed(2)

  return (
    <div className="flex h-full flex-col">
      {/* Amount display */}
      <div className="px-6 pb-4 pt-6">
        <p className="mb-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Cobrar pagamento
        </p>
        <div className="mb-1 flex items-baseline gap-2">
          <span
            className="display font-bold tabular-nums"
            style={{
              color: 'var(--ink)',
              fontSize: parsed >= 1000 ? '2.5rem' : '3.5rem',
              lineHeight: 1,
            }}
          >
            {parsed === 0 ? '0.00' : amount.includes('.') ? amount : amount + '.00'}
          </span>
          <span className="text-xl font-semibold" style={{ color: 'var(--muted)' }}>
            USDC
          </span>
        </div>
        <p className="text-sm tabular-nums" style={{ color: 'var(--subtle)' }}>
          ≈ ${formatted} USD
        </p>
      </div>

      {/* Numpad */}
      <div className="px-4 pb-4">
        <Numpad onKey={handleKey} />
      </div>

      {/* Action buttons */}
      <div className="mt-auto flex flex-col gap-3 px-4 pb-6">
        <button
          onClick={() => onNavigate('qr-generate', { amount: parsed, amountStr: formatted })}
          disabled={parsed <= 0}
          className="flex items-center gap-4 rounded-2xl p-4 transition-all active:scale-[0.98] disabled:opacity-40"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--surface-strong)' }}
          >
            <QrCode className="size-5" style={{ color: 'var(--ink)' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              Gerar QR Code
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              O cliente escaneia e paga na hora.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0" style={{ color: 'var(--subtle)' }} />
        </button>

        <button
          onClick={() => onNavigate('qr-show', { amount: parsed, amountStr: formatted })}
          disabled={parsed <= 0}
          className="flex items-center gap-4 rounded-2xl p-4 transition-all active:scale-[0.98] disabled:opacity-40"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--surface-strong)' }}
          >
            <Scan className="size-5" style={{ color: 'var(--ink)' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              Cobrar com QR Code
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              Digite o valor e mostre o QR Code para o cliente pagar.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0" style={{ color: 'var(--subtle)' }} />
        </button>
      </div>
    </div>
  )
}
