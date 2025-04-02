import { FarmConfig } from '@/config/chain/types'
import { infoSkyApiUrl } from '@/config/consts'
import { FarmApiDetails } from '@/domain/farms/types'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { z } from 'zod'
import { normalizedNumberSchema, percentageAboveOneSchema } from '../common/validation'

export interface GetFarmParams {
  farmConfig: FarmConfig
}

export async function getFarmApiDetails({ farmConfig }: GetFarmParams): Promise<FarmApiDetails> {
  const baData = await getBAFarmData({ farmConfig })
  const rewardTokenPriceUsd = farmConfig.rewardType === 'token' ? baData.rewardTokenPriceUsd : undefined

  return {
    apy: baData.apy,
    totalRewarded: baData.totalRewarded,
    rewardTokenPriceUsd,
    depositors: baData.depositors,
  }
}

interface GetFarmBADataParams {
  farmConfig: FarmConfig
}

interface GetFarmBADataResult {
  apy: Percentage
  depositors: number
  rewardTokenPriceUsd: NormalizedNumber
  totalRewarded: NormalizedNumber
}

async function getBAFarmData({ farmConfig }: GetFarmBADataParams): Promise<GetFarmBADataResult> {
  const res = await fetch(`${infoSkyApiUrl}/farms/${farmConfig.address.toLowerCase()}/`)
  if (!res.ok) {
    throw new Error(`Failed to fetch farm data: ${res.statusText}`)
  }

  return baFarmDataResponseSchema.parse(await res.json())
}

const baFarmDataResponseSchema = z
  .object({
    apy: percentageAboveOneSchema,
    depositors: z.number(),
    price: normalizedNumberSchema,
    total_farmed: normalizedNumberSchema,
  })
  .transform(({ apy, depositors, price, total_farmed }) => ({
    apy,
    depositors,
    rewardTokenPriceUsd: price,
    totalRewarded: total_farmed,
  }))
