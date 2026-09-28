'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, QrCode, ArrowDownLeft, ArrowUpRight, Settings, Wallet } from 'lucide-react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import type { SmartAccount } from 'viem/account-abstraction'

import { RekuwayLogo } from './RekuwayLogo'
import { CobrarScreen } from './CobrarScreen'
import { QrGenerateScreen } from './QrGenerateScreen'
import { PagamentoRecebidoScreen } from './PagamentoRecebidoScreen'
import { DetalhesTransacaoScreen } from './DetalhesTransacaoScreen'
import { ReceberScreen } from './ReceberScreen'
import { TransacoesScreen } from './TransacoesScreen'
import { ConfiguracoesScreen } from './ConfiguracoesScreen'
import { LoginScreen } from './LoginScreen'
import { PagarScreen } from './PagarScreen'
import { useModularWallet } from '@/hooks/useModularWallet'
import { getUsdc } from '@/src/onchain-facts'
import { formatUsdc } from '@/src/onchain-money'
import type { NavScreen, Screen, Transaction, ApiTransaction } from '@/lib/types'
import { apiTxToTransaction } from '@/lib/types'

const ARC_TESTNET_ID = 5042002

type NavItem = { id: NavScreen | 'pagar'; label: string; icon: React.ReactNode }
const NAV_ITEMS: NavItem[] = [
  { id: 'cobrar', label: 'Cobrar', icon: <QrCode className="size-5" /> },
  { id: 'receber', label: 'Receber', icon: <ArrowDownLeft className="size-5" /> },
  { id: 'pagar', label: 'Pagar', icon: <ArrowUpRight className="size-5" /> },
  { id: 'transacoes', label: 'Transações', icon: <Wallet className="size-5" /> },
  { id: 'configuracoes', label: 'Ajustes', icon: <Settings className="size-5" /> },
]

