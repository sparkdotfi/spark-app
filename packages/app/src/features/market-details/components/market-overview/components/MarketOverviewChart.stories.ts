import { WithClassname } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { tokens } from '@sb/tokens'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { MarketOverviewChart } from './MarketOverviewChart'

const meta: Meta<typeof MarketOverviewChart> = {
  title: 'Features/MarketDetails/Components/MarketOverview/Components/MarketOverviewChart',
  decorators: [WithClassname('max-w-xs bg-primary-inverse p-4')],
  component: MarketOverviewChart,
}

export default meta
type Story = StoryObj<typeof MarketOverviewChart>

export const Default: Story = {
  name: 'Default',
  args: {
    data: [
      { value: 800_000_000, color: '#3F66EF' },
      { value: 200_000_000, color: '#33BE27' },
    ],
    token: tokens.ETH,
    borrowed: NormalizedUnitNumber(800_000_000),
    marketSize: NormalizedUnitNumber(1_000_000_000),
    utilizationRate: Percentage(0.8),
  },
}

export const Mobile = getMobileStory(Default)
export const Tablet = getTabletStory(Default)

export const ZeroUtilization: Story = {
  name: 'Zero Utilization',
  args: {
    data: [
      { value: 0, color: '#3F66EF' },
      { value: 1_000_000_000, color: '#33BE27' },
    ],
    token: tokens.ETH,
    borrowed: NormalizedUnitNumber(800_000_000),
    marketSize: NormalizedUnitNumber(1_000_000_000),
    utilizationRate: Percentage(0.8),
  },
}
export const ZeroUtilizationMobile = getMobileStory(ZeroUtilization)
export const ZeroUtilizationTablet = getTabletStory(ZeroUtilization)

export const FullUtilization: Story = {
  name: 'Full Utilization',
  args: {
    data: [
      { value: 1_000_000_000, color: '#3F66EF' },
      { value: 0, color: '#33BE27' },
    ],
    token: tokens.ETH,
    borrowed: NormalizedUnitNumber(800_000_000),
    marketSize: NormalizedUnitNumber(1_000_000_000),
    utilizationRate: Percentage(0.8),
  },
}
export const FullUtilizationMobile = getMobileStory(FullUtilization)
export const FullUtilizationTablet = getTabletStory(FullUtilization)
