import { bigNumberify } from '@sparkdotfi/common-universal'

import { AaveFormattedReserve } from './aave-data-layer/query'

export type ReserveStatus = 'active' | 'frozen' | 'paused' | 'not-active'
export function getReserveStatus(reserve: AaveFormattedReserve): ReserveStatus {
  if (!reserve.isActive) {
    return 'not-active'
  }

  if (reserve.isPaused) {
    return 'paused'
  }

  if (reserve.isFrozen) {
    return 'frozen'
  }

  return 'active'
}

export type SupplyAvailabilityStatus = 'yes' | 'supply-cap-reached' | 'no'
export function getSupplyAvailabilityStatus(reserve: AaveFormattedReserve): SupplyAvailabilityStatus {
  if (!reserve.isActive || reserve.isFrozen) {
    return 'no'
  }

  const supplyCap = bigNumberify(reserve.supplyCap)
  if (!supplyCap.eq(0) && supplyCap.lte(bigNumberify(reserve.totalLiquidity))) {
    return 'supply-cap-reached'
  }

  return 'yes'
}

export type CollateralEligibilityStatus = 'yes' | 'only-in-isolation-mode' | 'no'
export function getCollateralEligibilityStatus(reserve: AaveFormattedReserve): CollateralEligibilityStatus {
  if (!reserve.isActive || reserve.isFrozen || bigNumberify(reserve.baseLTVasCollateral).eq(0)) {
    return 'no'
  }

  if (reserve.isIsolated) {
    return 'only-in-isolation-mode'
  }

  return 'yes'
}

export type BorrowEligibilityStatus = 'yes' | 'only-in-siloed-mode' | 'borrow-cap-reached' | 'no'
export function getBorrowEligibilityStatus(reserve: AaveFormattedReserve): BorrowEligibilityStatus {
  if (!reserve.isActive || reserve.isFrozen || !reserve.borrowingEnabled) {
    return 'no'
  }

  const borrowCap = bigNumberify(reserve.borrowCap)
  if (!borrowCap.eq(0) && borrowCap.lte(bigNumberify(reserve.totalDebt))) {
    return 'borrow-cap-reached'
  }

  if (reserve.isSiloedBorrowing) {
    return 'only-in-siloed-mode'
  }

  return 'yes'
}

export type MarketAssetStatus = SupplyAvailabilityStatus | CollateralEligibilityStatus | BorrowEligibilityStatus