export function RekuwayApp() {
  const wallet = useModularWallet()
  const { address: wagmiAddress } = useAccount()

  const [screen, setScreen] = useState<Screen>('cobrar')
  const [activeNav, setActiveNav] = useState<NavScreen>('cobrar')
  const [cobrarAmount, setCobrarAmount] = useState('0')
  const [pendingTxId, setPendingTxId] = useState<string>('')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [lastReceivedTx, setLastReceivedTx] = useState<Partial<Transaction>>({})
  const userHandle = wallet.handle

  // Active address: passkey smart wallet takes priority
  const activeAddress = (wallet.address ?? wagmiAddress ?? null) as `0x${string}` | null

  // USDC ERC-20 balance
  const usdcFact = getUsdc(ARC_TESTNET_ID)
  const { data: rawBalance } = useReadContract({
    address: usdcFact?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    chainId: ARC_TESTNET_ID,
    query: { enabled: !!activeAddress && !!usdcFact },
  })
  const formattedBalance = rawBalance != null && usdcFact ? formatUsdc(rawBalance) : '0.00'

  // Load transactions from DB
  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions')
      if (!res.ok) return
      const rows: ApiTransaction[] = await res.json()
      setTransactions(rows.map(apiTxToTransaction))
    } catch {
      /* network not ready */
    }
  }, [])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  function navigate(nav: NavScreen | 'pagar') {
    if (nav === 'pagar') {
      setScreen('pagar')
      return
    }
    setActiveNav(nav)
    setScreen(nav)
  }

  async function handleCobrarContinue(amount: string) {
    setCobrarAmount(amount)
    // Create pending transaction in DB to get txId for polling
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          amountStr: amount,
          toAddress: activeAddress ?? '',
          status: 'pending',
        }),
      })
      const data = (await res.json()) as { id?: string }
      setPendingTxId(data.id ?? '')
    } catch {
      setPendingTxId('')
    }
    setScreen('qr-generate')
  }

  function handleNavigate(dest: Screen, data?: Partial<Transaction>) {
    if (data) setLastReceivedTx(data)
    if (dest === 'pagamento-recebido') {
      void loadTransactions()
    }
    setScreen(dest)
  }

  function handleViewDetalhes(tx: Transaction) {
    setSelectedTx(tx)
    setScreen('detalhes-transacao')
  }

  function handlePagarSuccess(_txHash: string, _amount: string, _to: string) {
    void loadTransactions()
    navigate('transacoes')
    setCobrarAmount('0')
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────
  const isAuthenticated = wallet.state === 'ready' || !!wagmiAddress
  const isLoadingAuth = wallet.state === 'loading'

  if (isLoadingAuth) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <RekuwayLogo size={48} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Carregando...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onRegister={wallet.register}
        onLogin={wallet.login}
        loading={wallet.state === 'loading'}
        error={wallet.error}
      />
    )
  }

  // ── Screen renderer ───────────────────────────────────────────────────────
  function renderScreen() {
    switch (screen) {
      case 'cobrar':
        return (
          <CobrarScreen
            toAddress={activeAddress ?? ''}
            toHandle=""
            onGenerateQr={handleCobrarContinue}
          />
        )
      case 'qr-generate':
        return (
          <QrGenerateScreen
            amount={parseFloat(cobrarAmount)}
            amountStr={cobrarAmount}
            txId={pendingTxId}
            walletAddress={activeAddress ?? undefined}
            onNavigate={handleNavigate}
            onCancel={() => setScreen('cobrar')}
          />
        )
      case 'pagamento-recebido':
        return (
          <PagamentoRecebidoScreen
            tx={lastReceivedTx}
            onNovaCobranca={() => {
              setCobrarAmount('0')
              setScreen('cobrar')
            }}
            onVerComprovante={(dest, data) => handleNavigate(dest, data)}
          />
        )
      case 'detalhes-transacao':
        return <DetalhesTransacaoScreen tx={selectedTx ?? {}} onBack={() => setScreen(activeNav)} />
      case 'receber':
        return <ReceberScreen address={activeAddress ?? ''} handle={userHandle} />
      case 'transacoes':
        return (
          <TransacoesScreen
            transactions={transactions}
            onViewDetails={handleViewDetalhes}
            onRefresh={loadTransactions}
          />
        )
      case 'pagar':
        if (!wallet.account) {
          return (
            <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5">
              <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>
                Faça login com passkey para enviar USDC gasless.
              </p>
              <button
                onClick={() => navigate('cobrar')}
                className="rounded-2xl px-6 py-3 text-sm font-semibold"
                style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
              >
                Voltar
              </button>
            </div>
          )
        }
        return (
          <PagarScreen
            account={wallet.account as SmartAccount}
            onBack={() => navigate('cobrar')}
            onSuccess={handlePagarSuccess}
          />
        )
      case 'configuracoes':
        return (
          <ConfiguracoesScreen
            address={activeAddress ?? ''}
            balance={formattedBalance}
            walletType={wallet.account ? 'passkey' : wagmiAddress ? 'external' : 'none'}
            onLogout={wallet.logout}
          />
        )
      default:
        return null
    }
  }

  const isFullscreen = [
    'qr-generate',
    'pagamento-recebido',
    'detalhes-transacao',
    'pagar',
  ].includes(screen)

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden w-56 flex-col border-r lg:flex"
        style={{ background: 'var(--surface-card)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center gap-3 border-b px-5 py-5"
          style={{ borderColor: 'var(--border)' }}
        >
          <RekuwayLogo size={32} />
          <span className="text-base font-bold" style={{ color: 'var(--ink)' }}>
            Rekuway pay
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3 pt-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                background: activeNav === item.id ? 'var(--surface-strong)' : 'transparent',
                color: activeNav === item.id ? 'var(--ink)' : 'var(--muted)',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Balance + wallet */}
        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Saldo disponível
          </p>
          <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
            {formattedBalance}{' '}
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              USDC
            </span>
          </p>
          <p className="mb-3 text-xs" style={{ color: 'var(--subtle)' }}>
            ≈ ${formattedBalance} USD
          </p>

          {wallet.account ? (
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'var(--surface-muted)' }}
              >
                <span className="size-2 rounded-full" style={{ background: 'var(--success)' }} />
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: 'var(--ink)' }}>
                    {userHandle ? `${userHandle}.rekuwaypay` : 'Passkey'}
                  </p>
                  <p className="truncate font-mono text-xs" style={{ color: 'var(--muted)' }}>
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </p>
                </div>
              </div>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3 py-2 text-center text-xs font-semibold"
                style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}
              >
                + Obter USDC testnet
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <ConnectKitButton />
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3 py-2 text-center text-xs font-semibold"
                style={{ background: 'var(--surface-strong)', color: 'var(--ink)' }}
              >
                + Obter USDC testnet
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop header */}
        {!isFullscreen && (
          <header
            className="hidden items-center justify-between border-b px-6 py-4 lg:flex"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
                {screen === 'cobrar' && 'Cobrar pagamento'}
                {screen === 'receber' && 'Receber USDC'}
                {screen === 'transacoes' && 'Transações'}
                {screen === 'configuracoes' && 'Configurações'}
                {screen === 'pagar' && 'Enviar USDC'}
              </h1>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Sua maquininha USDC na Arc Network
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen('pagar')}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                style={{
                  background: 'var(--surface-muted)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                }}
              >
                <ArrowUpRight className="size-4" />
                Enviar USDC
              </button>
              <button className="rounded-xl p-2" style={{ background: 'var(--surface-muted)' }}>
                <Bell className="size-5" style={{ color: 'var(--muted)' }} />
              </button>
            </div>
          </header>
        )}

        {/* Mobile header */}
        {!isFullscreen && (
          <header className="flex items-center justify-between px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <RekuwayLogo size={28} />
              <span className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                Rekuway pay
              </span>
            </div>
            <button className="rounded-xl p-2" style={{ background: 'var(--surface-muted)' }}>
              <Bell className="size-5" style={{ color: 'var(--muted)' }} />
            </button>
          </header>
        )}

        <div className="flex-1 overflow-y-auto">{renderScreen()}</div>

        {/* Mobile bottom nav */}
        {!isFullscreen && (
          <nav
            className="flex border-t lg:hidden"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border)' }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-all"
                style={{ color: activeNav === item.id ? 'var(--ink)' : 'var(--subtle)' }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </main>
    </div>
  )
}
