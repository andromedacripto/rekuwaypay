'use client'

import { useState } from 'react'
import { ChevronLeft, Loader2, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'
import type { SmartAccount } from 'viem/account-abstraction'
import { isAddress } from 'viem'
import { sendUsdc } from '@/lib/modular-wallet'
import { buildTxExplorerUrl } from '@/src/onchain-facts'

const ARC_TESTNET_ID = 5042002

interface PagarScreenProps {
  account: SmartAccount
  onBack: () => void
  onSuccess: (txHash: string, amount: string, to: string) => void
}

type PayState = 'form' | 'sending' | 'success' | 'error'

export function PagarScreen({ account, onBack, onSuccess }: PagarScreenProps) {
  const [step, setStep] = useState<'amount' | 'address'>('amount')
  const [amount, setAmount] = useState('0')
  const [toAddress, setToAddress] = useState('')
  const [payState, setPayState] = useState<PayState>('form')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const displayAmount = amount === '0' ? '0.00' : parseFloat(amount).toFixed(2)
  const isValidAddress = isAddress(toAddress)
  const amountNum = parseFloat(amount)

  function handleKey(key: string) {
    setAmount((prev) => {
      if (key === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0'
      if (key === '.' && prev.includes('.')) return prev
      if (prev === '0' && key !== '.') return key
      const next = prev + key
      const parts = next.split('.')
      if (parts[1] && parts[1].length > 2) return prev
      return next
    })
  }

  async function handleSend() {
    if (!isValidAddress || amountNum <= 0) return
    setPayState('sending')
    setErrorMsg(null)
    try {
      const hash = await sendUsdc(account, toAddress as `0x${string}`, displayAmount)
      setTxHash(hash)
      setPayState('success')
      // Save to DB
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          amountStr: displayAmount,
          toAddress,
          fromAddress: account.address,
          status: 'completed',
          txHash: hash,
          type: 'sent',
        }),
      })
      onSuccess(hash, displayAmount, toAddress)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar'
      setErrorMsg(msg)
      setPayState('error')
    }
  }

  const explorerUrl = txHash ? buildTxExplorerUrl(ARC_TESTNET_ID, txHash) : null

  // ── Success ───────────────────────────────────────────────────────────────
  if (payState === 'success') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 py-10">
        <div
          className="flex size-20 items-center justify-center rounded-full"
          style={{ background: 'rgba(34,197,94,0.12)' }}
        >
          <CheckCircle className="size-10" style={{ color: 'var(--success)' }} />
        </div>

        <div className="text-center">
          <p className="text-4xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
            {displayAmount}
            <span className="ml-2 text-xl font-medium" style={{ color: 'var(--muted)' }}>
              USDC
            </span>
          </p>
          <p className="mt-2 text-sm font-semibold" style={{ color: 'var(--success)' }}>
            Transferência enviada!
          </p>
          <p className="mt-1 font-mono text-xs" style={{ color: 'var(--muted)' }}>
            Para: {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
          </p>
        </div>

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            Ver no ArcScan <ExternalLink className="size-3.5" />
          </a>
        )}

        <button
          onClick={onBack}
          className="mt-2 w-full max-w-xs rounded-2xl py-3.5 text-sm font-semibold"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
          }}
        >
          Voltar
        </button>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="rounded-xl p-2"
          style={{ background: 'var(--surface-muted)' }}
        >
          <ChevronLeft className="size-5" style={{ color: 'var(--ink)' }} />
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Enviar USDC
        </h1>
      </div>

      {step === 'amount' ? (
        // ── Step 1: Amount ─────────────────────────────────────────────────
        <div className="flex flex-1 flex-col px-4">
          <div className="mb-6 text-center">
            <p className="text-5xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {displayAmount}
            </p>
            <p className="mt-1 text-lg font-medium" style={{ color: 'var(--muted)' }}>
              USDC
            </p>
            <p className="text-sm" style={{ color: 'var(--subtle)' }}>
              ≈ ${displayAmount} USD
            </p>
          </div>

          {/* Numpad inline */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className="flex h-14 items-center justify-center rounded-2xl text-xl font-semibold transition-all active:scale-95"
                style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
              >
                {k}
              </button>
            ))}
          </div>

          <button
            disabled={amountNum <= 0}
            onClick={() => setStep('address')}
            className="mt-6 w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Continuar
          </button>
        </div>
      ) : (
        // ── Step 2: Address ────────────────────────────────────────────────
        <div className="flex flex-1 flex-col px-4">
          <div
            className="mb-4 rounded-2xl px-4 py-3"
            style={{ background: 'var(--surface-muted)' }}
          >
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Valor
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {displayAmount}{' '}
              <span className="text-base font-medium" style={{ color: 'var(--muted)' }}>
                USDC
              </span>
            </p>
          </div>

          <label
            htmlFor="toAddress"
            className="mb-1.5 block text-xs font-medium"
            style={{ color: 'var(--muted)' }}
          >
            Endereço da carteira destinatária
          </label>
          <textarea
            id="toAddress"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value.trim())}
            placeholder="0x..."
            rows={2}
            className="w-full resize-none rounded-xl px-4 py-3 font-mono text-sm outline-none"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--ink)',
              border: `1px solid ${toAddress && isValidAddress ? 'var(--success)' : 'var(--border)'}`,
            }}
          />
          {toAddress && !isValidAddress && (
            <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
              Endereço inválido
            </p>
          )}

          {payState === 'error' && errorMsg && (
            <div
              className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)' }}
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="mt-auto pt-6">
            <button
              disabled={!isValidAddress || payState === 'sending'}
              onClick={handleSend}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              {payState === 'sending' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Confirmar envio'
              )}
            </button>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--subtle)' }}>
              Transação gasless via Circle Gas Station
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
