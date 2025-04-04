import { farmAddresses } from '@/config/chain/constants'
import { Farm } from '@/domain/farms/types'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { mainnet } from 'viem/chains'
import { ActiveFarmInfoPanel } from './ActiveFarmInfoPanel'

const mockFarm: Farm = {
  address: farmAddresses[mainnet.id].skyUsds,
  apy: Percentage(0.05),
  entryAssetsGroup: {
    type: 'stablecoins',
    name: 'Stablecoins',
    assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
  },
  name: 'SKY Farm',
  rewardToken: tokens.SKY,
  stakingToken: tokens.USDS,
  earned: NormalizedNumber(71.2345783),
  staked: NormalizedNumber(10_000),
  totalRewarded: NormalizedNumber(24520),
  rewardRate: NormalizedNumber(0.0000000003756),
  earnedTimestamp: 1724337615,
  periodFinish: 2677721600,
  totalSupply: NormalizedNumber(100_000),
  depositors: 6,
  rewardType: 'token',
}

const meta: Meta<typeof ActiveFarmInfoPanel> = {
  title: 'Features/FarmDetails/Components/FarmInfoPanel/ActiveFarmInfoPanel',
  component: ActiveFarmInfoPanel,
  decorators: [WithClassname('max-w-lg'), WithTooltipProvider()],
  args: {
    farm: mockFarm,
    canClaim: true,
    calculateReward: () => NormalizedNumber(71.2345783),
    chainId: mainnet.id,
  },
}

export default meta
type Story = StoryObj<typeof ActiveFarmInfoPanel>

export const Desktop: Story = {}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)

export const ZeroAPY: Story = {
  args: {
    farm: {
      ...mockFarm,
      apy: Percentage(0),
    },
  },
}
export const ZeroAPYMobile = getMobileStory(ZeroAPY)
export const ZeroAPYTablet = getTabletStory(ZeroAPY)

export const Points: Story = {
  args: {
    farm: {
      ...mockFarm,
      address: farmAddresses[mainnet.id].chroniclePoints,
      rewardType: 'points',
      rewardToken: tokens.CLE,
    },
    pointsSyncStatus: 'synced',
  },
}
export const PointsMobile = getMobileStory(Points)
export const PointsTablet = getTabletStory(Points)

export const PointsOutOfSync: Story = {
  args: {
    farm: {
      ...mockFarm,
      address: farmAddresses[mainnet.id].chroniclePoints,
      rewardToken: tokens.CLE,
      rewardType: 'points',
    },
    canClaim: false,
    pointsSyncStatus: 'out-of-sync',
  },
}
export const PointsOutOfSyncMobile = getMobileStory(PointsOutOfSync)
export const PointsOutOfSyncTablet = getTabletStory(PointsOutOfSync)
