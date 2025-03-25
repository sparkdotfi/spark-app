import { queryOptions } from '@tanstack/react-query'
import { Address } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { MAX_INT } from '@/config/consts'

import { CheckedAddress } from '@sparkdotfi/common-universal'
import { normalizeErc20AbiForToken } from './normalizeErc20Abi'

export interface AllowanceOptions {
  wagmiConfig: Config
  token: Address
  spender: Address
  account: Address
  chainId: number
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function allowance({ wagmiConfig, token, spender, account, chainId }: AllowanceOptions) {
  return queryOptions<bigint>({
    queryKey: allowanceQueryKey({ token, spender, account, chainId }),
    queryFn: () => {
      if (token === CheckedAddress.EEEE()) {
        return MAX_INT
      }

      return readContract(wagmiConfig, {
        functionName: 'allowance',
        address: token,
        abi: normalizeErc20AbiForToken(chainId, token),
        args: [account, spender],
      })
    },
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function allowanceQueryKey({ token, spender, account, chainId }: Omit<AllowanceOptions, 'wagmiConfig'>) {
  return [
    {
      entity: 'readContract',
      functionName: 'allowance',
      address: token,
      args: [account, spender],
      chainId,
    },
  ] as const
}
