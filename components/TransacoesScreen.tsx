'use client'

import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react'
import { type Transaction } from '@/lib/types'

interface TransacoesScreenProps {
  transactions: Transaction[]
  onViewDetails: (tx: Transaction) => void
  onRefresh: () => void
}

export function TransacoesScreen({
  transactions,
  onViewDetails,
  onRefresh,
}: TransacoesScreenProps) {
  return (
    <div className="px-4 pt-6 md:px-6 md:pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
          Transações
        </h2>
        <button
          onClick={onRefresh}
          className="flex size-8 items-center justify-center rounded-xl transition-all active:scale-90"
          style={{ background: 'var(--surface-muted)' }}
          aria-label="Atualizar"
        >
          <RefreshCw className="size-4" style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-base font-medium" style={{ color: 'var(--muted)' }}>
            Nenhuma transação ainda
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--subtle)' }}>
            Faça uma cobrança para começar
          </p>
        </div>
      ) : (
        <div
          className="divide-y overflow-hidden rounded-2xl"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--border)',
            border: '1px solid var(--border)',
          }}
        >
          {transactions.map((tx) => {
            const isReceived = tx.status === 'completed' && tx.txHash !== ''
            return (
              <button
                key={tx.id}
                onClick={() => onViewDetails(tx)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-all hover:bg-white/5 active:scale-[0.99]"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: isReceived ? 'var(--success-dim)' : 'var(--surface-muted)' }}
                >
                  {isReceived ? (
                    <ArrowDownLeft className="size-4" style={{ color: 'var(--success)' }} />
                  ) : (
                    <ArrowUpRight className="size-4" style={{ color: 'var(--muted)' }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    {tx.from || tx.to
                      ? isReceived
                        ? `De ${tx.from || 'desconhecido'}`
                        : `Para ${tx.to || 'desconhecido'}`
                      : 'Transação'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {tx.date} · {tx.time}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: isReceived ? 'var(--success)' : 'var(--ink)' }}
                  >
                    {isReceived ? '+' : '-'}
                    {tx.amountStr}
                  </p>
                  <p
                    className="text-xs capitalize"
                    style={{
                      color:
                        tx.status === 'completed'
                          ? 'var(--success)'
                          : tx.status === 'failed'
                            ? 'var(--danger)'
                            : 'var(--muted)',
                    }}
                  >
                    {tx.status === 'completed'
                      ? 'Concluída'
                      : tx.status === 'failed'
                        ? 'Falhou'
                        : 'Pendente'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
