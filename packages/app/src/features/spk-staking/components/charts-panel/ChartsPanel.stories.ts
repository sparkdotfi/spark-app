import { WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { ChartsPanel } from './ChartsPanel'

import { mockChartData } from '../../fixtures/mockChartsData'
import { SparkStakingHistoryQueryResult } from '../../types'

const meta: Meta<typeof ChartsPanel> = {
  title: 'Features/SpkStaking/Components/ChartsPanel',
  component: ChartsPanel,
  decorators: [WithTooltipProvider()],
  args: {
    chartDetails: {
      history: { data: mockChartData } as SparkStakingHistoryQueryResult,
      onTimeframeChange: () => {},
      timeframe: 'All',
      availableTimeframes: ['7D', '1M', '1Y', 'All'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ChartsPanel>

export const ActiveDesktop: Story = {}
export const ActiveMobile = getMobileStory(ActiveDesktop)
export const ActiveTablet = getTabletStory(ActiveDesktop)
