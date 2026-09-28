# Rekuway Pay

> A USDC payment terminal built on Arc Network — fast, gasless, and non-custodial.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Circle](https://img.shields.io/badge/Circle-Modular_Wallets-00D4A8?logo=circle)
![Arc Network](https://img.shields.io/badge/Arc-Testnet-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

Rekuway Pay is a point-of-sale app that lets merchants accept USDC payments on Arc Network instantly. Customers scan a QR code and pay from any EVM-compatible wallet. Transactions are confirmed on-chain in seconds, with zero gas fees for the end user thanks to Circle Gas Station.

---

## Features

- **Passkey login** — passwordless account creation using WebAuthn (Face ID / fingerprint / device PIN) via Circle Modular Wallets
- **Charge** — enter an amount, generate a QR code (EIP-681), and wait for automatic on-chain confirmation
- **Send USDC** — gasless transfer to any address on Arc Testnet via `sendUserOperation`
- **Receive** — display your wallet address and QR for incoming payments
- **Transaction history** — persisted in PostgreSQL, with real tx hashes linked to ArcScan
- **Real-time polling** — detects incoming USDC transfers via `eth_getLogs` every 5 seconds

---

## Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Framework    | Next.js 14 App Router                  |
| Language     | TypeScript 5                           |
| Styling      | Tailwind CSS v3                        |
| Wallet       | Circle Modular Wallets (ERC-4337 MSCA) |
| Chain        | Arc Testnet (USDC as native gas)       |
| Database     | PostgreSQL (Docker)                    |
| Code quality | ESLint 8 + Prettier + Husky pre-commit |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://www.docker.com) (for PostgreSQL)
- A Circle developer account — [console.circle.com](https://console.circle.com)

### 1. Clone the repo

```bash
git clone https://github.com/andromedacripto/rekuwaypay.git
cd rekuwaypay
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                 | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_CLIENT_KEY` | Circle Client Key from Console → Keys → Client Keys      |
| `NEXT_PUBLIC_CLIENT_URL` | Fixed: `https://modular-sdk.circle.com/v1/rpc/w3s/buidl` |
| `DATABASE_URL`           | PostgreSQL connection string                             |

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Run the dev server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Circle Console Setup

Before using passkey login you must configure the Circle Console:

1. **Console → Keys → Client Keys** — create a Client Key and copy it to `NEXT_PUBLIC_CLIENT_KEY`
2. **Allowed Domain** — set to your app's exact hostname (e.g. `localhost:5173` for local dev)
3. **Console → Wallets → Modular Wallets → Configurator → Passkeys → Domain Name** — same hostname

> Passkeys are domain-bound. The domain here must match the origin your app runs on exactly.

---

## Project Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── transactions/ # CRUD for payment records
│   │   ├── wallets/      # Wallet registry
│   │   ├── poll/         # On-chain payment detection (eth_getLogs)
│   │   └── users/        # User registration
│   ├── layout.tsx
│   └── page.tsx
├── components/           # UI screens (Cobrar, QR, Pagar, Receber, etc.)
├── hooks/                # useModularWallet — passkey session management
├── lib/
│   ├── modular-wallet.ts # Circle SDK: passkey transport + smart account + sendUsdc
│   ├── db.ts             # PostgreSQL client (pg)
│   └── types.ts          # Shared TypeScript types
└── docker-compose.yml    # PostgreSQL service
```

---

## Available Scripts

```bash
bun run dev          # Start dev server on port 5173
bun run build        # Production build
bun run lint         # ESLint
bun run lint:fix     # ESLint --fix
bun run format       # Prettier --write
bun run typecheck    # tsc --noEmit
```

---

## Testnet Funding

To test payments, get free USDC on Arc Testnet:

1. Connect your wallet in the app
2. Use the **"Get test USDC"** button in Arc Studio sidebar, or
3. Visit [faucet.circle.com](https://faucet.circle.com) and select Arc Testnet

---

## Security Notes

- `.env` and `.circle/` are in `.gitignore` — never commit secrets
- Passkey credentials are stored in `localStorage` for demo purposes only — use `httpOnly` cookies in production
- This app runs on **testnet only** — do not use real funds

---

## License

MIT © 2026 Rekuway Pay
