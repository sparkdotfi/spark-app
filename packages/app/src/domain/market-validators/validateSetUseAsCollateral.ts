import BigNumber from 'bignumber.js'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { MarketInfo } from '../market-info/marketInfo'
import { ReserveStatus } from '../market-info/reserve-status'
import { Token } from '../types/Token'

export interface ValidateSetUseAsCollateralParams {
  useAsCollateral: boolean
  asset: {
    balance: NormalizedUnitNumber
    status: ReserveStatus
    isUsedAsCollateral: boolean
    maxLtv: Percentage
  }
  user: {
    healthFactorAfterWithdrawal?: BigNumber
    inIsolationMode: boolean
    hasZeroLtvAssetsInCollateral: boolean
  }
}

export type SetUseAsCollateralValidationIssue =
  | 'collateral-already-enabled'
  | 'collateral-already-disabled'
  | 'zero-deposit-asset'
  | 'reserve-not-active'
  | 'zero-ltv-asset'
  | 'isolation-mode-active'
  | 'exceeds-ltv'
  | 'zero-ltv-assets-in-collateral'

export function validateSetUseAsCollateral({
  useAsCollateral,
  asset,
  user,
}: ValidateSetUseAsCollateralParams): SetUseAsCollateralValidationIssue | undefined {
  if (useAsCollateral === asset.isUsedAsCollateral) {
    if (useAsCollateral) {
      return 'collateral-already-enabled'
    }
    return 'collateral-already-disabled'
  }

  if (asset.balance.isZero()) {
    return 'zero-deposit-asset'
  }

  if (asset.status !== 'active') {
    return 'reserve-not-active'
  }

  // Enabling collateral
  if (useAsCollateral) {
    // @note: zero ltv means collateralizing is disabled
    if (asset.maxLtv.isZero()) {
      return 'zero-ltv-asset'
    }
    if (user.inIsolationMode) {
      return 'isolation-mode-active'
    }
  }
  // Disabling collateral
  else {
    // @todo: use actual LTV instead of health factor
    if (user.healthFactorAfterWithdrawal?.lt(1)) {
      return 'exceeds-ltv'
    }
    if (user.hasZeroLtvAssetsInCollateral && asset.maxLtv.gt(0)) {
      return 'zero-ltv-assets-in-collateral'
    }
  }
}

export const setUseAsCollateralValidationIssueToMessage: Record<SetUseAsCollateralValidationIssue, string> = {
  'collateral-already-enabled': 'Collateral setting for this asset is already enabled',
  'collateral-already-disabled': 'Collateral setting for this asset is already disabled',
  'zero-deposit-asset': 'Cannot use not deposited asset as collateral',
  'reserve-not-active': 'Cannot change collateral setting for inactive reserve',
  'zero-ltv-asset': 'This asset cannot be used as collateral',
  'isolation-mode-active': 'Cannot use other asset as collateral when in isolation mode',
  'exceeds-ltv': 'Disabling this collateral would cause liquidation call',
  'zero-ltv-assets-in-collateral': 'Cannot disable this collateral because other assets already have zero LTV',
}

export interface GetValidateSetUseAsCollateralArgsParams {
  useAsCollateral: boolean
  collateral: Token
  marketInfo: MarketInfo
  healthFactorAfterWithdrawal?: BigNumber
}
export function getValidateSetUseAsCollateralArgs({
  useAsCollateral,
  collateral,
  marketInfo,
  healthFactorAfterWithdrawal,
}: GetValidateSetUseAsCollateralArgsParams): ValidateSetUseAsCollateralParams {
  const collateralPosition = marketInfo.findOnePositionByToken(collateral)
  const hasZeroLtvAssetsInCollateral = marketInfo.userPositions.some(
    (position) =>
      position.reserve.usageAsCollateralEnabledOnUser &&
      position.collateralBalance.gt(0) &&
      position.reserve.maxLtv.isZero(),
  )

  return {
    useAsCollateral,
    asset: {
      balance: collateralPosition.collateralBalance,
      status: collateralPosition.reserve.status,
      isUsedAsCollateral: !useAsCollateral,
      maxLtv: collateralPosition.reserve.maxLtv,
    },
    user: {
      healthFactorAfterWithdrawal,
      hasZeroLtvAssetsInCollateral,
      inIsolationMode: marketInfo.userConfiguration.isolationModeState.enabled,
    },
  }
}
