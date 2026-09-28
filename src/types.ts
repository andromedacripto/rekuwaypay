export type Screen =
  | 'cobrar'
  | 'receber'
  | 'transacoes'
  | 'clientes'
  | 'relatorios'
  | 'configuracoes'
  | 'qr-generate'
  | 'qr-show'
  | 'pagamento-recebido'
  | 'detalhes-transacao'

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
}
