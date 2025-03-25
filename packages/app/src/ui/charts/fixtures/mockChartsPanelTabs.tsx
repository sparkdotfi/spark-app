import { ApyChart } from '../apy-chart/ApyChart'
import { createChartTab } from '../components/ChartTabsPanel'
import { TvlChart } from '../tvl-chart/TvlChart'
import { mockApyChartData } from './mockApyChartData'
import { mockTvlChartData } from './mockTvlChartData'

export const mockChartsPanelMultipleTabs = [
  createChartTab({
    id: 'apy',
    label: 'APY',
    component: ApyChart,
    isError: false,
    isPending: false,
    props: { data: mockApyChartData, primaryColor: '#FA43BD' },
    selectedTimeframe: '1M' as const,
    setSelectedTimeframe: () => {},
    availableTimeframes: ['1M', '1Y', '3Y', 'All'],
  }),
  createChartTab({
    id: 'tvl',
    label: 'TVL',
    component: TvlChart,
    isError: false,
    isPending: false,
    props: { data: mockTvlChartData, primaryColor: '#FA43BD' },
    selectedTimeframe: '1M' as const,
    setSelectedTimeframe: () => {},
    availableTimeframes: ['1M', '1Y', '3Y', 'All'],
  }),
]

export const mockChartsPanelSingleTab = [
  createChartTab({
    id: 'tvl',
    label: 'TVL',
    component: TvlChart,
    isError: false,
    isPending: false,
    props: { data: mockTvlChartData, primaryColor: '#FA43BD' },
    selectedTimeframe: '1M' as const,
    setSelectedTimeframe: () => {},
    availableTimeframes: ['1M', '1Y', '3Y', 'All'],
  }),
]
