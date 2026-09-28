'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SmartAccount } from 'viem/account-abstraction'
import {
  loginPasskey,
  registerPasskey,
  restoreSession,
  clearCredential,
  sendUsdc,
  saveHandle,
  loadHandle,
} from '@/lib/modular-wallet'

export type WalletState = 'idle' | 'loading' | 'ready' | 'error'

export interface ModularWalletSession {
  account: SmartAccount | null
  address: string | null
  handle: string
  state: WalletState
  error: string | null
  register: (username: string) => Promise<void>
  login: () => Promise<void>
  logout: () => void
  transfer: (to: `0x${string}`, amount: string) => Promise<`0x${string}`>
}

export function useModularWallet(): ModularWalletSession {
  const [account, setAccount] = useState<SmartAccount | null>(null)
  const [state, setState] = useState<WalletState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [handle, setHandle] = useState<string>('')

  // Restore session from localStorage on mount
  useEffect(() => {
    setHandle(loadHandle())
    restoreSession()
      .then((acc) => {
        if (acc) {
          setAccount(acc)
          setState('ready')
        } else {
          setState('idle')
        }
      })
      .catch(() => setState('idle'))
  }, [])

  const register = useCallback(async (username: string) => {
    setState('loading')
    setError(null)
    try {
      const { account: acc } = await registerPasskey(username)
      setAccount(acc)
      setState('ready')
      // Save handle locally immediately so UI updates
      saveHandle(username)
      setHandle(username)
      // Persist wallet + handle to DB
      await Promise.all([
        fetch('/api/wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: acc.address, label: username }),
        }),
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle: username, address: acc.address, credential: {} }),
        }),
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar passkey'
      setError(msg)
      setState('error')
      throw err
    }
  }, [])

  const login = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const { account: acc } = await loginPasskey()
      setAccount(acc)
      setState('ready')
      // Restore handle from DB
      try {
        const r = await fetch(`/api/users?address=${acc.address}`)
        if (r.ok) {
          const d = (await r.json()) as { handle?: string }
          if (d.handle) {
            saveHandle(d.handle)
            setHandle(d.handle)
          }
        }
      } catch {
        /* noop */
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(msg)
      setState('idle')
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clearCredential()
    setAccount(null)
    setHandle('')
    setState('idle')
    setError(null)
  }, [])

  const transfer = useCallback(
    async (to: `0x${string}`, amount: string): Promise<`0x${string}`> => {
      if (!account) throw new Error('Wallet não conectada')
      return sendUsdc(account, to, amount)
    },
    [account],
  )

  return {
    account,
    address: account?.address ?? null,
    handle,
    state,
    error,
    register,
    login,
    logout,
    transfer,
  }
}
