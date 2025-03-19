import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { GeneralStatsBar } from './GeneralStatsBar'

const meta: Meta<typeof GeneralStatsBar> = {
  title: 'Features/SparkStaking/Components/GeneralStatsBar',
  component: GeneralStatsBar,
  decorators: [withRouter(), WithTooltipProvider()],
  args: {
    generalStatsResult: {
      data: {
        tvl: NormalizedUnitNumber(5_000_123_000),
        apr: Percentage(0.1),
        stakers: 43_232,
      },
      isPending: false,
      isError: false,
      error: null,
    },
  },
}

export default meta
type Story = StoryObj<typeof GeneralStatsBar>

export const Default: Story = {}
export const Mobile = getMobileStory(Default)
export const Tablet = getTabletStory(Default)

export const Pending: Story = {
  args: {
    generalStatsResult: {
      isPending: true,
      isError: false,
      error: null,
      data: undefined,
    },
  },
}
