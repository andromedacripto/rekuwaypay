'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useAccount } from 'wagmi'
import QRCode from 'qrcode'
import type { Screen, Transaction } from '@/lib/types'

interface QrGenerateScreenProps {
  amount: number
  amountStr: string
  txId: string
  onNavigate: (screen: Screen, data?: Partial<Transaction>) => void
  onCancel: () => void
}

export function QrGenerateScreen({
  amount,
  amountStr,
  txId,
  onNavigate,
  onCancel,
}: QrGenerateScreenProps) {
  const [seconds, setSeconds] = useState(5 * 60)
  const [status, setStatus] = useState<'waiting' | 'found' | 'expired'>('waiting')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const { address } = useAccount()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Build QR payload: EIP-681 style URI for USDC transfer on Arc Testnet
  // erc20:0xUSDC@chainId/transfer?address=TO&uint256=AMOUNT_RAW
  const usdcAddress = '0x3600000000000000000000000000000000000000'
  const amountRaw = BigInt(Math.round(amount * 1_000_000)).toString()
  const qrPayload = address
    ? `ethereum:${usdcAddress}@5042002/transfer?address=${address}&uint256=${amountRaw}`
    : ''

  useEffect(() => {
    if (!qrPayload) return
    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [qrPayload])

  // Countdown timer
  useEffect(() => {
    if (status !== 'waiting') return
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t)
          setStatus('expired')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status])

  // Poll /api/poll every 5s
  useEffect(() => {
    if (!address || !txId || status !== 'waiting') return

    const poll = async () => {
      try {
        const res = await fetch(`/api/poll?wallet=${address}&txId=${txId}&amount=${amountStr}`)
        const data = (await res.json()) as { found: boolean; txHash?: string }
        if (data.found) {
          setStatus('found')
          if (pollRef.current) clearInterval(pollRef.current)
          const now = new Date()
          setTimeout(() => {
            onNavigate('pagamento-recebido', {
              id: txId,
              amount,
              amountStr,
              status: 'completed',
              txHash: data.txHash ?? '',
              from: '',
              to: address,
              network: 'Arc Network',
              date: now.toLocaleDateString('pt-BR'),
              time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            })
          }, 1500)
        }
      } catch {
        // RPC hiccup — keep polling
      }
    }

    pollRef.current = setInterval(poll, 5000)
    void poll() // immediate first check

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [address, txId, amountStr, amount, status, onNavigate])

  const timerStr = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex size-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          aria-label="Voltar"
        >
          <ChevronLeft className="size-5" style={{ color: 'var(--ink)' }} />
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Gerar QR Code
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 pb-6 pt-4">
        <p className="mb-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Mostre o QR Code para
          <br />
          seu cliente escanear e pagar
        </p>

        {/* QR Code */}
        <div
          className="mb-5 flex items-center justify-center rounded-2xl p-4"
          style={{ background: 'white', minWidth: 256, minHeight: 256 }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR Code de pagamento" width={220} height={220} />
          ) : (
            <div
              className="flex size-[220px] items-center justify-center rounded-xl"
              style={{ background: '#f5f5f5' }}
            >
              <span className="text-xs" style={{ color: '#888' }}>
                {address ? 'Gerando...' : 'Conecte a carteira'}
              </span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="mb-1 text-center">
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

        {/* Status */}
        {status === 'waiting' && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className="size-2 animate-pulse rounded-full"
              style={{ background: 'var(--muted)' }}
            />
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Aguardando pagamento...
            </span>
          </div>
        )}
        {status === 'found' && (
          <div className="mt-4 flex items-center gap-2">
            <div className="size-2 rounded-full" style={{ background: 'var(--success)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
              Pagamento detectado!
            </span>
          </div>
        )}
        {status === 'expired' && (
          <div className="mt-4 flex items-center gap-2">
            <div className="size-2 rounded-full" style={{ background: 'var(--danger)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
              QR expirado — gere um novo
            </span>
          </div>
        )}

        <p
          className="mt-2 text-2xl font-semibold tabular-nums"
          style={{ color: seconds < 60 ? 'var(--danger)' : 'var(--ink-2)' }}
        >
          {status !== 'expired' ? timerStr : '00:00'}
        </p>

        {/* address hint */}
        {address && (
          <p className="mono mt-2 text-[10px]" style={{ color: 'var(--subtle)' }}>
            {address.slice(0, 10)}...{address.slice(-8)}
          </p>
        )}

        <div className="mt-auto flex w-full flex-col gap-3 pt-6">
          <button
            type="button"
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
