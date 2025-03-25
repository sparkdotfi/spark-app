import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { GeneralStatsBar } from './GeneralStatsBar'

const meta: Meta<typeof GeneralStatsBar> = {
  title: 'Features/Savings/Components/GeneralStatsBar',
  component: GeneralStatsBar,
  decorators: [withRouter(), WithTooltipProvider()],
  args: {
    generalStatsResult: {
      data: {
        tvl: NormalizedUnitNumber(5_000_123_000),
        getLiquidityCap: () => undefined,
        users: 43_232,
      },
      isPending: false,
      isError: false,
      error: null,
    },
    psmSupplier: 'sky',
    accountSavingsToken: tokens.sUSDS,
  },
}

export default meta
type Story = StoryObj<typeof GeneralStatsBar>

export const Default: Story = {}
export const Mobile = getMobileStory(Default)
export const Tablet = getTabletStory(Default)

export const HighValues: Story = {
  args: {
    generalStatsResult: {
      data: {
        tvl: NormalizedUnitNumber(10_000_000_000),
        getLiquidityCap: () => undefined,
        users: 1_000_000,
      },
      isPending: false,
      isError: false,
      error: null,
    },
  },
}

export const LowValues: Story = {
  args: {
    generalStatsResult: {
      data: {
        tvl: NormalizedUnitNumber(100_000),
        getLiquidityCap: () => undefined,
        users: 100,
      },
      isPending: false,
      isError: false,
      error: null,
    },
  },
}

export const WithLiquidityCap: Story = {
  args: {
    generalStatsResult: {
      data: {
        tvl: NormalizedUnitNumber(100_000),
        getLiquidityCap: () => NormalizedUnitNumber(1_000_000),
        users: 100,
      },
      isPending: false,
      isError: false,
      error: null,
    },
  },
}

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
