import BigNumber from 'bignumber.js'

import { EModeCategoryName } from '@/domain/e-mode/types'
import { Token } from '@/domain/types/Token'
import { Percentage } from '@sparkdotfi/common-universal'

export interface PositionOverview {
  healthFactor: BigNumber | undefined
  maxLTV: Percentage
}

export interface EModeCategory {
  name: EModeCategoryName
  tokens: Token[]
  isSelected: boolean
  isActive: boolean
  onSelect: () => void
}
