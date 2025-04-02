import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { EModeCategory, EModeState } from '../market-info/marketInfo'
import { ReserveStatus } from '../market-info/reserve-status'

interface GetWithdrawMaxValueParams {
  user: {
    deposited: NormalizedNumber
    healthFactor: BigNumber | undefined
    totalBorrowsUSD: NormalizedNumber
    eModeState: EModeState
  }
  asset: {
    status: ReserveStatus
    unborrowedLiquidity: NormalizedNumber
    liquidationThreshold: Percentage
    unitPriceUsd: NormalizedNumber
    decimals: number
    usageAsCollateralEnabledOnUser: boolean
    eModeCategory?: EModeCategory
  }
}

export function getWithdrawMaxValue({ user, asset }: GetWithdrawMaxValueParams): NormalizedNumber {
  if (asset.status === 'paused') {
    return NormalizedNumber.ZERO
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
        const maxCollateralToWithdraw = NormalizedNumber(excessHF)
          .times(user.totalBorrowsUSD)
          .div(NormalizedNumber(liquidationThreshold))
          .div(asset.unitPriceUsd)
        ceilings.push(maxCollateralToWithdraw)
      }
    } else {
      ceilings.push(NormalizedNumber.ZERO)
    }
  }

  return NormalizedNumber.min(...ceilings).decimalPlaces(asset.decimals, BigNumber.ROUND_DOWN)
}
