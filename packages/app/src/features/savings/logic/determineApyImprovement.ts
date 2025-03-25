import { SavingsConverter } from '@/domain/savings-converters/types'
import { Percentage } from '@sparkdotfi/common-universal'

export interface DetermineApyImprovementParams {
  savingsUsdsConverter: SavingsConverter | null
  savingsDaiConverter: SavingsConverter | null
}

export function determineApyImprovement({
  savingsUsdsConverter,
  savingsDaiConverter,
}: DetermineApyImprovementParams): Percentage | undefined {
  if (!savingsUsdsConverter || !savingsDaiConverter) {
    return undefined
  }
  const apyDifference = savingsUsdsConverter.apy.minus(savingsDaiConverter.apy)
  return apyDifference.gt(0) ? Percentage(apyDifference) : undefined
}
