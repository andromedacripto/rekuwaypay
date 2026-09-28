'use client'

import { CheckCircle, ExternalLink } from 'lucide-react'
import { buildTxExplorerUrl } from '@/src/onchain-facts'
import type { Screen, Transaction } from '@/lib/types'

interface PagamentoRecebidoScreenProps {
  tx: Partial<Transaction>
  onNovaCobranca: () => void
  onVerComprovante: (screen: Screen, data?: Partial<Transaction>) => void
}

export function PagamentoRecebidoScreen({
  tx,
  onNovaCobranca,
  onVerComprovante,
}: PagamentoRecebidoScreenProps) {
  const explorerUrl = tx.txHash ? buildTxExplorerUrl(5042002, tx.txHash) : null

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      {/* Success icon */}
      <div
        className="mb-6 flex size-20 items-center justify-center rounded-full"
        style={{ background: 'var(--success-dim)', border: '2px solid rgba(74,222,128,0.3)' }}
      >
        <CheckCircle className="size-10" style={{ color: 'var(--success)' }} strokeWidth={1.5} />
      </div>

      <h1 className="mb-1 text-xl font-bold" style={{ color: 'var(--ink)' }}>
        Pagamento recebido!
      </h1>

      {/* Amount */}
      <div className="my-4">
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
      </div>

      {/* Status badge */}
      <div
        className="mb-6 flex items-center gap-2 rounded-full px-4 py-1.5"
        style={{ background: 'var(--success-dim)' }}
      >
        <div className="size-2 rounded-full" style={{ background: 'var(--success)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
          Transação concluída
        </span>
      </div>

      {/* Explorer link */}
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 flex items-center gap-1 text-xs underline"
          style={{ color: 'var(--muted)' }}
        >
          <ExternalLink className="size-3" />
          Ver no ArcScan
        </a>
      )}

      {/* Actions */}
      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={onNovaCobranca}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'white', color: 'black' }}
        >
          Nova cobrança
        </button>
        <button
          type="button"
          onClick={() => onVerComprovante('detalhes-transacao', tx)}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
          }}
        >
          Ver comprovante
        </button>
      </div>
    </div>
  )
}
