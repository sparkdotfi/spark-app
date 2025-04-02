import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { StakingRewardsPanel, StakingRewardsPanelProps } from './StakingRewardsPanel'

const meta: Meta<typeof StakingRewardsPanel> = {
  title: 'Features/SpkStaking/Components/StakingRewardsPanel',
  component: StakingRewardsPanel,
  decorators: [withRouter(), WithClassname('max-w-7xl grid lg:grid-cols-2'), WithTooltipProvider()],
  args: {
    apy: Percentage(0.12),
    claimableRewards: NormalizedNumber(25),
    stakedAmount: NormalizedNumber(10_000),
    rewardToken: tokens.USDS,
    stakingToken: tokens.SPK,
    calculateReward: () => NormalizedNumber(71.2345892),
    refreshGrowingRewardIntervalInMs: undefined,
    openClaimDialog: () => {},
    openUnstakeDialog: () => {},
    openStakeDialog: () => {},
  } satisfies StakingRewardsPanelProps,
}
export default meta
type Story = StoryObj<typeof StakingRewardsPanel>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const OnlyPendingRewards: Story = {
  args: {
    claimableRewards: NormalizedNumber.ZERO,
  },
}

export const NoStake: Story = {
  args: {
    stakedAmount: NormalizedNumber.ZERO,
  },
}
