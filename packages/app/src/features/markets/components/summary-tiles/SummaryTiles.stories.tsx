import { WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

import { SummaryTiles } from './SummaryTiles'

const meta: Meta<typeof SummaryTiles> = {
  title: 'Features/Markets/Components/SummaryTiles',
  component: SummaryTiles,
  decorators: [WithTooltipProvider()],
}

export default meta
type Story = StoryObj<typeof SummaryTiles>

export const Desktop: Story = {
  args: {
    marketStats: {
      totalMarketSizeUSD: NormalizedUnitNumber(2.2 * 10 ** 12),
      totalValueLockedUSD: NormalizedUnitNumber(1.5 * 10 ** 12),
      totalAvailableUSD: NormalizedUnitNumber(1.4 * 10 ** 12),
      totalBorrowsUSD: NormalizedUnitNumber(828.48 * 10 ** 9),
    },
  },
}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)
