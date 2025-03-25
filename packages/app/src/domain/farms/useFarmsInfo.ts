import { getChainConfigEntry } from '@/config/chain'
import { assert } from '@sparkdotfi/common-universal'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { useTokenRepositoryForFeature } from '../token-repository/useTokenRepositoryForFeature'
import { farmsApiDetailsQueryOptions } from './farmApiDetailsQuery'
import { farmsBlockchainDetailsQueryOptions } from './farmBlockchainDetailsQuery'
import { FarmsInfo } from './farmsInfo'
import { Farm, FarmApiDetails, FarmBlockchainDetails } from './types'

export interface UseFarmsInfoParams {
  chainId: number
}

export interface UseFarmsInfoResult {
  farmsInfo: FarmsInfo
}

export function useFarmsInfo({ chainId }: UseFarmsInfoParams): UseFarmsInfoResult {
  const wagmiConfig = useConfig()
  const { address: account } = useAccount()

  const { farms } = getChainConfigEntry(chainId)
  const { tokenRepository } = useTokenRepositoryForFeature({ chainId, featureGroup: 'farms' })
  assert(farms, 'Farms config is not defined on this chain')
  const farmConfigs = farms.configs

  const farmsApiDetailsResult = useQuery(farmsApiDetailsQueryOptions({ farmConfigs }))

  const { data } = useSuspenseQuery({
    ...farmsBlockchainDetailsQueryOptions({ farmConfigs, wagmiConfig, tokenRepository, chainId, account }),
    select: useCallback(
      (data: FarmBlockchainDetails[]) => mergeBlockchainAndApiDetails(data, farmsApiDetailsResult.data),
      [farmsApiDetailsResult.data],
    ),
  })

  return { farmsInfo: new FarmsInfo(data) }
}

function mergeBlockchainAndApiDetails(
  blockchainDetails: FarmBlockchainDetails[],
  apiDetails: FarmApiDetails[] | undefined,
): Farm[] {
  return blockchainDetails.map((blockchainDetail, index) => {
    const rewardTokenPrice = apiDetails?.[index]?.rewardTokenPriceUsd
    const rewardToken = rewardTokenPrice
      ? blockchainDetail.rewardToken.clone({ unitPriceUsd: rewardTokenPrice })
      : blockchainDetail.rewardToken
    return {
      ...(apiDetails?.[index] ?? {}),
      ...blockchainDetail,
      rewardToken,
    }
  })
}
