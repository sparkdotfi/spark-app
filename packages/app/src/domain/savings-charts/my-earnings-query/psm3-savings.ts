import { infoSkyApiUrl } from '@/config/consts'
import { normalizedNumberSchema } from '@/domain/common/validation'
import { dateSchema } from '@/utils/schemas'
import { CheckedAddress, NormalizedNumber } from '@sparkdotfi/common-universal'
import { QueryKey, queryOptions } from '@tanstack/react-query'
import { sort } from 'd3-array'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function psm3SavingsMyEarningsQueryOptions(wallet: CheckedAddress, chainId: number) {
  return queryOptions({
    queryKey: ['my-earnings', chainId, wallet] as QueryKey,
    queryFn: async () => {
      const res = await fetch(
        `${infoSkyApiUrl}/savings-rate/wallets/${wallet.toLowerCase()}/?days_ago=9999&chainId=${chainId}`,
      )

      if (!res.ok) {
        throw new Error(`Failed to fetch my earnings data: ${res.statusText}`)
      }

      const data = myEarningsDataResponseSchema.parse(await res.json())

      return data
    },
  })
}

const myEarningsDataResponseSchema = z
  .array(
    z.object({
      datetime: dateSchema,
      balance: normalizedNumberSchema.optional(),
      susds_balance: normalizedNumberSchema.optional(),
      susdc_balance: normalizedNumberSchema.optional(),
    }),
  )
  .transform((data) => {
    const sortedData = sort(data, (a, b) => a.datetime.getTime() - b.datetime.getTime())

    return sortedData.map((item) => ({
      date: item.datetime,
      balance: item.balance ?? NormalizedNumber.ZERO,
      susdcBalance: item.susdc_balance ?? NormalizedNumber.ZERO,
    }))
  })

export type Psm3MyEarningsDataResponseSchema = z.infer<typeof myEarningsDataResponseSchema>
