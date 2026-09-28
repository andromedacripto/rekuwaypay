'use client'

import { ChevronLeft, ExternalLink, Share2 } from 'lucide-react'
import { buildTxExplorerUrl } from '@/src/onchain-facts'
import type { Transaction } from '@/lib/types'

interface DetalhesTransacaoScreenProps {
  tx: Partial<Transaction>
  onBack: () => void
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Concluída',
  pending: 'Pendente',
  failed: 'Falhou',
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'var(--success)',
  pending: '#f59e0b',
  failed: 'var(--danger)',
}

export function DetalhesTransacaoScreen({ tx, onBack }: DetalhesTransacaoScreenProps) {
  const explorerUrl = tx.txHash ? buildTxExplorerUrl(5042002, tx.txHash) : null

  const rows: [string, string][] = [
    ['Data', `${tx.date ?? '—'} · ${tx.time ?? '—'}`],
    [
      'ID da transação',
      tx.txHash ? `${tx.txHash.slice(0, 6)}…${tx.txHash.slice(-4)}` : (tx.id?.slice(0, 12) ?? '—'),
    ],
    ['Rede', tx.network ?? 'Arc Network'],
    ['De', tx.from ? `${tx.from.slice(0, 6)}…${tx.from.slice(-4)}` : '—'],
    ['Para', tx.to ? `${tx.to.slice(0, 6)}…${tx.to.slice(-4)}` : '—'],
  ]

  const handleShare = () => {
    const text = `Pagamento de ${tx.amountStr ?? '0.00'} USDC recebido via Rekuway Pay na Arc Network.\nTx: ${tx.txHash ?? ''}`
    if (navigator.share) {
      void navigator.share({ title: 'Comprovante Rekuway Pay', text })
    } else {
      void navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          aria-label="Voltar"
        >
          <ChevronLeft className="size-5" style={{ color: 'var(--ink)' }} />
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Detalhes da transação
        </h1>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
        {/* Amount hero */}
        <div className="mb-6 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span
              className="display text-5xl font-bold tabular-nums"
              style={{ color: 'var(--ink)', letterSpacing: '-0.04em' }}
            >
              {tx.amountStr ?? '0.00'}
            </span>
            <span className="text-xl font-semibold" style={{ color: 'var(--muted)' }}>
              USDC
            </span>
          </div>
          <p className="mt-1 text-sm tabular-nums" style={{ color: 'var(--subtle)' }}>
            ≈ ${tx.amountStr ?? '0.00'} USD
          </p>
          {/* Status badge */}
          <div
            className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1"
            style={{ background: `${STATUS_COLOR[tx.status ?? 'pending']}20` }}
          >
            <div
              className="size-1.5 rounded-full"
              style={{ background: STATUS_COLOR[tx.status ?? 'pending'] }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: STATUS_COLOR[tx.status ?? 'pending'] }}
            >
              {STATUS_LABEL[tx.status ?? 'pending']}
            </span>
          </div>
        </div>

        {/* Details card */}
        <div
          className="divide-y rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                {label}
              </span>
              <span className="mono text-sm font-medium" style={{ color: 'var(--ink)' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Explorer */}
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--muted)' }}
          >
            <ExternalLink className="size-3" />
            Ver no ArcScan
          </a>
        )}

        {/* Share */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: 'white', color: 'black' }}
          >
            <Share2 className="size-4" />
            Compartilhar comprovante
          </button>
        </div>
      </div>
    </div>
  )
}
