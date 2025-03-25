import { SavingsConverter } from '@/domain/savings-converters/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

const SECONDS_PER_DAY = 24 * 60 * 60

export interface CalculateProjectionsParams {
  timestamp: number // in seconds
  shares: NormalizedUnitNumber
  savingsConverter: SavingsConverter
}
export function calculateOneYearProjection({
  timestamp,
  shares,
  savingsConverter,
}: CalculateProjectionsParams): NormalizedUnitNumber {
  const base = savingsConverter.convertToAssets({ shares })
  return NormalizedUnitNumber(
    savingsConverter.predictAssetsAmount({ timestamp: timestamp + 365 * SECONDS_PER_DAY, shares }).minus(base),
  )
}
