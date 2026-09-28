# Rekuway Pay

Maquininha de pagamentos em USDC na Arc Network.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Arc Testnet](https://img.shields.io/badge/Arc-Testnet-purple)
![Circle](https://img.shields.io/badge/Circle-Modular%20Wallets-green)

## Sobre

Rekuway Pay é um app de pagamentos onchain que permite cobrar, enviar e receber USDC na Arc Network sem precisar de banco ou intermediários. O cliente cria uma conta com biometria (passkey) e paga via QR Code — sem seed phrase, sem taxa de gas.

## Funcionalidades

- **Cobrar** — numpad para digitar o valor + QR Code EIP-681 gerado na hora
- **Pagamento detectado automaticamente** — polling onchain a cada 5s
- **Enviar USDC** — transferência gasless via Circle Gas Station
- **Receber** — QR Code com endereço da wallet
- **Histórico de transações** — persistido no PostgreSQL com link para o explorer
- **Login sem senha** — passkey (biometria / Face ID / PIN) via Circle Modular Wallets
- **Conta instantânea** — smart wallet ERC-4337 criada no primeiro acesso

## Stack

| Camada         | Tecnologia                                  |
| -------------- | ------------------------------------------- |
| Framework      | Next.js 14 App Router                       |
| Linguagem      | TypeScript 5                                |
| Estilo         | Tailwind CSS                                |
| Blockchain     | Arc Testnet (USDC nativo)                   |
| Wallets        | Circle Modular Wallets (passkey / ERC-4337) |
| Banco de dados | PostgreSQL (Docker)                         |
| Qualidade      | ESLint + Prettier + Husky                   |

## Pré-requisitos

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docker.com) (para o PostgreSQL)
- Conta no [Circle Console](https://console.circle.com) com Client Key configurada

## Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/andromedacripto/rekuwaypay.git
cd rekuwaypay
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
# Circle Modular Wallets
NEXT_PUBLIC_CLIENT_KEY=TEST-CLIENT-KEY:sua_chave_aqui
NEXT_PUBLIC_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl

# PostgreSQL
DATABASE_URL=postgresql://rekuway:rekuway@localhost:5432/rekuway
```

> Obtenha sua Client Key em: Console → Keys → Client Keys

### 4. Configure o Circle Console

1. **Client Key** → Allowed Domain: seu domínio (ex: `localhost:5173`)
2. **Modular Wallets → Passkeys → Domain Name**: mesmo domínio

### 5. Suba o banco de dados

```bash
docker compose up -d
```

### 6. Inicie o servidor de desenvolvimento

```bash
bun run dev
```

Acesse: http://localhost:5173

## Scripts

```bash
bun run dev        # Servidor de desenvolvimento
bun run build      # Build de produção
bun run lint       # ESLint
bun run lint:fix   # ESLint com auto-fix
bun run format     # Prettier
bun run typecheck  # TypeScript sem emitir
```

## Estrutura do projeto

```
rekuwaypay/
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers
│   │   ├── transactions/   # CRUD de transações
│   │   ├── wallets/        # Registro de wallets
│   │   ├── poll/           # Polling onchain
│   │   └── users/          # Usuários
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Componentes React
│   ├── LoginScreen.tsx     # Tela de login/cadastro
│   ├── CobrarScreen.tsx    # Numpad de cobrança
│   ├── QrGenerateScreen.tsx
│   ├── PagarScreen.tsx     # Enviar USDC
│   ├── ReceberScreen.tsx
│   ├── TransacoesScreen.tsx
│   └── ...
├── hooks/
│   └── useModularWallet.ts # Hook de sessão passkey
├── lib/
│   ├── modular-wallet.ts   # Circle SDK helpers
│   ├── db.ts               # PostgreSQL client
│   └── types.ts
└── docker-compose.yml
```

## Rede

O app roda na **Arc Testnet** por padrão:

- RPC: `https://rpc.testnet.arc.io`
- Chain ID: `5042002`
- Explorer: https://explorer.testnet.arc.io
- USDC: `0x3600000000000000000000000000000000000000`

Para obter USDC de teste, use o faucet em [faucet.circle.com](https://faucet.circle.com).

## Licença

MIT
