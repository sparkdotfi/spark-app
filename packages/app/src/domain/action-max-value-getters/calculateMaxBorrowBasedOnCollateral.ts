import BigNumber from 'bignumber.js'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

interface CalculateMaxBorrowBasedOnCollateralParams {
  totalCollateralUSD: NormalizedUnitNumber
  totalBorrowsUSD: NormalizedUnitNumber
  maxLoanToValue: Percentage
  borrowingAssetPriceUsd: BigNumber
}

export function calculateMaxBorrowBasedOnCollateral({
  totalCollateralUSD,
  totalBorrowsUSD,
  maxLoanToValue,
  borrowingAssetPriceUsd,
}: CalculateMaxBorrowBasedOnCollateralParams): NormalizedUnitNumber {
  return totalCollateralUSD
    .times(NormalizedUnitNumber(maxLoanToValue))
    .minus(totalBorrowsUSD)
    .div(NormalizedUnitNumber(borrowingAssetPriceUsd))
}
