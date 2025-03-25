import { queryOptions } from '@tanstack/react-query'
import { Address } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

import {
  lendingPoolAddressProviderAddress,
  walletBalanceProviderAbi,
  walletBalanceProviderConfig,
} from '@/config/contracts-generated'

import { CheckedAddress } from '@sparkdotfi/common-universal'
import { BaseUnitNumber } from '@sparkdotfi/common-universal'
import { getContractAddress } from '../hooks/useContractAddress'
import { getBalancesQueryKeyPrefix } from './getBalancesQueryKeyPrefix'

export interface MarketBalancesQueryKeyParams {
  account?: Address
  chainId: number
}
export interface MarketBalancesParams extends MarketBalancesQueryKeyParams {
  wagmiConfig: Config
}

export interface BalanceItem {
  address: CheckedAddress
  balanceBaseUnit: BaseUnitNumber
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function marketBalances({ wagmiConfig, account, chainId }: MarketBalancesParams) {
  const lendingPoolAddressProvider = getContractAddress(lendingPoolAddressProviderAddress, chainId)

  return queryOptions<BalanceItem[]>({
    queryKey: marketBalancesQueryKey({ account, chainId }),
    queryFn: async () => {
      if (!account) {
        return []
      }

      const [addresses, balances] = await readContract(wagmiConfig, {
        address: getContractAddress(walletBalanceProviderConfig.address, chainId),
        abi: walletBalanceProviderAbi,
        functionName: 'getUserWalletBalances',
        args: [lendingPoolAddressProvider, account],
        chainId,
      })

      return addresses
        .map(
          (address, index): BalanceItem => ({
            address: CheckedAddress(address),
            balanceBaseUnit: BaseUnitNumber(balances[index]!),
          }),
        )
        .sort((a, b) => b.balanceBaseUnit.minus(a.balanceBaseUnit).toNumber())
    },
  })
}

export function marketBalancesQueryKey({ account, chainId }: MarketBalancesQueryKeyParams): unknown[] {
  return [...getBalancesQueryKeyPrefix({ account, chainId }), 'market-balances']
}
