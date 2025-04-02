import { calculateGemConversionFactor } from '@/features/actions/utils/savings'
import { BaseUnitNumber, toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'

export interface CalculateGemMinAmountOutParams {
  gemDecimals: number
  assetsTokenDecimals: number
  assetsAmount: bigint
}

export function calculateGemMinAmountOut({
  gemDecimals,
  assetsTokenDecimals,
  assetsAmount,
}: CalculateGemMinAmountOutParams): bigint {
  const gemConversionFactor = NormalizedNumber(calculateGemConversionFactor({ gemDecimals, assetsTokenDecimals }))
  const gemMinAmountOut = BaseUnitNumber(
    NormalizedNumber(assetsAmount).div(gemConversionFactor).integerValue(BigNumber.ROUND_DOWN),
  )
  return toBigInt(gemMinAmountOut)
}
