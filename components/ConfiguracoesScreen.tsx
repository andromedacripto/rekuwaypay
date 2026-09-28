'use client'

import { LogOut, ExternalLink, Fingerprint, Wallet } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'
import { useAccount } from 'wagmi'
import { getUsdc, buildTxExplorerUrl } from '@/src/onchain-facts'

const ARC_TESTNET_ID = 5042002

interface ConfiguracoesScreenProps {
  address: string
  balance: string
  walletType: 'passkey' | 'external' | 'none'
  onLogout: () => void
}

export function ConfiguracoesScreen({
  address,
  balance,
  walletType,
  onLogout,
}: ConfiguracoesScreenProps) {
  const { isConnected } = useAccount()
  const usdcFact = getUsdc(ARC_TESTNET_ID)
  const explorerAddressUrl = address
    ? `${buildTxExplorerUrl(ARC_TESTNET_ID, address).replace('/tx/', '/address/')}`
    : null

  return (
    <div className="px-4 py-6">
      <h2 className="mb-4 text-base font-semibold" style={{ color: 'var(--ink)' }}>
        Configurações
      </h2>

      {/* Wallet card */}
      <div
        className="mb-4 rounded-2xl p-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <div className="mb-3 flex items-center gap-2">
          {walletType === 'passkey' ? (
            <Fingerprint className="size-4" style={{ color: 'var(--muted)' }} />
          ) : (
            <Wallet className="size-4" style={{ color: 'var(--muted)' }} />
          )}
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
            {walletType === 'passkey' ? 'Smart Wallet (Passkey)' : 'Carteira externa'}
          </p>
        </div>

        {address ? (
          <>
            <p className="break-all font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {address}
            </p>
            {explorerAddressUrl && (
              <a
                href={explorerAddressUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-xs"
                style={{ color: 'var(--muted)' }}
              >
                Ver no ArcScan <ExternalLink className="size-3" />
              </a>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Nenhuma carteira conectada
          </p>
        )}

        <div
          className="mt-3 flex items-center justify-between rounded-xl px-3 py-2"
          style={{ background: 'var(--surface-muted)' }}
        >
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Saldo USDC
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
            {balance} USDC
          </span>
        </div>
      </div>

      {/* Rede */}
      <div
        className="mb-4 rounded-2xl p-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          Rede
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Arc Testnet
          </p>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}
          >
            Conectado
          </span>
        </div>
        {usdcFact && (
          <p className="mt-2 font-mono text-xs" style={{ color: 'var(--subtle)' }}>
            USDC: {usdcFact.address.slice(0, 8)}…{usdcFact.address.slice(-6)}
          </p>
        )}
      </div>

      {/* Connect external wallet if not passkey */}
      {walletType !== 'passkey' && !isConnected && (
        <div className="mb-4">
          <ConnectKitButton />
        </div>
      )}

      {/* Logout (passkey only) */}
      {walletType === 'passkey' && (
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
          style={{
            background: 'rgba(248,113,113,0.08)',
            color: 'var(--danger)',
            border: '1px solid rgba(248,113,113,0.2)',
          }}
        >
          <LogOut className="size-4" />
          Sair
        </button>
      )}

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--subtle)' }}>
        Rekuway Pay © 2024 — Arc Testnet
      </p>
    </div>
  )
}
