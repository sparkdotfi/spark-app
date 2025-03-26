import { infoSkyApiUrl } from '@/config/consts'
import { normalizedUnitNumberSchema, percentageSchema } from '@/domain/common/validation'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { UseGeneralStatsResult } from '../types'

export interface GeneralStatsQueryResult {
  tvl: NormalizedUnitNumber
  stakers: number
  apr: Percentage
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function generalStatsQueryOptions() {
  return queryOptions<GeneralStatsQueryResult>({
    queryKey: ['savings-general-stats'],
    queryFn: async () => {
      const response = await fetch(`${infoSkyApiUrl}/spk-staking/stats/`)
      if (!response.ok) {
        throw new Error('Error fetching savings spk staking stats')
      }
      const result = await response.json()
      const parsedResult = generalStatsResponseSchema.parse(result)

      return {
        tvl: parsedResult.tvl,
        stakers: parsedResult.stakers,
        apr: parsedResult.apr,
      }
    },
  })
}

const generalStatsResponseSchema = z
  .object({
    tvl: normalizedUnitNumberSchema,
    number_of_wallets: z.number(),
    apr: percentageSchema,
  })
  .transform((o) => ({
    tvl: o.tvl,
    stakers: o.number_of_wallets,
    apr: o.apr,
  }))

export function useGeneralStats(): UseGeneralStatsResult {
  return useQuery(generalStatsQueryOptions())
}
