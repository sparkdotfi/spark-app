import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface CapAutomatorConfig {
  maxCap: NormalizedUnitNumber
  gap: NormalizedUnitNumber
  increaseCooldown: number
  lastUpdateBlock: number
  lastIncreaseTimestamp: number
}

export interface CapAutomatorInfo {
  supplyCap?: CapAutomatorConfig
  borrowCap?: CapAutomatorConfig
}
