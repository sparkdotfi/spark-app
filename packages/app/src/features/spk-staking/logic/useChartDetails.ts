import { Timeframe } from '@/ui/charts/defaults'
import { useFilterChartDataByTimeframe } from '@/ui/charts/logic/useFilterDataByTimeframe'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ChartDetails, SparkStakingHistoryItem } from '../types'

export const SpkStakingHistoryTimeframes = ['7D', '1M', '1Y', 'All'] as const satisfies Timeframe[]
export type SpkStakingHistoryTimeframes = (typeof SpkStakingHistoryTimeframes)[number]

export function useChartDetails(): ChartDetails {
  const [timeframe, setTimeframe] = useState<SpkStakingHistoryTimeframes>('All')
  const filterDataByTimeframe = useFilterChartDataByTimeframe(timeframe)

  const result = useQuery({
    queryKey: ['spk-staking', 'chart-details'],
    queryFn: () => [] as SparkStakingHistoryItem[],
    select: filterDataByTimeframe,
  })

  return {
    history: result,
    onTimeframeChange: (timeframe: Timeframe) => {
      if (SpkStakingHistoryTimeframes.includes(timeframe)) {
        setTimeframe(timeframe as any)
      }
    },
    timeframe,
    availableTimeframes: SpkStakingHistoryTimeframes,
  }
}
