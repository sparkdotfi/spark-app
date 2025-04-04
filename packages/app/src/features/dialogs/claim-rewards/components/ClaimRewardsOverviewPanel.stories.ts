import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { tokens } from '@sb/tokens'
import { ClaimRewardsOverviewPanel } from './ClaimRewardsOverviewPanel'

const meta: Meta<typeof ClaimRewardsOverviewPanel> = {
  title: 'Features/Dialogs/Components/ClaimRewardsOverviewPanel',
  component: ClaimRewardsOverviewPanel,
  args: {
    rewards: [
      {
        token: tokens.wstETH,
        amount: NormalizedNumber(0.00157),
      },
      {
        token: tokens.WBTC,
        amount: NormalizedNumber(0.0003498),
      },
    ],
  },
}

export default meta
type Story = StoryObj<typeof ClaimRewardsOverviewPanel>

export const Desktop: Story = {}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)
