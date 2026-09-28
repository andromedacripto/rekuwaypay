import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'
import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'

const ARC_TESTNET_ID = 5042002
const usdcFact = getUsdc(ARC_TESTNET_ID)

export function ReceberScreen() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const { data: balance } = useReadContract(
    address && usdcFact
      ? {
          address: usdcFact.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
          chainId: ARC_TESTNET_ID,
        }
      : undefined,
  )

  const formattedBalance = balance
    ? Amount.fromRaw(balance, usdcDecimalsFor(ARC_TESTNET_ID)).toFixed(2)
    : '0.00'

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="mb-6 text-sm" style={{ color: 'var(--muted)' }}>
          Conecte sua carteira para receber USDC
        </p>
        <ConnectKitButton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-6">
      <div>
        <p className="mb-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>
          Receber
        </p>
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>
          Compartilhe seu endereço para receber USDC na Arc Network
        </p>
      </div>

      {/* Balance card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <p className="mb-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Saldo disponível
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="display text-3xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
            {formattedBalance}
          </span>
          <span className="text-base font-semibold" style={{ color: 'var(--muted)' }}>
            USDC
          </span>
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
          Arc Network
        </p>
      </div>

      {/* Address */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <p className="mb-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Seu endereço
        </p>
        <div className="flex items-center gap-3">
          <p className="mono flex-1 break-all text-xs" style={{ color: 'var(--ink)' }}>
            {address}
          </p>
          <button
            onClick={handleCopy}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          >
            {copied ? (
              <Check className="size-4" style={{ color: 'var(--success)' }} />
            ) : (
              <Copy className="size-4" style={{ color: 'var(--muted)' }} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
