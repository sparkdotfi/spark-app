import { useAccount, useChainId } from 'wagmi'

import { NotConnectedError } from '@/domain/errors/not-connected'

import { CheckedAddress } from '@sparkdotfi/common-universal'

export interface ConnectedInfo {
  chainId: number
  account: CheckedAddress
}

export function useConnectedAddress(): ConnectedInfo {
  const { address } = useAccount()
  const chainId = useChainId()

  if (!address) throw new NotConnectedError()

  return {
    chainId,
    account: CheckedAddress(address),
  }
}
