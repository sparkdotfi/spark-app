import BigNumber from 'bignumber.js'

import { TokenWithValue } from '@/domain/common/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface PositionSummary {
  collaterals: TokenWithValue[]
  hasCollaterals: boolean
  hasDeposits: boolean
  totalCollateralUSD: NormalizedNumber
  healthFactor: BigNumber | undefined
  borrow: {
    current: NormalizedNumber
    max: NormalizedNumber
    percents: {
      borrowed: number
      rest: number
      max: number
    }
  }
}
