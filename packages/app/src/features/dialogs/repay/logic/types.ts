import BigNumber from 'bignumber.js'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface PositionOverview {
  healthFactor: BigNumber | undefined
  debt: NormalizedUnitNumber
}
