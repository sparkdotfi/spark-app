import BigNumber from 'bignumber.js'

import { Percentage } from '@sparkdotfi/common-universal'

import { CollateralType } from './collateralization'

export interface PositionOverview {
  healthFactor: BigNumber | undefined
  collateralization: CollateralType
  supplyAPY: Percentage | undefined
}
