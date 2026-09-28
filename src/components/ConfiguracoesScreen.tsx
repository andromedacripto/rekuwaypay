import { ConnectKitButton } from 'connectkit'
import { useAccount } from 'wagmi'
import { Bell, Shield, Globe, Info } from 'lucide-react'

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string
}) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div
        className="flex size-9 items-center justify-center rounded-xl"
        style={{ background: 'var(--surface-muted)' }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
          {label}
        </p>
        {value && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

export function ConfiguracoesScreen() {
  const { address } = useAccount()

  return (
    <div className="flex flex-col py-4">
      <p className="mb-2 px-6 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
        CARTEIRA
      </p>
      <div
        className="mx-4 mb-4 overflow-hidden rounded-2xl"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <div className="px-4 py-3.5">
          <p className="mb-1 text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Status da conexão
          </p>
          {address && (
            <p className="mono mb-3 text-xs" style={{ color: 'var(--muted)' }}>
              {address.slice(0, 10)}...{address.slice(-8)}
            </p>
          )}
          <ConnectKitButton />
        </div>
      </div>

      <p className="mb-2 px-6 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
        PREFERÊNCIAS
      </p>
      <div
        className="mx-4 mb-4 overflow-hidden rounded-2xl"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <SettingRow
          icon={<Bell className="size-4" style={{ color: 'var(--muted)' }} />}
          label="Notificações"
          value="Pagamentos e alertas"
        />
        <SettingRow
          icon={<Globe className="size-4" style={{ color: 'var(--muted)' }} />}
          label="Rede"
          value="Arc Testnet"
        />
        <SettingRow
          icon={<Shield className="size-4" style={{ color: 'var(--muted)' }} />}
          label="Segurança"
          value="Autenticação de carteira"
        />
      </div>

      <p className="mb-2 px-6 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
        SOBRE
      </p>
      <div
        className="mx-4 overflow-hidden rounded-2xl"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        <SettingRow
          icon={<Info className="size-4" style={{ color: 'var(--muted)' }} />}
          label="Rekuway Pay"
          value="© 2024 Todos os direitos reservados."
        />
      </div>
    </div>
  )
}
