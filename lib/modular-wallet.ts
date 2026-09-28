/**
 * Circle Modular Wallets — passkey transport + smart account factory + USDC send.
 * Arc Testnet. Gas sponsored via Circle Gas Station (paymaster: true).
 */
import { createPublicClient } from 'viem'
import { arcTestnet } from 'viem/chains'
import {
  createBundlerClient,
  toWebAuthnAccount,
  type SmartAccount,
  type P256Credential,
  type WebAuthnAccount,
} from 'viem/account-abstraction'
import {
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
  encodeTransfer,
  ContractAddress,
} from '@circle-fin/modular-wallets-core'
import { parseUsdc } from '@/src/onchain-money'

// ── env ───────────────────────────────────────────────────────────────────────
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY ?? ''
const clientUrl =
  process.env.NEXT_PUBLIC_CLIENT_URL ?? 'https://modular-sdk.circle.com/v1/rpc/w3s/buidl'

// ── transports ────────────────────────────────────────────────────────────────
export const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
export const modularTransport = toModularTransport(`${clientUrl}/arcTestnet`, clientKey)

// ── clients ───────────────────────────────────────────────────────────────────
export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: modularTransport,
})

export const bundlerClient = createBundlerClient({
  chain: arcTestnet,
  transport: modularTransport,
})

// ── credential persistence ────────────────────────────────────────────────────
const CRED_KEY = 'rekuway_passkey_credential'
const HANDLE_KEY = 'rekuway_handle'

export function saveCredential(cred: P256Credential): void {
  try {
    localStorage.setItem(CRED_KEY, JSON.stringify(cred))
  } catch {
    /* storage unavailable */
  }
}

export function loadCredential(): P256Credential | null {
  try {
    const raw = localStorage.getItem(CRED_KEY)
    return raw ? (JSON.parse(raw) as P256Credential) : null
  } catch {
    return null
  }
}

export function clearCredential(): void {
  try {
    localStorage.removeItem(CRED_KEY)
    localStorage.removeItem(HANDLE_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function saveHandle(handle: string): void {
  try {
    localStorage.setItem(HANDLE_KEY, handle)
  } catch {
    /* noop */
  }
}

export function loadHandle(): string {
  try {
    return localStorage.getItem(HANDLE_KEY) ?? ''
  } catch {
    return ''
  }
}

// ── auth ──────────────────────────────────────────────────────────────────────

/** Register new passkey → credential + smart account */
export async function registerPasskey(username: string): Promise<{
  credential: P256Credential
  account: SmartAccount
}> {
  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register,
    username,
  })
  saveCredential(credential)
  const account = await buildSmartAccount(credential)
  return { credential, account }
}

/** Authenticate with existing passkey → credential + smart account */
export async function loginPasskey(): Promise<{
  credential: P256Credential
  account: SmartAccount
}> {
  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Login,
  })
  saveCredential(credential)
  const account = await buildSmartAccount(credential)
  return { credential, account }
}

/** Restore session from persisted credential on page load */
export async function restoreSession(): Promise<SmartAccount | null> {
  const cred = loadCredential()
  if (!cred) return null
  try {
    return await buildSmartAccount(cred)
  } catch {
    clearCredential()
    return null
  }
}

/** Build Circle Smart Account from a P256 credential */
export async function buildSmartAccount(credential: P256Credential): Promise<SmartAccount> {
  return toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
  })
}

// ── transfers ─────────────────────────────────────────────────────────────────

/**
 * Send USDC from a smart account.
 * Gas is sponsored by Circle Gas Station — user pays zero gas.
 * @param account  The sender's Circle Smart Account
 * @param to       Recipient address (0x…)
 * @param amount   USDC amount as a decimal string, e.g. "25.00"
 * @returns        On-chain transaction hash
 */
export async function sendUsdc(
  account: SmartAccount,
  to: `0x${string}`,
  amount: string,
): Promise<`0x${string}`> {
  const amountRaw = parseUsdc(amount)

  const callData = encodeTransfer(to, ContractAddress.ArcTestnet_USDC, amountRaw)

  const userOpHash = await bundlerClient.sendUserOperation({
    account,
    calls: [callData],
    paymaster: true,
  })

  const { receipt } = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })

  return receipt.transactionHash
}
