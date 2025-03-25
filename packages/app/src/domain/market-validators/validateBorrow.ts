import { assert, CheckedAddress, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { calculateMaxBorrowBasedOnCollateral } from '../action-max-value-getters/calculateMaxBorrowBasedOnCollateral'
import { MarketInfo, Reserve, UserPositionSummary } from '../market-info/marketInfo'
import { ReserveStatus } from '../market-info/reserve-status'

export interface ValidateBorrowParams {
  value: NormalizedUnitNumber

  asset: {
    address: CheckedAddress
    status: ReserveStatus
    borrowingEnabled: boolean
    availableLiquidity: NormalizedUnitNumber
    totalDebt: NormalizedUnitNumber
    borrowCap?: NormalizedUnitNumber
    isSiloed: boolean
    borrowableInIsolation: boolean
    eModeCategory: number
  }

  user: {
    maxBorrowBasedOnCollateral: NormalizedUnitNumber
    totalBorrowedUSD: NormalizedUnitNumber
    isInSiloMode: boolean
    siloModeAsset?: CheckedAddress
    inIsolationMode: boolean
    isolationModeCollateralTotalDebt?: NormalizedUnitNumber
    isolationModeCollateralDebtCeiling?: NormalizedUnitNumber
    eModeCategory: number
  }
}

export type BorrowValidationIssue =
  | 'value-not-positive'
  | 'reserve-not-active'
  | 'reserve-borrowing-disabled'
  | 'exceeds-liquidity'
  | 'borrow-cap-reached'
  | 'insufficient-collateral'
  | 'siloed-mode-cannot-enable'
  | 'siloed-mode-enabled'
  | 'asset-not-borrowable-in-isolation'
  | 'isolation-mode-debt-ceiling-exceeded'
  | 'emode-category-mismatch'

export function validateBorrow({
  value,
  asset: {
    address,
    status,
    borrowingEnabled,
    availableLiquidity,
    totalDebt,
    borrowCap,
    isSiloed,
    borrowableInIsolation,
    eModeCategory: assetEModeCategory,
  },
  user: {
    maxBorrowBasedOnCollateral,
    totalBorrowedUSD,
    isInSiloMode,
    siloModeAsset,
    inIsolationMode,
    isolationModeCollateralTotalDebt,
    isolationModeCollateralDebtCeiling,
    eModeCategory: userEModeCategory,
  },
}: ValidateBorrowParams): BorrowValidationIssue | undefined {
  const borrowedAnythingBefore = !totalBorrowedUSD.isEqualTo(0)

  if (value.isLessThanOrEqualTo(0)) {
    return 'value-not-positive'
  }

  if (status !== 'active') {
    return 'reserve-not-active'
  }

  if (!borrowingEnabled) {
    return 'reserve-borrowing-disabled'
  }

  if (availableLiquidity.lt(value)) {
    return 'exceeds-liquidity'
  }

  if (borrowCap?.lt(totalDebt.plus(value))) {
    return 'borrow-cap-reached'
  }

  if (value.gt(maxBorrowBasedOnCollateral)) {
    return 'insufficient-collateral'
  }

  if (inIsolationMode) {
    if (!borrowableInIsolation) {
      return 'asset-not-borrowable-in-isolation'
    }

    assert(
      isolationModeCollateralTotalDebt && isolationModeCollateralDebtCeiling,
      'Collateral total debt, ceiling and decimals should be defined',
    )

    if (isolationModeCollateralTotalDebt.plus(value).gt(isolationModeCollateralDebtCeiling)) {
      return 'isolation-mode-debt-ceiling-exceeded'
    }
  }

  if (userEModeCategory !== 0 && userEModeCategory !== assetEModeCategory) {
    return 'emode-category-mismatch'
  }

  if (borrowedAnythingBefore) {
    if (isInSiloMode) {
      if (address !== siloModeAsset) {
        return 'siloed-mode-enabled'
      }
    } else {
      if (isSiloed) {
        return 'siloed-mode-cannot-enable'
      }
    }
  }
}

export const borrowValidationIssueToMessage: Record<BorrowValidationIssue, string> = {
  'value-not-positive': 'Borrow value should be positive',
  'exceeds-liquidity': 'Borrow value exceeds liquidity',
  'borrow-cap-reached': 'Borrow cap reached',
  'insufficient-collateral': 'Not enough collateral to borrow this amount',
  'siloed-mode-enabled': 'Siloed borrowing enabled. Borrowing other assets is not allowed.',
  'siloed-mode-cannot-enable':
    "Borrowing asset is siloed. Can't add it to position with other assets already borrowed.",
  'reserve-not-active': 'Borrowing is not available for this asset',
  'reserve-borrowing-disabled': 'Borrowing is not available for this asset',
  'asset-not-borrowable-in-isolation': 'Borrowing is not available for this asset in isolation mode',
  'isolation-mode-debt-ceiling-exceeded': 'Borrowing exceeds isolation mode debt ceiling',
  'emode-category-mismatch': 'Asset and user eMode categories do not match',
}

export function getValidateBorrowArgs(
  value: NormalizedUnitNumber,
  reserve: Reserve,
  marketInfo: MarketInfo,
  _userSummary?: UserPositionSummary,
): ValidateBorrowParams {
  const userSummary = _userSummary ?? marketInfo.userPositionSummary

  return {
    value,
    asset: {
      address: reserve.token.address,
      status: reserve.status,
      borrowingEnabled: reserve.borrowEligibilityStatus !== 'no',
      availableLiquidity: reserve.availableLiquidity,
      totalDebt: reserve.totalDebt,
      borrowCap: reserve.borrowCap,
      isSiloed: reserve.isSiloedBorrowing,
      borrowableInIsolation: reserve.isBorrowableInIsolation,
      eModeCategory: reserve.eModeCategory?.id ?? 0,
    },
    user: {
      maxBorrowBasedOnCollateral: calculateMaxBorrowBasedOnCollateral({
        borrowingAssetPriceUsd: reserve.token.unitPriceUsd,
        totalCollateralUSD: userSummary.totalCollateralUSD,
        maxLoanToValue: userSummary.maxLoanToValue,
        totalBorrowsUSD: marketInfo.userPositionSummary.totalBorrowsUSD,
      }),
      totalBorrowedUSD: userSummary.totalBorrowsUSD,
      isInSiloMode: marketInfo.userConfiguration.siloBorrowingState.enabled,
      siloModeAsset: marketInfo.userConfiguration.siloBorrowingState.enabled
        ? marketInfo.userConfiguration.siloBorrowingState.siloedBorrowingReserve.token.address
        : undefined,
      inIsolationMode: marketInfo.userConfiguration.isolationModeState.enabled,
      isolationModeCollateralTotalDebt: marketInfo.userConfiguration.isolationModeState.enabled
        ? marketInfo.userConfiguration.isolationModeState.isolatedBorrowingReserve.isolationModeTotalDebt
        : undefined,
      isolationModeCollateralDebtCeiling: marketInfo.userConfiguration.isolationModeState.enabled
        ? marketInfo.userConfiguration.isolationModeState.isolatedBorrowingReserve.debtCeiling
        : undefined,
      eModeCategory: marketInfo.userConfiguration.eModeState.enabled
        ? marketInfo.userConfiguration.eModeState.category.id
        : 0,
    },
  }
}
