import { NormalizedNumber } from '@sparkdotfi/common-universal'

interface GetBorrowMaxValueParams {
  asset: {
    availableLiquidity: NormalizedNumber
    totalDebt: NormalizedNumber
    borrowCap?: NormalizedNumber
  }
  user: {
    maxBorrowBasedOnCollateral: NormalizedNumber
    inIsolationMode?: boolean
    isolationModeCollateralTotalDebt?: NormalizedNumber
    isolationModeCollateralDebtCeiling?: NormalizedNumber
  }
  validationIssue?: string
}

export function getBorrowMaxValue({ asset, user, validationIssue }: GetBorrowMaxValueParams): NormalizedNumber {
  if (
    validationIssue === 'reserve-not-active' ||
    validationIssue === 'reserve-borrowing-disabled' ||
    validationIssue === 'asset-not-borrowable-in-isolation' ||
    validationIssue === 'siloed-mode-cannot-enable' ||
    validationIssue === 'siloed-mode-enabled' ||
    validationIssue === 'emode-category-mismatch'
  ) {
    return NormalizedNumber.ZERO
  }

  const ceilings = [
    asset.availableLiquidity,
    user.maxBorrowBasedOnCollateral.times(0.99), // take 99% of the max borrow value to ensure that liquidation is not triggered right after the borrow
  ]

  if (asset.borrowCap) {
    ceilings.push(asset.borrowCap.minus(asset.totalDebt))
  }

  const { inIsolationMode, isolationModeCollateralTotalDebt, isolationModeCollateralDebtCeiling } = user

  if (inIsolationMode && isolationModeCollateralTotalDebt && isolationModeCollateralDebtCeiling) {
    ceilings.push(isolationModeCollateralDebtCeiling.minus(isolationModeCollateralTotalDebt))
  }

  return NormalizedNumber.max(NormalizedNumber.min(...ceilings), NormalizedNumber.ZERO)
}
