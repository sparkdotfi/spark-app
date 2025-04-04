import BigNumber from 'bignumber.js'

import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

export interface PositionOverview {
  healthFactor: BigNumber | undefined
  tokenSupply: NormalizedNumber
  supplyAPY: Percentage | undefined
}
