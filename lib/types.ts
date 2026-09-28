export type NavScreen = 'cobrar' | 'receber' | 'transacoes' | 'configuracoes'

export type Screen =
  NavScreen | 'qr-generate' | 'pagamento-recebido' | 'detalhes-transacao' | 'pagar'

export interface Transaction {
  id: string
  amount: number
  amountStr: string
  status: 'completed' | 'pending' | 'failed'
  date: string
  time: string
  from: string
  to: string
  txHash: string
  network: string
  createdAt?: string
}

// API shapes
export interface ApiTransaction {
  id: string
  amount: string
  amount_str: string
  status: string
  tx_hash: string | null
  from_address: string | null
  to_address: string
  network: string
  created_at: string
  updated_at: string
}

export function apiTxToTransaction(t: ApiTransaction): Transaction {
  const d = new Date(t.created_at)
  return {
    id: t.id,
    amount: parseFloat(t.amount),
    amountStr: t.amount_str,
    status: t.status as Transaction['status'],
    txHash: t.tx_hash ?? '',
    from: t.from_address ?? '',
    to: t.to_address,
    network: t.network,
    date: d.toLocaleDateString('pt-BR'),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    createdAt: t.created_at,
  }
}
