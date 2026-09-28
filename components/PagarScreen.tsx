'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Search,
  ScanLine,
} from 'lucide-react'
import type { SmartAccount } from 'viem/account-abstraction'
import { isAddress } from 'viem'
import { sendUsdc } from '@/lib/modular-wallet'
import { buildTxExplorerUrl } from '@/src/onchain-facts'
import { QrScannerModal } from './QrScannerModal'

const ARC_TESTNET_ID = 5042002

interface PagarScreenProps {
  account: SmartAccount
  onBack: () => void
  onSuccess: (txHash: string, amount: string, to: string) => void
}

type PayState = 'form' | 'resolving' | 'resolved' | 'sending' | 'success' | 'error'

interface ResolvedUser {
  handle: string
  address: string
}

export function PagarScreen({ account, onBack, onSuccess }: PagarScreenProps) {
  const [step, setStep] = useState<'amount' | 'destination'>('amount')
  const [amount, setAmount] = useState('0')
  const [destination, setDestination] = useState('') // what user types: handle or 0x
  const [resolved, setResolved] = useState<ResolvedUser | null>(null)
  const [payState, setPayState] = useState<PayState>('form')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  const displayAmount = amount === '0' ? '0.00' : parseFloat(amount).toFixed(2)
  const amountNum = parseFloat(amount)

  // Decide if the raw input looks like a handle (no 0x prefix)
  const isHandleInput = destination.trim() !== '' && !destination.trim().startsWith('0x')
  const isRawAddress = isAddress(destination.trim())

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

  // Resolve a handle like "landerson" or "landerson.rekuwaypay" → address
  async function resolveHandle() {
    const raw = destination
      .trim()
      .toLowerCase()
      .replace(/\.rekuwaypay$/, '')
    setPayState('resolving')
    setErrorMsg(null)
    setResolved(null)
    try {
      const res = await fetch(`/api/users?handle=${encodeURIComponent(raw)}`)
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setErrorMsg(data.error ?? 'Usuário não encontrado')
        setPayState('error')
        return
      }
      const data = (await res.json()) as { handle: string; address: string }
      setResolved(data)
      setPayState('resolved')
    } catch {
      setErrorMsg('Erro ao buscar usuário')
      setPayState('error')
    }
  }

  // If raw address, set resolved directly
  function useRawAddress() {
    setResolved({ handle: '', address: destination.trim() })
    setPayState('resolved')
  }

  async function handleSend() {
    const toAddr = resolved?.address
    if (!toAddr || amountNum <= 0) return
    setPayState('sending')
    setErrorMsg(null)
    try {
      const hash = await sendUsdc(account, toAddr as `0x${string}`, displayAmount)
      setTxHash(hash)
      setPayState('success')
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          amountStr: displayAmount,
          toAddress: toAddr,
          toHandle: resolved?.handle || null,
          fromAddress: account.address,
          status: 'completed',
          txHash: hash,
          type: 'sent',
        }),
      })
      onSuccess(hash, displayAmount, toAddr)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar'
      setErrorMsg(msg)
      setPayState('error')
    }
  }

  const explorerUrl = txHash ? buildTxExplorerUrl(ARC_TESTNET_ID, txHash) : null

  // Parse a scanned QR payload — supports:
  // 1. EIP-681: ethereum:0xUSDC@5042002/transfer?address=0xTO&uint256=AMOUNT
  // 2. Plain 0x address
  // 3. handle.rekuwaypay
  function handleScanResult(text: string) {
    setShowScanner(false)
    let addr = ''
    try {
      // EIP-681
      const eip681 = text.match(/[?&]address=(0x[0-9a-fA-F]{40})/i)
      if (eip681) {
        addr = eip681[1]
      } else if (/^0x[0-9a-fA-F]{40}$/i.test(text.trim())) {
        addr = text.trim()
      } else {
        // treat as handle
        addr = text.trim()
      }
    } catch {
      addr = text.trim()
    }
    setDestination(addr)
    setResolved(null)
    setPayState('form')
    setErrorMsg(null)
    // Auto-resolve if it's a raw address
    if (isAddress(addr)) {
      setResolved({ handle: '', address: addr })
      setPayState('resolved')
    }
    // Move to destination step if still on amount
    setStep('destination')
  }

  // ── Success screen ─────────────────────────────────────────────────────────
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
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Para:{' '}
            <span style={{ color: 'var(--ink)' }}>
              {resolved?.handle
                ? `${resolved.handle}.rekuwaypay`
                : `${resolved?.address.slice(0, 6)}...${resolved?.address.slice(-4)}`}
            </span>
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

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg)' }}>
      {showScanner && (
        <QrScannerModal onResult={handleScanResult} onClose={() => setShowScanner(false)} />
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={
            step === 'destination'
              ? () => {
                  setStep('amount')
                  setPayState('form')
                  setResolved(null)
                  setDestination('')
                }
              : onBack
          }
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
        // ── Step 1: Amount numpad ──────────────────────────────────────────────
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
            onClick={() => setStep('destination')}
            className="mt-6 w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Continuar
          </button>

          {/* Quick scan — skip amount and go straight to camera */}
          <button
            onClick={() => setShowScanner(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
            }}
          >
            <ScanLine className="size-4" />
            Escanear QR Code
          </button>
        </div>
      ) : (
        // ── Step 2: Destination ────────────────────────────────────────────────
        <div className="flex flex-1 flex-col px-4">
          {/* Amount badge */}
          <div
            className="mb-5 rounded-2xl px-4 py-3"
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

          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="destination"
              className="text-xs font-medium"
              style={{ color: 'var(--muted)' }}
            >
              Chave Rekuway Pay ou endereço 0x
            </label>
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'var(--surface-card)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
              }}
            >
              <ScanLine className="size-3.5" />
              Escanear QR
            </button>
          </div>
          <div className="flex gap-2">
            <input
              id="destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
                setResolved(null)
                setPayState('form')
                setErrorMsg(null)
              }}
              placeholder="ex: landerson.rekuwaypay ou 0x..."
              autoCapitalize="none"
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--ink)',
                border: `1px solid ${payState === 'resolved' ? 'var(--success)' : payState === 'error' ? 'var(--danger)' : 'var(--border)'}`,
              }}
            />
            {isHandleInput && payState !== 'resolved' && (
              <button
                onClick={resolveHandle}
                disabled={payState === 'resolving'}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
                style={{
                  background: 'var(--surface-card)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                }}
              >
                {payState === 'resolving' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </button>
            )}
            {isRawAddress && !isHandleInput && payState !== 'resolved' && (
              <button
                onClick={useRawAddress}
                className="rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: 'var(--surface-card)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                }}
              >
                Usar
              </button>
            )}
          </div>

          {/* Resolved user preview */}
          {payState === 'resolved' && resolved && (
            <div
              className="mt-3 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                ✓ {resolved.handle ? `${resolved.handle}.rekuwaypay` : 'Endereço válido'}
              </p>
              <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {resolved.address.slice(0, 10)}...{resolved.address.slice(-6)}
              </p>
            </div>
          )}

          {/* Error */}
          {payState === 'error' && errorMsg && (
            <div
              className="mt-3 flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
              style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)' }}
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          <p className="mt-3 text-xs" style={{ color: 'var(--subtle)' }}>
            Digite um handle como <strong>landerson.rekuwaypay</strong> e toque em{' '}
            <Search className="inline size-3" /> para localizar, ou cole um endereço{' '}
            <strong>0x...</strong> diretamente.
          </p>

          <div className="mt-auto pt-6">
            <button
              disabled={payState !== 'resolved' || payState === ('sending' as PayState)}
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
                `Confirmar envio — ${displayAmount} USDC`
              )}
            </button>
            <p className="mt-3 text-center text-xs" style={{ color: 'var(--subtle)' }}>
              Gasless via Circle Gas Station
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
