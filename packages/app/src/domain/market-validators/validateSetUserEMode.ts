import { NormalizedUnitNumber, Percentage, raise } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { MarketInfo } from '../market-info/marketInfo'

export interface ValidateSetUserEModeParams {
  requestedEModeCategory: {
    id: number
    liquidationThreshold: Percentage | undefined
  }
  user: {
    eModeCategoryId: number
    reserves: { eModeCategoryId?: number; borrowBalance: NormalizedUnitNumber }[]
    healthFactorAfterChangingEMode?: BigNumber
  }
}

export type SetUserEModeValidationIssue =
  | 'inconsistent-liquidation-threshold'
  | 'borrowed-assets-emode-category-mismatch'
  | 'exceeds-ltv'

export function validateSetUserEMode({
  requestedEModeCategory,
  user,
}: ValidateSetUserEModeParams): SetUserEModeValidationIssue | undefined {
  if (requestedEModeCategory.id !== 0) {
    if (requestedEModeCategory.liquidationThreshold?.isZero()) {
      return 'inconsistent-liquidation-threshold'
    }

    const isBorrowedAssetsEModeCategoryMismatch = user.reserves.some(
      (reserve) => reserve.borrowBalance.gt(0) && reserve.eModeCategoryId !== requestedEModeCategory.id,
    )

    if (isBorrowedAssetsEModeCategoryMismatch) {
      return 'borrowed-assets-emode-category-mismatch'
    }
  }

  if (user.eModeCategoryId !== 0) {
    if (user.healthFactorAfterChangingEMode?.isLessThan(1)) {
      return 'exceeds-ltv'
    }
  }
}

export const setUserEModeValidationIssueToMessage: Record<SetUserEModeValidationIssue, string> = {
  'inconsistent-liquidation-threshold': 'EMode liquidation threshold must be greater than 0',
  'borrowed-assets-emode-category-mismatch':
    'Cannot change eMode category while having borrows with different eMode category',
  'exceeds-ltv': 'Changing eMode category would result in liquidation call',
}

export interface GetValidateSetUserEModeArgsParams {
  requestedEModeCategoryId: number
  marketInfo: MarketInfo
  healthFactorAfterChangingEMode?: BigNumber
}
export function getValidateSetUserEModeArgs({
  requestedEModeCategoryId,
  marketInfo,
  healthFactorAfterChangingEMode,
}: GetValidateSetUserEModeArgsParams): ValidateSetUserEModeParams {
  const liquidationThreshold =
    requestedEModeCategoryId === 0
      ? undefined
      : (marketInfo.emodeCategories[requestedEModeCategoryId]?.liquidationThreshold ??
        raise('Requested eMode category not found'))

  const userEModeCategoryId = marketInfo.userConfiguration.eModeState.enabled
    ? marketInfo.userConfiguration.eModeState.category.id
    : 0

  const reserves = marketInfo.userPositions.map((position) => ({
    eModeCategoryId: position.reserve.eModeCategory?.id,
    borrowBalance: position.borrowBalance,
  }))

  return {
    requestedEModeCategory: {
      id: requestedEModeCategoryId,
      liquidationThreshold,
    },
    user: {
      eModeCategoryId: userEModeCategoryId,
      reserves,
      healthFactorAfterChangingEMode,
    },
  }
}
