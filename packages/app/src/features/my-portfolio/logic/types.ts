import BigNumber from 'bignumber.js'

import { TokenWithValue } from '@/domain/common/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface PositionSummary {
  collaterals: TokenWithValue[]
  hasCollaterals: boolean
  hasDeposits: boolean
  totalCollateralUSD: NormalizedUnitNumber
  healthFactor: BigNumber | undefined
  borrow: {
    current: NormalizedUnitNumber
    max: NormalizedUnitNumber
    percents: {
      borrowed: number
      rest: number
      max: number
    }
  }
}
