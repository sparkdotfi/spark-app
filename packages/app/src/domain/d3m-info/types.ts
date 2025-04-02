import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface D3MInfo {
  D3MCurrentDebtUSD: NormalizedNumber
  maxDebtCeiling: NormalizedNumber
  gap: NormalizedNumber
  increaseCooldown: number
  lastUpdateBlock: number
  lastIncreaseTimestamp: number
}
