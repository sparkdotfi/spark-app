import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { STORYBOOK_TIMESTAMP } from '@sb/consts'
import { DaiMarketOverview } from './DaiMarketOverview'

const meta: Meta<typeof DaiMarketOverview> = {
  title: 'Features/MarketDetails/Components/MarketOverview/DaiMarketOverview',
  decorators: [WithClassname('max-w-xs'), WithTooltipProvider()],
  component: DaiMarketOverview,
}

export default meta
type Story = StoryObj<typeof DaiMarketOverview>

export const Default: Story = {
  name: 'Default',
  args: {
    token: tokens.DAI,
    borrowed: NormalizedUnitNumber(823_000_000),
    marketSize: NormalizedUnitNumber(1_243_000_000),
    totalAvailable: NormalizedUnitNumber(420_000_000),
    utilizationRate: Percentage(0.66),
    instantlyAvailable: NormalizedUnitNumber(99_000_000),
    skyCapacity: NormalizedUnitNumber(320_000_000),
    dssAutoline: {
      maxDebtCeiling: NormalizedUnitNumber(200_000),
      gap: NormalizedUnitNumber.ZERO,
      increaseCooldown: 43200,
      lastIncreaseTimestamp: Math.floor(STORYBOOK_TIMESTAMP / 1000 - 41903),
      lastUpdateBlock: 0,
    },
  },
}

export const Mobile = getMobileStory(Default)
export const Tablet = getTabletStory(Default)
