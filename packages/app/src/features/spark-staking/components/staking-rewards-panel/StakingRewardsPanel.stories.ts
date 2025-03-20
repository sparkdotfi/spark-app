import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { StakingRewardsPanel, StakingRewardsPanelProps } from './StakingRewardsPanel'

const meta: Meta<typeof StakingRewardsPanel> = {
  title: 'Features/SparkStaking/Components/StakingRewardsPanel',
  component: StakingRewardsPanel,
  decorators: [withRouter(), WithClassname('max-w-7xl grid lg:grid-cols-2'), WithTooltipProvider()],
  args: {
    apy: Percentage(0.12),
    claimableRewards: NormalizedUnitNumber(25),
    stakedAmount: NormalizedUnitNumber(10_000),
    rewardToken: tokens.USDS,
    stakingToken: tokens.SPK,
    calculateReward: () => NormalizedUnitNumber(71.2345892),
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
    claimableRewards: NormalizedUnitNumber(0),
  },
}

export const NoStake: Story = {
  args: {
    stakedAmount: NormalizedUnitNumber(0),
  },
}
