import { infoSkyApiUrl } from '@/config/consts'
import { Farm } from '@/domain/farms/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { UseQueryResult, queryOptions, useQuery } from '@tanstack/react-query'
import { Address, zeroAddress } from 'viem'
import { z } from 'zod'

export interface UseRewardPointsDataParams {
  farm: Farm
  account: Address | undefined
}

export type UseRewardPointsDataResult = UseQueryResult<{
  rewardTokensPerSecond: NormalizedNumber
  rewardBalance: NormalizedNumber
  balance: NormalizedNumber
  updateTimestamp: number
} | null>

export function useRewardPointsData({ farm, account }: UseRewardPointsDataParams): UseRewardPointsDataResult {
  return useQuery(rewardPointsDataQueryOptions({ farm, account }))
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function rewardPointsDataQueryOptions({ farm, account = zeroAddress }: UseRewardPointsDataParams) {
  const farmAddress = farm.address

  return queryOptions({
    queryKey: getRewardPointsDataQueryKey({ farmAddress, account }),
    queryFn: async () => {
      if (farm.rewardType !== 'points') {
        return null
      }

      const res = await fetch(`${infoSkyApiUrl}/farms/${farmAddress}/wallets/${account}/`)

      if (!res.ok) {
        throw new Error(`Failed to fetch reward points data: ${res.statusText}`)
      }

      const data = rewardsPointsDataResponseSchema.parse(await res.json())

      return {
        rewardTokensPerSecond: data.reward_tokens_per_second,
        rewardBalance: data.reward_balance,
        balance: data.balance,
        updateTimestamp: data.reward_datetime_updated?.getTime() ?? Date.now(),
      }
    },
    refetchInterval: (query) => {
      if (query.state.data?.balance && !query.state.data.balance.eq(farm.staked)) {
        return 2_000
      }

      return undefined
    },
  })
}

export interface GetRewardPointsDataQueryKeyParams {
  farmAddress: Address
  account: Address | undefined
}

export function getRewardPointsDataQueryKey({ farmAddress, account }: GetRewardPointsDataQueryKeyParams): unknown[] {
  return ['reward-points-data', farmAddress, account]
}

const rewardsPointsDataResponseSchema = z.object({
  reward_tokens_per_second: z
    .string()
    .optional()
    .transform((value) => NormalizedNumber(value ?? '0')),
  reward_balance: z
    .string()
    .optional()
    .transform((value) => NormalizedNumber(value ?? '0')),
  balance: z
    .string()
    .optional()
    .transform((value) => NormalizedNumber(value ?? '0')),
  reward_datetime_updated: z.coerce.date().optional(),
})
