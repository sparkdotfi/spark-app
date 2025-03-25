import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

export interface FarmHistoryItem {
  date: Date
  apy: Percentage
  tvl: NormalizedUnitNumber
}
