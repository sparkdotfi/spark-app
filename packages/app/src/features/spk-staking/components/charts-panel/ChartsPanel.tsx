import { ApyChart } from '@/ui/charts/apy-chart/ApyChart'
import { ChartTabsPanel, createChartTab } from '@/ui/charts/components/ChartTabsPanel'
import { TvlChart } from '@/ui/charts/tvl-chart/TvlChart'
import { cn } from '@/ui/utils/style'
import { ChartDetails } from '../../types'

export interface ChartsPanelProps {
  chartDetails: ChartDetails
}

export function ChartsPanel({ chartDetails }: ChartsPanelProps) {
  return (
    <ChartTabsPanel
      tabs={[
        createChartTab({
          id: 'apy',
          label: 'APY',
          component: ApyChart,
          isError: chartDetails.history.isError,
          isPending: chartDetails.history.isLoading,
          props: {
            data: chartDetails.history.data ?? [],
            primaryColor: '#FB4AB9',
            lineColorClassName: cn('bg-gradient-spark-primary-2'),
          },
          availableTimeframes: chartDetails.availableTimeframes,
          selectedTimeframe: chartDetails.timeframe,
          setSelectedTimeframe: chartDetails.onTimeframeChange,
        }),
        createChartTab({
          id: 'tvl',
          label: 'TVL',
          component: TvlChart,
          isError: chartDetails.history.isError,
          isPending: chartDetails.history.isLoading,
          props: {
            data: chartDetails.history.data ?? [],
            primaryColor: '#FB4AB9',
            lineColorClassName: cn('bg-gradient-spark-primary-2'),
          },
          availableTimeframes: chartDetails.availableTimeframes,
          selectedTimeframe: chartDetails.timeframe,
          setSelectedTimeframe: chartDetails.onTimeframeChange,
        }),
      ]}
    />
  )
}
