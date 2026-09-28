'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ReceberScreenProps {
  address: string
  handle: string
}

export function ReceberScreen({ address, handle }: ReceberScreenProps) {
  const [copiedHandle, setCopiedHandle] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  function copy(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="px-4 pt-6 md:px-6 md:pt-8">
      <h2 className="mb-6 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
        Receber
      </h2>

      {/* Handle card */}
      <div
        className="mb-4 rounded-3xl p-5"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <p
          className="mb-1 text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--subtle)' }}
        >
          Sua chave de pagamento
        </p>
        <p className="display mt-2 text-2xl font-bold" style={{ color: 'var(--ink)' }}>
          {handle}.rekuwaypay
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Compartilhe essa chave para receber USDC de qualquer pessoa
        </p>
        <button
          onClick={() => copy(`${handle}.rekuwaypay`, setCopiedHandle)}
          className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
        >
          {copiedHandle ? (
            <Check className="size-4" style={{ color: 'var(--success)' }} />
          ) : (
            <Copy className="size-4" />
          )}
          {copiedHandle ? 'Copiado!' : 'Copiar chave'}
        </button>
      </div>

      {/* Address card (advanced) */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
      >
        <p className="mb-1 text-xs" style={{ color: 'var(--subtle)' }}>
          Endereço de rede (avançado)
        </p>
        <p className="mono mt-1 break-all text-xs" style={{ color: 'var(--muted)' }}>
          {shortAddress}
        </p>
        <button
          onClick={() => copy(address, setCopiedAddress)}
          className="mt-2 flex items-center gap-1.5 text-xs"
          style={{ color: 'var(--subtle)' }}
        >
          {copiedAddress ? (
            <Check className="size-3" style={{ color: 'var(--success)' }} />
          ) : (
            <Copy className="size-3" />
          )}
          {copiedAddress ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
