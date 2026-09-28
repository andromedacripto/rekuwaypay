import { ChevronLeft, Share2, CheckCircle2 } from 'lucide-react'
import type { Screen, Transaction } from '../types'

interface DetalhesTransacaoScreenProps {
  transaction: Partial<Transaction>
  onBack: () => void
  onNavigate: (screen: Screen) => void
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span className="text-sm" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <span className={`text-sm font-medium ${mono ? 'mono' : ''}`} style={{ color: 'var(--ink)' }}>
        {value}
      </span>
    </div>
  )
}

export function DetalhesTransacaoScreen({
  transaction,
  onBack,
  onNavigate,
}: DetalhesTransacaoScreenProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Comprovante Rekuway Pay',
          text: `Pagamento de ${transaction.amountStr} USDC recebido em ${transaction.date} às ${transaction.time}`,
        })
        .catch(() => {})
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-4">
        <button
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft className="size-5" style={{ color: 'var(--ink)' }} />
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>
          Detalhes da transação
        </h1>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-4">
        {/* Amount hero */}
        <div className="mb-4 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span
              className="display text-5xl font-bold tabular-nums"
              style={{ color: 'var(--ink)' }}
            >
              {transaction.amountStr ?? '0.00'}
            </span>
            <span className="text-2xl font-semibold" style={{ color: 'var(--muted)' }}>
              USDC
            </span>
          </div>
          <p className="mt-1 text-sm tabular-nums" style={{ color: 'var(--subtle)' }}>
            ≈ ${transaction.amountStr ?? '0.00'} USD
          </p>
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: 'var(--success-dim)' }}
          >
            <CheckCircle2 className="size-3.5" style={{ color: 'var(--success)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
              Concluída
            </span>
          </div>
        </div>

        {/* Details card */}
        <div
          className="mt-4 rounded-2xl px-4"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
        >
          <Row label="Data" value={`${transaction.date ?? '--'} - ${transaction.time ?? '--'}`} />
          <Row label="ID da transação" value={transaction.txHash ?? '--'} mono />
          <Row label="Rede" value={transaction.network ?? 'Arc Network'} />
          <Row label="De" value={transaction.from ?? '--'} mono />
          <div className="flex items-center justify-between py-3">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Para
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
              {transaction.to ?? 'Sua carteira'}
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'white', color: 'black' }}
          >
            <Share2 className="size-4" />
            Compartilhar comprovante
          </button>
          <button
            onClick={() => onNavigate('cobrar')}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: 'var(--surface-muted)',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            Nova cobrança
          </button>
        </div>
      </div>
    </div>
  )
}
