/**
 * Transaction history persistence via localStorage.
 * Keeps the last 100 transactions across page reloads.
 */

import type { Transaction } from './types'

const HISTORY_KEY = 'rkw_tx_history_v1'
const MAX_ENTRIES = 100

export function loadTransactions(): Partial<Transaction>[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Partial<Transaction>[]
  } catch {
    return []
  }
}

export function saveTransaction(tx: Partial<Transaction>) {
  if (typeof localStorage === 'undefined') return
  const existing = loadTransactions()
  const updated = [tx, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function clearTransactions() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(HISTORY_KEY)
}
