import { ArrowDownLeft } from 'lucide-react'
import type { Screen, Transaction } from '../types'

interface TransacoesScreenProps {
  transactions: Partial<Transaction>[]
  onNavigate: (screen: Screen, data?: Partial<Transaction>) => void
}

export function TransacoesScreen({ transactions, onNavigate }: TransacoesScreenProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--surface-muted)' }}
        >
          <ArrowDownLeft className="size-6" style={{ color: 'var(--subtle)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
          Nenhuma transação ainda
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          As transações aparecerão aqui após o primeiro pagamento
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-4">
      <p className="mb-2 px-2 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
        Transações ({transactions.length})
      </p>
      {transactions.map((tx, i) => (
        <button
          key={tx.id ?? i}
          onClick={() => onNavigate('detalhes-transacao', tx)}
          className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all active:scale-[0.99]"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--success-dim)' }}
          >
            <ArrowDownLeft className="size-5" style={{ color: 'var(--success)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              Pagamento recebido
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              {tx.date ?? '--'}, {tx.time ?? '--'}
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--success)' }}>
            +{tx.amountStr} USDC
          </span>
        </button>
      ))}
    </div>
  )
}
