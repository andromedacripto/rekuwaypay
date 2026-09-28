import { createConfig, http } from 'wagmi'
import { getDefaultConfig } from 'connectkit'
import { requireChain } from '@/src/onchain-facts'

const arcTestnet = requireChain(5042002)

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [
      {
        id: arcTestnet.chainId,
        name: arcTestnet.name,
        nativeCurrency: {
          name: arcTestnet.nativeCurrency.symbol,
          symbol: arcTestnet.nativeCurrency.symbol,
          decimals: arcTestnet.nativeCurrency.decimals,
        },
        rpcUrls: {
          default: { http: arcTestnet.rpcUrls as [string, ...string[]] },
        },
        blockExplorers: {
          default: { name: 'ArcScan', url: arcTestnet.explorerBase },
        },
        testnet: arcTestnet.isTestnet,
      },
    ],
    transports: {
      [arcTestnet.chainId]: http(arcTestnet.rpcUrls[0]),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
    appName: 'Rekuway Pay',
    appDescription: 'Sua maquininha de pagamentos em USDC na Arc Network.',
  }),
)
