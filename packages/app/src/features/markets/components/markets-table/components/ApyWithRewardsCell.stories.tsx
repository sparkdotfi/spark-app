import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { Percentage } from '@sparkdotfi/common-universal'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { ApyWithRewardsCell } from './ApyWithRewardsCell'

const meta: Meta<typeof ApyWithRewardsCell> = {
  title: 'Features/Markets/Components/MarketsTable/Components/ApyWithRewardsCell',
  component: ApyWithRewardsCell,
  decorators: [WithTooltipProvider(), withRouter, WithClassname('w-56')],
  args: {
    apyDetails: {
      baseApy: Percentage(0.157),
      legacyRewards: [],
      airdrops: [],
    },
    incentivizedReserve: tokens.ETH,
    reserveStatus: 'active',
  },
}

export default meta
type Story = StoryObj<typeof ApyWithRewardsCell>

export const WithoutIncentives: Story = {
  name: 'WithoutIncentives',
}

export const WithAirdrop: Story = {
  name: 'WithAirdrop',
  args: {
    apyDetails: {
      baseApy: Percentage(0.157),
      legacyRewards: [],
      airdrops: [TokenSymbol('SPK')],
    },
  },
}

export const WithRewards: Story = {
  name: 'WithRewards',
  args: {
    apyDetails: {
      baseApy: Percentage(0.157),
      legacyRewards: [{ token: tokens.stETH, APR: Percentage(0.1) }],
      airdrops: [],
    },
  },
}

export const WithAirdropAndRewards: Story = {
  name: 'WithAirdropAndRewards',
  args: {
    apyDetails: {
      baseApy: Percentage(0.157),
      airdrops: [TokenSymbol('SPK')],
      legacyRewards: [{ token: tokens.stETH, APR: Percentage(0.1) }],
    },
  },
}
