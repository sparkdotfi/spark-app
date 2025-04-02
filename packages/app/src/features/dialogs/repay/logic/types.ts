import BigNumber from 'bignumber.js'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface PositionOverview {
  healthFactor: BigNumber | undefined
  debt: NormalizedNumber
}
