import { UserConfiguration, UserPosition, UserPositionSummary } from '@/domain/market-info/marketInfo'

export type CollateralType = 'disabled' | 'enabled' | 'unavailable' | 'isolated_enabled' | 'isolated_disabled'

export function collateralTypeToDescription(type: CollateralType): string {
  switch (type) {
    case 'disabled':
      return 'Disabled'
    case 'enabled':
      return 'Enabled'
    case 'unavailable':
      return 'Unavailable'
    case 'isolated_enabled':
      return 'Enabled (Isolated)'
    case 'isolated_disabled':
      return 'Disabled (Isolated)'
  }
}

export interface GetCollateralTypeArgs {
  position: UserPosition
  summary: UserPositionSummary
  userConfiguration: UserConfiguration
}

export function getCollateralType({ position, summary, userConfiguration }: GetCollateralTypeArgs): CollateralType {
  let willBeUsedAsCollateral: CollateralType = 'enabled'
  const userHasSuppliedReserve = !position.scaledATokenBalance.eq(0)
  const userHasCollateral = !summary.totalCollateralUSD.gt(0)

  if (!position.reserve.usageAsCollateralEnabled) {
    willBeUsedAsCollateral = 'disabled'
  } else if (position.reserve.isIsolated) {
    // Note: is debt ceiling only used for isolated assets?
    const debtCeiling = position.reserve.debtCeiling
    const isolationModeTotalDebt = position.reserve.isolationModeTotalDebt
    const debtCeilingUsage = isolationModeTotalDebt.div(debtCeiling).times(100)
    const isMaxed = debtCeiling.eq(0) ? false : debtCeilingUsage.gte(99.99)

    if (isMaxed) {
      willBeUsedAsCollateral = 'unavailable'
    } else if (userConfiguration.isolationModeState.enabled) {
      if (userHasSuppliedReserve) {
        willBeUsedAsCollateral = position.reserve.usageAsCollateralEnabledOnUser
          ? 'isolated_enabled'
          : 'isolated_disabled'
      } else {
        if (userHasCollateral) {
          willBeUsedAsCollateral = 'isolated_disabled'
        }
      }
    } else {
      if (userHasCollateral) {
        willBeUsedAsCollateral = 'isolated_disabled'
      } else {
        willBeUsedAsCollateral = 'isolated_enabled'
      }
    }
  } else {
    if (userConfiguration.isolationModeState.enabled) {
      willBeUsedAsCollateral = 'disabled'
    } else {
      if (userHasSuppliedReserve) {
        willBeUsedAsCollateral = position.reserve.usageAsCollateralEnabledOnUser ? 'enabled' : 'disabled'
      } else {
        willBeUsedAsCollateral = 'enabled'
      }
    }
  }

  return willBeUsedAsCollateral
}
