import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { EModeCategory, EModeState } from '../market-info/marketInfo'
import { ReserveStatus } from '../market-info/reserve-status'

interface GetWithdrawMaxValueParams {
  user: {
    deposited: NormalizedUnitNumber
    healthFactor: BigNumber | undefined
    totalBorrowsUSD: NormalizedUnitNumber
    eModeState: EModeState
  }
  asset: {
    status: ReserveStatus
    unborrowedLiquidity: NormalizedUnitNumber
    liquidationThreshold: Percentage
    unitPriceUsd: NormalizedUnitNumber
    decimals: number
    usageAsCollateralEnabledOnUser: boolean
    eModeCategory?: EModeCategory
  }
}

export function getWithdrawMaxValue({ user, asset }: GetWithdrawMaxValueParams): NormalizedUnitNumber {
  if (asset.status === 'paused') {
    return NormalizedUnitNumber.zero
  }

  const ceilings = [user.deposited, asset.unborrowedLiquidity]
  if (asset.usageAsCollateralEnabledOnUser && user.healthFactor !== undefined) {
    // user has position with both collateral and debt
    const excessHF = user.healthFactor.minus(1.01)
    if (excessHF.gt(0)) {
      const liquidationThreshold =
        user.eModeState.enabled && user.eModeState.category.id === asset.eModeCategory?.id
          ? user.eModeState.category.liquidationThreshold
          : asset.liquidationThreshold

      if (liquidationThreshold.gt(0) && user.totalBorrowsUSD.gt(0)) {
        const maxCollateralToWithdraw = NormalizedUnitNumber(excessHF)
          .times(user.totalBorrowsUSD)
          .div(NormalizedUnitNumber(liquidationThreshold))
          .div(asset.unitPriceUsd)
        ceilings.push(maxCollateralToWithdraw)
      }
    } else {
      ceilings.push(NormalizedUnitNumber.zero)
    }
  }

  return NormalizedUnitNumber.min(...ceilings).decimalPlaces(asset.decimals, BigNumber.ROUND_DOWN)
}
