'use client'

/**
 * Modular Wallet helpers — passkey registration/login + gasless USDC send.
 * All Web3 complexity is hidden here. The rest of the app works with handles
 * and human-readable amounts only.
 */

import { createPublicClient } from 'viem'
import { arcTestnet } from 'viem/chains'
import {
  createBundlerClient,
  toWebAuthnAccount,
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
import { parseUsdc } from '@/onchain-money'

const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string
const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL as string

// Single passkey transport (WebAuthn credential operations)
export const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)

// Modular transport for Arc Testnet (bundler + public RPC)
const modularTransport = toModularTransport(`${clientUrl}/arcTestnet`, clientKey)

// Public client for Arc Testnet reads
export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: modularTransport,
})

// Bundler client for sending user operations
export const bundlerClient = createBundlerClient({
  chain: arcTestnet,
  transport: modularTransport,
})

export type { P256Credential }

/**
 * Register a new passkey with the given username (the handle part, e.g. "landerson").
 * Returns the credential to persist in the DB.
 */
export async function registerPasskey(username: string): Promise<P256Credential> {
  return toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register,
    username,
  })
}

/**
 * Login with an existing passkey. Returns the credential.
 */
export async function loginPasskey(): Promise<P256Credential> {
  return toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Login,
  })
}

/**
 * Derive a Circle Smart Account from a P256Credential.
 * The account address is deterministic — same credential always → same address.
 */
export async function getSmartAccount(credential: P256Credential) {
  return toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
  })
}

export interface SendResult {
  userOpHash: string
  txHash: string
}

/**
 * Send USDC gaslessly to a recipient address.
 * Gas is sponsored via Circle Gas Station (paymaster: true).
 * @param credential  The sender's P256Credential
 * @param toAddress   Recipient EVM address
 * @param amountUsdc  Human-readable USDC amount, e.g. "25.00"
 */
export async function sendUsdc(
  credential: P256Credential,
  toAddress: `0x${string}`,
  amountUsdc: string,
): Promise<SendResult> {
  const account = await getSmartAccount(credential)
  const amountRaw = parseUsdc(amountUsdc)

  const callData = encodeTransfer(toAddress, ContractAddress.ArcTestnet_USDC, amountRaw)

  const userOpHash = await bundlerClient.sendUserOperation({
    account,
    calls: [callData],
    paymaster: true,
  })

  const { receipt } = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })

  return {
    userOpHash,
    txHash: receipt.transactionHash,
  }
}
