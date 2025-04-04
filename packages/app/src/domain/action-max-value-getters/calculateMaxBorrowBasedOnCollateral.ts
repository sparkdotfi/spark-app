import BigNumber from 'bignumber.js'

import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

interface CalculateMaxBorrowBasedOnCollateralParams {
  totalCollateralUSD: NormalizedNumber
  totalBorrowsUSD: NormalizedNumber
  maxLoanToValue: Percentage
  borrowingAssetPriceUsd: BigNumber
}

export function calculateMaxBorrowBasedOnCollateral({
  totalCollateralUSD,
  totalBorrowsUSD,
  maxLoanToValue,
  borrowingAssetPriceUsd,
}: CalculateMaxBorrowBasedOnCollateralParams): NormalizedNumber {
  return totalCollateralUSD
    .times(NormalizedNumber(maxLoanToValue))
    .minus(totalBorrowsUSD)
    .div(NormalizedNumber(borrowingAssetPriceUsd))
}
