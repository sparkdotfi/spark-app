import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'

export interface FarmHistoryItem {
  date: Date
  apy: Percentage
  tvl: NormalizedUnitNumber
}
