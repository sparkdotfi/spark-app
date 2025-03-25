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
  const collateralBasedBorrowLimit = totalCollateralUSD
    .multipliedBy(maxLoanToValue)
    .minus(totalBorrowsUSD)
    .dividedBy(borrowingAssetPriceUsd)

  return NormalizedUnitNumber(collateralBasedBorrowLimit)
}
