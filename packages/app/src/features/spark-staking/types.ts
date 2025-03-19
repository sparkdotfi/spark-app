import { SimplifiedQueryResult } from '@/domain/common/query'
import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'

export type UseGeneralStatsResult = SimplifiedQueryResult<{
  stakers: number
  tvl: NormalizedUnitNumber
  apr: Percentage
}>
