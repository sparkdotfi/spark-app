import BigNumber from 'bignumber.js'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

interface GetBorrowMaxValueParams {
  asset: {
    availableLiquidity: NormalizedUnitNumber
    totalDebt: NormalizedUnitNumber
    borrowCap?: NormalizedUnitNumber
  }
  user: {
    maxBorrowBasedOnCollateral: NormalizedUnitNumber
    inIsolationMode?: boolean
    isolationModeCollateralTotalDebt?: NormalizedUnitNumber
    isolationModeCollateralDebtCeiling?: NormalizedUnitNumber
  }
  validationIssue?: string
}

export function getBorrowMaxValue({ asset, user, validationIssue }: GetBorrowMaxValueParams): NormalizedUnitNumber {
  if (
    validationIssue === 'reserve-not-active' ||
    validationIssue === 'reserve-borrowing-disabled' ||
    validationIssue === 'asset-not-borrowable-in-isolation' ||
    validationIssue === 'siloed-mode-cannot-enable' ||
    validationIssue === 'siloed-mode-enabled' ||
    validationIssue === 'emode-category-mismatch'
  ) {
    return NormalizedUnitNumber(0)
  }

  const ceilings = [
    asset.availableLiquidity,
    user.maxBorrowBasedOnCollateral.multipliedBy(0.99), // take 99% of the max borrow value to ensure that liquidation is not triggered right after the borrow
  ]

  if (asset.borrowCap) {
    ceilings.push(NormalizedUnitNumber(asset.borrowCap.minus(asset.totalDebt)))
  }

  const { inIsolationMode, isolationModeCollateralTotalDebt, isolationModeCollateralDebtCeiling } = user

  if (inIsolationMode && isolationModeCollateralTotalDebt && isolationModeCollateralDebtCeiling) {
    ceilings.push(NormalizedUnitNumber(isolationModeCollateralDebtCeiling.minus(isolationModeCollateralTotalDebt)))
  }

  return NormalizedUnitNumber(BigNumber.max(BigNumber.min(...ceilings), 0))
}
