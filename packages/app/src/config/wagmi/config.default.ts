import { SandboxNetwork } from '@/domain/state/sandbox'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { raise } from '@sparkdotfi/common-universal'
import { Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'
import { Config } from 'wagmi'
import { getChains } from './getChains'
import { getTransports } from './getTransports'
import { getWallets } from './getWallets'
import { createWagmiStorage } from './storage'

export function getConfig(sandboxNetwork?: SandboxNetwork): Config {
  const forkChain = getForkChainFromSandboxConfig(sandboxNetwork)
  const transports = getTransports({ forkChain })
  const chains = getChains({ forkChain })
  const storage = createWagmiStorage()

  const config = getDefaultConfig({
    appName: 'Spark',
    projectId: import.meta.env.VITE_WALLET_CONNECT_ID || raise('Missing VITE_WALLET_CONNECT_ID'),
    chains,
    transports,
    wallets: getWallets(),
    storage,
  })

  return config
}

function getForkChainFromSandboxConfig(sandboxNetwork?: SandboxNetwork): Chain | undefined {
  if (!sandboxNetwork) {
    return undefined
  }

  const base = (() => {
    if (sandboxNetwork.originChainId === mainnet.id) {
      return mainnet
    }
    if (sandboxNetwork.originChainId === gnosis.id) {
      return gnosis
    }
    throw new Error(`Unsupported origin chain = ${sandboxNetwork.originChainId}!`)
  })()

  return {
    ...base,
    id: sandboxNetwork.forkChainId,
    name: sandboxNetwork.name,
    rpcUrls: {
      public: { http: [sandboxNetwork.forkUrl] },
      default: { http: [sandboxNetwork.forkUrl] },
    },
  }
}
