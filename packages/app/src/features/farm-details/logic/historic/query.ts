import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { CheckedAddress } from '@marsfoundation/common-universal'
import { queryOptions, skipToken } from '@tanstack/react-query'
import { z } from 'zod'

export interface FarmHistoricDataParameters {
  chainId: number
  farmAddress: CheckedAddress
  historyCutoff?: Date
  getFarmDetailsApiUrl: ((address: CheckedAddress) => string) | undefined
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function farmHistoricDataQueryOptions({
  chainId,
  farmAddress,
  historyCutoff,
  getFarmDetailsApiUrl,
}: FarmHistoricDataParameters) {
  return queryOptions({
    queryKey: ['farm-historic-data', chainId, farmAddress],
    queryFn: getFarmDetailsApiUrl
      ? async () => {
          const res = await fetch(getFarmDetailsApiUrl(farmAddress))
          if (!res.ok) {
            throw new Error(`Failed to fetch farm data: ${res.statusText}`)
          }

          const data = historicDataResponseSchema.parse(await res.json())

          if (historyCutoff) {
            return data.filter((result) => result.date >= historyCutoff)
          }

          return data
        }
      : skipToken,
  })
}

const historicDataResponseSchema = z
  .object({
    results: z.array(
      z.object({
        date: z.string().transform((value) => new Date(value)),
        apr: z.string().transform((value) => Percentage(value, { allowMoreThan1: true })),
        total_staked: z.string().transform((value) => NormalizedUnitNumber(value)),
      }),
    ),
  })
  .transform((value) =>
    value.results.map((result) => ({
      date: result.date,
      apy: result.apr,
      tvl: result.total_staked,
    })),
  )
