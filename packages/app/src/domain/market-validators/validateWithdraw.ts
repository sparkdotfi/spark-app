import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { EModeCategory, EModeState } from '../market-info/marketInfo'
import { ReserveStatus } from '../market-info/reserve-status'

export type WithdrawValidationIssue =
  | 'value-not-positive'
  | 'exceeds-balance'
  | 'reserve-paused'
  | 'exceeds-unborrowed-liquidity'
  | 'exceeds-ltv'
  | 'reserve-not-active'
  | 'has-zero-ltv-collateral'

export interface ValidateWithdrawArgs {
  value: NormalizedUnitNumber
  asset: {
    status: ReserveStatus
    unborrowedLiquidity: NormalizedUnitNumber
    maxLtv: Percentage
    eModeCategory?: EModeCategory
  }
  user: {
    deposited: NormalizedUnitNumber
    liquidationThreshold: Percentage
    ltvAfterWithdrawal: Percentage
    eModeState: EModeState
    hasZeroLtvCollateral: boolean
  }
}

export function validateWithdraw({ value, asset, user }: ValidateWithdrawArgs): WithdrawValidationIssue | undefined {
  if (value.isLessThanOrEqualTo(0)) {
    return 'value-not-positive'
  }

  if (asset.status === 'not-active') {
    return 'reserve-not-active'
  }

  if (asset.status === 'paused') {
    return 'reserve-paused'
  }

  if (user.deposited.isLessThan(value)) {
    return 'exceeds-balance'
  }

  if (value.isGreaterThan(asset.unborrowedLiquidity)) {
    return 'exceeds-unborrowed-liquidity'
  }

  if (user.hasZeroLtvCollateral && !asset.maxLtv.isZero()) {
    return 'has-zero-ltv-collateral'
  }

  const liquidationThreshold =
    user.eModeState.enabled && user.eModeState.category.id === asset.eModeCategory?.id
      ? user.eModeState.category.liquidationThreshold
      : user.liquidationThreshold
  if (user.ltvAfterWithdrawal.gt(liquidationThreshold)) {
    return 'exceeds-ltv'
  }
}

export const withdrawalValidationIssueToMessage: Record<WithdrawValidationIssue, string> = {
  'value-not-positive': 'Withdraw value should be positive',
  'reserve-paused': 'Reserve is paused',
  'reserve-not-active': 'Reserve is not active',
  'exceeds-balance': 'Exceeds your balance',
  'exceeds-unborrowed-liquidity': 'Exceeds unborrowed liquidity',
  'exceeds-ltv': 'Remaining collateral cannot support the loan',
  'has-zero-ltv-collateral': 'Position is collateralized by an asset with 0 LTV',
}
