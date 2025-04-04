import { Timeframe } from '@/ui/charts/defaults'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { UseQueryResult } from '@tanstack/react-query'
import { StakeSpkCTAPanelProps } from './components/stake-cta-panel/StakeSpkCTAPanel'
import { StakingRewardsPanelProps } from './components/staking-rewards-panel/StakingRewardsPanel'

export interface GeneralStats {
  stakers: number
  tvl: NormalizedNumber
  apr: Percentage
}

export interface SparkStakingHistoryItem {
  date: Date
  apy: Percentage
  tvl: NormalizedNumber
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

export type MainPanelData =
  | {
      type: 'cta'
      props: StakeSpkCTAPanelProps
    }
  | {
      type: 'active'
      props: StakingRewardsPanelProps
    }
