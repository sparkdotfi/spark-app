import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { calculateMaxBorrowBasedOnCollateral } from './calculateMaxBorrowBasedOnCollateral'

describe(calculateMaxBorrowBasedOnCollateral.name, () => {
  it('calculates max borrow for an asset', () => {
    expect(
      calculateMaxBorrowBasedOnCollateral({
        totalCollateralUSD: NormalizedNumber(5000),
        maxLoanToValue: Percentage(0.8),
        totalBorrowsUSD: NormalizedNumber(1000),
        borrowingAssetPriceUsd: BigNumber(1500),
      }),
    ).toStrictEqual(NormalizedNumber(2))
  })
})
