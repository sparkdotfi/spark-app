import { http, Chain, Transport } from 'viem'
import { arbitrum, base, gnosis, mainnet } from 'viem/chains'
import { VIEM_TIMEOUT_ON_FORKS } from './config.e2e'
import { getInjectedNetwork } from './getInjectedNetwork'

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY

export interface GetTransportsParamsOptions {
  forkChain?: Chain
}

export type GetTransportsResult = Record<number, Transport>

export function getTransports({ forkChain }: GetTransportsParamsOptions): GetTransportsResult {
  const transports: Record<number, Transport> = {
    // [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [mainnet.id]: http('https://virtual.mainnet.rpc.tenderly.co/993c5bf4-19cf-4195-95c0-1e3f36ab2624'),
    [gnosis.id]: http(`https://gnosis-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  }

  if (forkChain) {
    transports[forkChain.id] = http(forkChain.rpcUrls.default.http[0], { timeout: VIEM_TIMEOUT_ON_FORKS })
  }

  if (import.meta.env.VITE_FEATURE_RPC_INJECTION_VIA_URL === '1') {
    const injectedNetwork = getInjectedNetwork()
    if (injectedNetwork) {
      transports[injectedNetwork.chainId] = http(injectedNetwork.rpc)
    }
  }

  return transports
}
