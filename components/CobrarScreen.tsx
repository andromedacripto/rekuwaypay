'use client'

import { useState } from 'react'
import { ArrowRight, QrCode } from 'lucide-react'
import { Numpad } from './Numpad'

interface CobrarScreenProps {
  toAddress: string
  toHandle: string
  onGenerateQr: (amount: string) => void
}

export function CobrarScreen({ toHandle, onGenerateQr }: CobrarScreenProps) {
  const [rawAmount, setRawAmount] = useState('0')

  const amount = rawAmount === '0' || rawAmount === '' ? '0' : rawAmount
  const numericAmount = parseFloat(amount) || 0

  function handleKey(key: string) {
    setRawAmount((prev) => {
      if (key === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0'
      if (key === '.' && prev.includes('.')) return prev
      if (key === '.' && prev === '0') return '0.'
      if (prev === '0' && key !== '.') return key
      const parts = (prev + key).split('.')
      if (parts[1] && parts[1].length > 2) return prev
      return prev + key
    })
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col px-4 pt-4 md:pt-8">
      {/* Amount display */}
      <div className="mb-2 text-center">
        <p className="mb-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Cobrar pagamento
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span
            className="display tabular-nums"
            style={{
              color: numericAmount > 0 ? 'var(--ink)' : 'var(--subtle)',
              fontSize: numericAmount >= 100 ? '3rem' : '4rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            {parseFloat(amount) === 0 ? '0.00' : amount}
          </span>
          <span className="text-xl font-medium" style={{ color: 'var(--muted)' }}>
            USDC
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--subtle)' }}>
          ≈ ${numericAmount.toFixed(2)} USD
        </p>
      </div>

      {/* Numpad */}
      <div className="mb-4 flex-1">
        <Numpad onKey={handleKey} />
      </div>

      {/* Actions */}
      <div className="space-y-3 pb-4">
        <button
          onClick={() => onGenerateQr(numericAmount.toFixed(2))}
          disabled={numericAmount <= 0}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-95 disabled:opacity-40"
          style={{ background: 'var(--ink)', color: 'var(--bg)' }}
        >
          <div className="flex items-center gap-3">
            <QrCode className="size-5" />
            <div className="text-left">
              <p className="text-sm font-semibold">Gerar QR Code</p>
              <p className="text-xs opacity-70">O cliente escaneia e paga na hora</p>
            </div>
          </div>
          <ArrowRight className="size-5 opacity-60" />
        </button>

        <button
          onClick={() => onGenerateQr(numericAmount.toFixed(2))}
          disabled={numericAmount <= 0}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
          }}
        >
          <div className="flex items-center gap-3">
            <QrCode className="size-5" style={{ color: 'var(--muted)' }} />
            <div className="text-left">
              <p className="text-sm font-semibold">Cobrar com handle</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Compartilhe{' '}
                <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                  {toHandle}.rekuwaypay
                </span>
              </p>
            </div>
          </div>
          <ArrowRight className="size-5" style={{ color: 'var(--muted)' }} />
        </button>
      </div>
    </div>
  )
}
