import { Timeframe } from '@/ui/charts/defaults'
import { useFilterChartDataByTimeframe } from '@/ui/charts/logic/useFilterDataByTimeframe'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
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
    queryFn: () =>
      [
        {
          tvl: NormalizedUnitNumber('482049675.184720652780565445'),
          apy: Percentage('0.08335185'),
        },
        {
          tvl: NormalizedUnitNumber('478766313.752729727960766393'),
          apy: Percentage('0.08186471'),
        },
        {
          tvl: NormalizedUnitNumber('481583088.354355862106449581'),
          apy: Percentage('0.08628850'),
        },
        {
          tvl: NormalizedUnitNumber('487963328.654655159097482473'),
          apy: Percentage('0.08622413'),
        },
        {
          tvl: NormalizedUnitNumber('483759723.985174605805184756'),
          apy: Percentage('0.08826929'),
        },
        {
          tvl: NormalizedUnitNumber('400968869.291138141669247305'),
          apy: Percentage('0.10000869'),
        },
        {
          tvl: NormalizedUnitNumber('396991464.562409324023704030'),
          apy: Percentage('0.09753633'),
        },
        {
          tvl: NormalizedUnitNumber('388652195.071977090768933004'),
          apy: Percentage('0.10292583'),
        },
        {
          tvl: NormalizedUnitNumber('342343826.577751461529530722'),
          apy: Percentage('0.11925978'),
        },
        {
          tvl: NormalizedUnitNumber('343920926.910345115526662135'),
          apy: Percentage('0.11509350'),
        },
        {
          tvl: NormalizedUnitNumber('326880028.481766269309190316'),
          apy: Percentage('0.12150797'),
        },
        {
          tvl: NormalizedUnitNumber('324153495.281429066498019457'),
          apy: Percentage('0.11689703'),
        },
        {
          tvl: NormalizedUnitNumber('242695988.420804765058078638'),
          apy: Percentage('0.15680931'),
        },
        {
          tvl: NormalizedUnitNumber('132714478.540330764263189782'),
          apy: Percentage('0.28398774'),
        },
        {
          tvl: NormalizedUnitNumber('29741295.986447529580084989'),
          apy: Percentage('1.24832955', { allowMoreThan1: true }),
        },
        {
          tvl: NormalizedUnitNumber('29741295.986447529580084989'),
          apy: Percentage('1.24832955', { allowMoreThan1: true }),
        },
      ].map((item, index) => ({
        ...item,
        date: new Date(new Date().getTime() - index * 24 * 60 * 60 * 1000),
      })) as SparkStakingHistoryItem[],
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
