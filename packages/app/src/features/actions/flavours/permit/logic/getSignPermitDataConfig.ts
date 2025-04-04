import { Address } from 'viem'
import { UseSignTypedDataReturnType } from 'wagmi'

import { Token } from '@/domain/types/Token'
import { UnixTime, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

const EIP2612_TYPES = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const
type EIP2612_TYPES = typeof EIP2612_TYPES

export interface GetSignDataConfigArgs {
  token: Token
  value: NormalizedNumber
  spender: Address
  account: Address
  deadline: number
  chainId: number
  contractName: string
  nonce: bigint
}

export function getSignPermitDataConfig({
  token,
  value,
  spender,
  account,
  chainId,
  deadline,
  contractName,
  nonce,
}: GetSignDataConfigArgs): Parameters<UseSignTypedDataReturnType<EIP2612_TYPES>['signTypedData']>[0] {
  return {
    types: EIP2612_TYPES,
    primaryType: 'Permit',
    domain: {
      name: contractName,
      version: '1',
      chainId,
      verifyingContract: token.address,
    },
    message: {
      owner: account,
      spender,
      value: toBigInt(token.toBaseUnit(value)),
      nonce,
      deadline: UnixTime(deadline),
    },
  }
}
