import { CheckedAddress, raise } from '@sparkdotfi/common-universal'
import { Address } from 'viem'
import { useStore } from '../state'
import { getOriginChainId, useOriginChainId } from './useOriginChainId'

export function getOptionalContractAddress(
  addressMap: Record<number, Address>,
  chainId: number,
): CheckedAddress | null {
  const sandbox = useStore.getState().sandbox.network
  const originChainId = getOriginChainId(chainId, sandbox)

  const address = addressMap[originChainId]

  return address ? CheckedAddress(address) : null
}

export function getContractAddress(addressMap: Record<number, Address>, chainId: number): CheckedAddress {
  const address = getOptionalContractAddress(addressMap, chainId)

  return address ?? raise(`Contract address for chain ${chainId} not found`)
}

export function useContractAddress(addressMap: Record<number, Address>): CheckedAddress {
  const chainId = useOriginChainId()
  return getContractAddress(addressMap, chainId)
}
