import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Screen, Transaction } from '../types'

interface PagamentoRecebidoScreenProps {
  transaction: Partial<Transaction>
  onNavigate: (screen: Screen, data?: Partial<Transaction>) => void
  onNovaCobr: () => void
}

export function PagamentoRecebidoScreen({
  transaction,
  onNavigate,
  onNovaCobr,
}: PagamentoRecebidoScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-between px-6 py-8">
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-6"
        >
          <div
            className="flex size-20 items-center justify-center rounded-full"
            style={{ border: '3px solid var(--success)', background: 'var(--success-dim)' }}
          >
            <CheckCircle2 className="size-10" style={{ color: 'var(--success)' }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center"
        >
          <p className="mb-2 text-base font-medium" style={{ color: 'var(--muted)' }}>
            Pagamento recebido!
          </p>
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
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center gap-2 rounded-full px-4 py-2"
          style={{ background: 'var(--success-dim)', border: '1px solid rgba(74,222,128,0.2)' }}
        >
          <div className="size-2 rounded-full" style={{ background: 'var(--success)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
            Transação concluída
          </span>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex w-full flex-col gap-3"
      >
        <button
          onClick={onNovaCobr}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'white', color: 'black' }}
        >
          Nova cobrança
        </button>
        <button
          onClick={() => onNavigate('detalhes-transacao', transaction)}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: 'var(--surface-muted)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
          }}
        >
          Ver comprovante
        </button>
      </motion.div>
    </div>
  )
}
