import { SimplifiedQueryResult } from '@/domain/common/query'
import { Timeframe } from '@/ui/charts/defaults'
import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { UseQueryResult } from '@tanstack/react-query'

export type UseGeneralStatsResult = SimplifiedQueryResult<{
  stakers: number
  tvl: NormalizedUnitNumber
  apr: Percentage
}>

export interface SparkStakingHistoryItem {
  date: Date
  apy: Percentage
  tvl: NormalizedUnitNumber
}

export type SparkStakingHistoryQueryResult = UseQueryResult<SparkStakingHistoryItem[]>
export const SPARK_STAKING_HISTORY_TIMEFRAMES = ['7D', '1M', '1Y', 'All'] as const satisfies Timeframe[]
export type SparkStakingHistoryTimeframe = (typeof SPARK_STAKING_HISTORY_TIMEFRAMES)[number]

export interface ChartDetails {
  history: SparkStakingHistoryQueryResult
  onTimeframeChange: (timeframe: Timeframe) => void
  timeframe: SparkStakingHistoryTimeframe
  availableTimeframes: SparkStakingHistoryTimeframe[]
}
