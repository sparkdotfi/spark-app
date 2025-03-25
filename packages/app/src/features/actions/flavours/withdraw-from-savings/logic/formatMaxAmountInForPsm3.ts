import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber, toBigInt } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'

export interface FormatMaxAmountInForPsm3Params {
  susds: Token
  susdsAmount: NormalizedUnitNumber
  assetOut: Token
}

// Based on calculated precise value of maxAmountIn for PSM3 swapExactOut,
// format it to the bigint value which is accepted by PSM3 contract.
// This is needed because the formatted value may be different dependent
// on the assetOut - for instance, for USDC the sUSDS amount is rounded up
// to 6 decimals.
export function formatMaxAmountInForPsm3({ susds, susdsAmount, assetOut }: FormatMaxAmountInForPsm3Params): bigint {
  return toBigInt(
    susds.toBaseUnit(NormalizedUnitNumber(susdsAmount.decimalPlaces(assetOut.decimals, BigNumber.ROUND_UP))),
  )
}
