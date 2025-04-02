import { Token } from '@/domain/types/Token'
import { NormalizedNumber, toBigInt } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'

export interface FormatMinAmountOutForPsm3Params {
  susds: Token
  susdsAmount: NormalizedNumber
  assetIn: Token
}

// Based on calculated precise value of minAmountOut for PSM3 swapExactIn,
// format it to the bigint value which is accepted by PSM3 contract.
// This is needed because the formatted value may be different dependent
// on the assetOut - for instance, for USDC the sUSDS amount is rounded up
// to 6 decimals.
export function formatMinAmountOutForPsm3({ susds, susdsAmount, assetIn }: FormatMinAmountOutForPsm3Params): bigint {
  return toBigInt(susds.toBaseUnit(NormalizedNumber(susdsAmount.decimalPlaces(assetIn.decimals, BigNumber.ROUND_DOWN))))
}
