import BigNumber from 'bignumber.js'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { PositionOverview } from './types'

export interface MakeUpdatedPositionOverviewParams {
  healthFactor: BigNumber | undefined
  debt: NormalizedNumber
}
export function makeUpdatedPositionOverview({
  healthFactor,
  debt,
}: MakeUpdatedPositionOverviewParams): PositionOverview {
  return {
    // @todo: change 1e-8 when repaying max is handled properly
    healthFactor: !healthFactor && debt.lt(1e-8) ? new BigNumber(Number.POSITIVE_INFINITY) : healthFactor,
    debt,
  }
}
