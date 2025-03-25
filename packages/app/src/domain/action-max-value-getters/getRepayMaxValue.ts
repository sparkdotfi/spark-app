import BigNumber from 'bignumber.js'

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
    return NormalizedUnitNumber(0)
  }

  const maxRepay = BigNumber.min(
    user.debt,
    user.balance.minus(asset.isNativeAsset ? chain.minRemainingNativeAsset : NormalizedUnitNumber(0)),
  )
  return NormalizedUnitNumber(BigNumber.max(maxRepay, 0))
}
