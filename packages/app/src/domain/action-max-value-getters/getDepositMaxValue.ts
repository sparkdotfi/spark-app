import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
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
    ? NormalizedUnitNumber.max(asset.supplyCap.minus(asset.totalLiquidity), NormalizedUnitNumber.zero)
    : NormalizedUnitNumber(Number.POSITIVE_INFINITY)
  const balanceBasedMaxDeposit = user.balance.minus(
    asset.isNativeAsset ? chain.minRemainingNativeAsset : NormalizedUnitNumber.zero,
  )

  return NormalizedUnitNumber.max(
    NormalizedUnitNumber.min(balanceBasedMaxDeposit, marketMaxDeposit),
    NormalizedUnitNumber.zero,
  )
}
