import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface CapAutomatorConfig {
  maxCap: NormalizedNumber
  gap: NormalizedNumber
  increaseCooldown: number
  lastUpdateBlock: number
  lastIncreaseTimestamp: number
}

export interface CapAutomatorInfo {
  supplyCap?: CapAutomatorConfig
  borrowCap?: CapAutomatorConfig
}
