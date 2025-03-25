import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { ReserveStatus } from '../market-info/reserve-status'

interface GetDepositMaxValueParams {
  asset: {
    status: ReserveStatus
    totalLiquidity: NormalizedUnitNumber
    isNativeAsset: boolean
    supplyCap?: NormalizedUnitNumber
  }
  user: {
    balance: NormalizedUnitNumber
  }
  chain: {
    minRemainingNativeAsset: NormalizedUnitNumber
  }
}

export function getDepositMaxValue({ user, asset, chain }: GetDepositMaxValueParams): NormalizedUnitNumber {
  if (asset.status !== 'active') {
    return NormalizedUnitNumber(0)
  }

  const marketMaxDeposit = asset.supplyCap
    ? BigNumber.max(asset.supplyCap.minus(asset.totalLiquidity), 0)
    : Number.POSITIVE_INFINITY
  const balanceBasedMaxDeposit = user.balance.minus(
    asset.isNativeAsset ? chain.minRemainingNativeAsset : NormalizedUnitNumber(0),
  )

  return NormalizedUnitNumber(BigNumber.max(BigNumber.min(balanceBasedMaxDeposit, marketMaxDeposit), 0))
}
