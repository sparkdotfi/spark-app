import { useMemo } from 'react'
import { Address, privateKeyToAccount } from 'viem/accounts'
import { useChainId } from 'wagmi'

import { useStore } from '@/domain/state'

export interface UseSandboxStateResult {
  isSandboxEnabled: boolean
  isDevSandboxEnabled: boolean
  isInSandbox: boolean
  rpcUrl?: string
  sandboxChainId?: number
  originChainId?: number
  isEphemeralAccount: (address: Address) => boolean
  deleteSandbox: () => void
}

export function useSandboxState(): UseSandboxStateResult {
  const isSandboxEnabled = import.meta.env.VITE_FEATURE_SANDBOX === '1'
  const isDevSandboxEnabled = import.meta.env.VITE_FEATURE_DEV_SANDBOX === '1'

  if (!isSandboxEnabled) {
    return {
      isInSandbox: false,
      isDevSandboxEnabled: false,
      isSandboxEnabled: false,
      isEphemeralAccount: () => false,
      deleteSandbox: () => {},
    }
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const chainId = useChainId()
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const { network, setNetwork } = useStore((state) => state.sandbox)
  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const ephemeralAccountAddress = useMemo(
    () => network?.ephemeralAccountPrivateKey && privateKeyToAccount(network.ephemeralAccountPrivateKey).address,
    [network?.ephemeralAccountPrivateKey],
  )

  return {
    isSandboxEnabled,
    isDevSandboxEnabled,
    isInSandbox: network?.forkChainId === chainId,
    rpcUrl: network?.forkUrl,
    sandboxChainId: network?.forkChainId,
    originChainId: network?.originChainId,
    isEphemeralAccount: (address: Address) => ephemeralAccountAddress === address,
    deleteSandbox: () => {
      setNetwork(undefined)
    },
  }
}
