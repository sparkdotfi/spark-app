import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { ReserveStatus } from '../market-info/reserve-status'

export interface GetRepayMaxValueParams {
  user: {
    debt: NormalizedUnitNumber
    balance: NormalizedUnitNumber
  }
  asset: {
    status: ReserveStatus
    isNativeAsset: boolean
  }
  chain: {
    minRemainingNativeAsset: NormalizedUnitNumber
  }
}

export function getRepayMaxValue({ user, asset, chain }: GetRepayMaxValueParams): NormalizedUnitNumber {
  if (asset.status === 'paused') {
    return NormalizedUnitNumber.ZERO
  }

  const maxRepay = NormalizedUnitNumber.min(
    user.debt,
    user.balance.minus(asset.isNativeAsset ? chain.minRemainingNativeAsset : NormalizedUnitNumber.ZERO),
  )
  return NormalizedUnitNumber.max(maxRepay, NormalizedUnitNumber.ZERO)
}
