import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { ReserveStatus } from '../market-info/reserve-status'

export interface GetRepayMaxValueParams {
  user: {
    debt: NormalizedNumber
    balance: NormalizedNumber
  }
  asset: {
    status: ReserveStatus
    isNativeAsset: boolean
  }
  chain: {
    minRemainingNativeAsset: NormalizedNumber
  }
}

export function getRepayMaxValue({ user, asset, chain }: GetRepayMaxValueParams): NormalizedNumber {
  if (asset.status === 'paused') {
    return NormalizedNumber.ZERO
  }

  const maxRepay = NormalizedNumber.min(
    user.debt,
    user.balance.minus(asset.isNativeAsset ? chain.minRemainingNativeAsset : NormalizedNumber.ZERO),
  )
  return NormalizedNumber.max(maxRepay, NormalizedNumber.ZERO)
}
