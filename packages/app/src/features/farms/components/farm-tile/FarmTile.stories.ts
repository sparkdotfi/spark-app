import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { FarmTile } from './FarmTile'

const meta: Meta<typeof FarmTile> = {
  title: 'Features/Farms/Components/FarmTile',
  component: FarmTile,
  decorators: [WithClassname('flex w-80'), withRouter],
  args: {
    apy: Percentage(0.05),
    staked: NormalizedNumber.ZERO,
    rewardToken: tokens.weETH,
    stakingToken: tokens.USDS,
    detailsLink: 'farm-details/1/0x1234567890123456789012345678901234567890',
    entryAssetsGroup: {
      type: 'stablecoins',
      name: 'Stablecoins',
      assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
    },
    isPointsFarm: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const WithDeposit: Story = {
  args: {
    staked: NormalizedNumber(100),
  },
}

export const GovernanceEntryAssets: Story = {
  args: {
    rewardToken: tokens.USDS,
    stakingToken: tokens.weETH,
    apy: Percentage(0.05),
    staked: NormalizedNumber.ZERO,
    detailsLink: 'farm-details/1/0x1234567890123456789012345678901234567890',
    entryAssetsGroup: {
      type: 'governance',
      name: 'Governance Tokens',
      assets: [tokens.SKY.symbol, tokens.GNO.symbol],
    },
  },
}

export const WithZeroApy: Story = {
  args: {
    apy: Percentage(0),
  },
}
