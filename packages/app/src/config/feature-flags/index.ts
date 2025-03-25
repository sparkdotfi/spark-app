import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

import { Address } from 'viem'
import { getDefaultAppConfig } from './appConfig.default'
import { getTestingAppConfig } from './appConfig.testing'

export const getAppConfig = import.meta.env.MODE === 'test' ? getTestingAppConfig : getDefaultAppConfig

/**
 * @note: Do not use config data to check for feature availability. Use import.meta.env instead to make dead code elimination work.
 */
export interface AppConfig {
  sandbox?: {
    originChainId: number
    chainName: string
    mintBalances: {
      etherAmt: NormalizedUnitNumber
      tokenAmt: NormalizedUnitNumber
      tokens: {
        [name: string]: {
          address: Address
          decimals: number
        }
      }
    }
  }
}
