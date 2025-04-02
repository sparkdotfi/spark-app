import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { ReserveStatus } from '../market-info/reserve-status'

interface GetDepositMaxValueParams {
  asset: {
    status: ReserveStatus
    totalLiquidity: NormalizedNumber
    isNativeAsset: boolean
    supplyCap?: NormalizedNumber
  }
  user: {
    balance: NormalizedNumber
  }
  chain: {
    minRemainingNativeAsset: NormalizedNumber
  }
}

export function getDepositMaxValue({ user, asset, chain }: GetDepositMaxValueParams): NormalizedNumber {
  if (asset.status !== 'active') {
    return NormalizedNumber.ZERO
  }

  const marketMaxDeposit = asset.supplyCap
    ? NormalizedNumber.max(asset.supplyCap.minus(asset.totalLiquidity), NormalizedNumber.ZERO)
    : NormalizedNumber(Number.POSITIVE_INFINITY)
  const balanceBasedMaxDeposit = user.balance.minus(
    asset.isNativeAsset ? chain.minRemainingNativeAsset : NormalizedNumber.ZERO,
  )

  return NormalizedNumber.max(NormalizedNumber.min(balanceBasedMaxDeposit, marketMaxDeposit), NormalizedNumber.ZERO)
}
