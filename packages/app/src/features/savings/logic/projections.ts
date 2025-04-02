import { SavingsConverter } from '@/domain/savings-converters/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

const SECONDS_PER_DAY = 24 * 60 * 60

export interface CalculateProjectionsParams {
  timestamp: number // in seconds
  shares: NormalizedNumber
  savingsConverter: SavingsConverter
}
export function calculateOneYearProjection({
  timestamp,
  shares,
  savingsConverter,
}: CalculateProjectionsParams): NormalizedNumber {
  const base = savingsConverter.convertToAssets({ shares })
  return NormalizedNumber(
    savingsConverter.predictAssetsAmount({ timestamp: timestamp + 365 * SECONDS_PER_DAY, shares }).minus(base),
  )
}
