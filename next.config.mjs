import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next.js 14 key for server-only packages
    serverComponentsExternalPackages: [
      '@circle-fin/developer-controlled-wallets',
      '@circle-fin/smart-contract-platform',
      '@circle-fin/user-controlled-wallets',
      '@coinbase/cdp-sdk',
    ],
  },
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/onchain-facts': path.resolve(__dirname, 'src/onchain-facts.ts'),
      '@/onchain-money': path.resolve(__dirname, 'src/onchain-money.ts'),
      '@/onchain-wait': path.resolve(__dirname, 'src/onchain-wait.ts'),
    }

    if (!isServer) {
      // Stub packages that should never be in the browser bundle
      const externals = [
        '@circle-fin/developer-controlled-wallets',
        '@circle-fin/smart-contract-platform',
        '@circle-fin/user-controlled-wallets',
        '@coinbase/cdp-sdk',
        '@x402/evm',
      ]
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false }
      config.plugins = config.plugins ?? []
      // Provide empty modules for these packages on the client
      for (const pkg of externals) {
        config.resolve.alias[pkg] = path.resolve(__dirname, 'lib/empty-module.js')
      }
    }

    return config
  },
}

export default nextConfig
