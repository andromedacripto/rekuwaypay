'use client'

import { useState } from 'react'
import { Fingerprint, LogIn, Loader2 } from 'lucide-react'
import { RekuwayLogo } from './RekuwayLogo'

interface LoginScreenProps {
  onRegister: (username: string) => Promise<void>
  onLogin: () => Promise<void>
  loading: boolean
  error: string | null
}

export function LoginScreen({ onRegister, onLogin, loading, error }: LoginScreenProps) {
  const [mode, setMode] = useState<'choose' | 'register'>('choose')
  const [username, setUsername] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    await onRegister(username.trim())
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-10"
      style={{ background: 'var(--bg)' }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <RekuwayLogo size={56} />
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
            Rekuway Pay
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Sua maquininha USDC na Arc Network
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
      >
        {mode === 'choose' ? (
          <div className="flex flex-col gap-3">
            <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--ink)' }}>
              Bem-vindo
            </h2>
            <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
              Crie uma conta com passkey (biometria/Face ID) ou entre com uma existente. Sem senhas,
              sem seed phrase.
            </p>

            <button
              onClick={() => setMode('register')}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              <Fingerprint className="size-4" />
              Criar conta com passkey
            </button>

            <button
              onClick={onLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
              }}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              Entrar com passkey existente
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="mb-1 self-start text-sm"
              style={{ color: 'var(--muted)' }}
            >
              ← Voltar
            </button>

            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
                Criar conta
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                Escolha um nome para identificar sua conta.
              </p>
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--muted)' }}
              >
                Nome / usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: joao.silva"
                autoComplete="username"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: 'var(--surface-muted)',
                  color: 'var(--ink)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#000' }}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Fingerprint className="size-4" />
              )}
              {loading ? 'Registrando...' : 'Registrar com biometria'}
            </button>
          </form>
        )}

        {error && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-xs"
            style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--danger)' }}
          >
            {error}
          </div>
        )}
      </div>

      <div
        className="mt-6 rounded-full px-3 py-1 text-xs"
        style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}
      >
        Arc Testnet • USDC de teste
      </div>
    </div>
  )
}
