import { farmAddresses } from '@/config/chain/constants'
import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { mainnet } from 'viem/chains'
import { mockChartData } from '../fixtures/mockChartData'
import { FarmHistoryQueryResult } from '../logic/historic/useFarmHistory'
import { FarmDetailsView } from './FarmDetailsView'

const meta: Meta<typeof FarmDetailsView> = {
  title: 'Features/FarmDetails/Views/FarmDetailsView',
  component: FarmDetailsView,
  decorators: [WithTooltipProvider(), withRouter],
  args: {
    chainId: mainnet.id,
    chainMismatch: false,
    walletConnected: true,
    farm: {
      address: farmAddresses[mainnet.id].skyUsds,
      apy: Percentage(0.05),
      name: 'SKY Farm',
      rewardType: 'token',
      entryAssetsGroup: {
        type: 'stablecoins',
        name: 'Stablecoins',
        assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
      },
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
    },
    isFarmActive: true,
    canClaim: true,
    tokensToDeposit: [
      {
        token: tokens.USDS,
        balance: NormalizedNumber(10_000),
      },
      {
        token: tokens.DAI,
        balance: NormalizedNumber(20_864.56),
      },
      {
        token: tokens.USDC,
        balance: NormalizedNumber.ZERO,
      },
      {
        token: tokens.sDAI,
        balance: NormalizedNumber.ZERO,
      },
      {
        token: tokens.sUSDS,
        balance: NormalizedNumber.ZERO,
      },
    ],
    calculateReward: () => NormalizedNumber(71.2345783),
    openStakeDialog: () => {},
    openConnectModal: () => {},
    openSandboxModal: () => {},
    chartDetails: {
      farmHistory: { data: mockChartData } as FarmHistoryQueryResult,
      onTimeframeChange: () => {},
      timeframe: 'All',
      availableTimeframes: ['7D', '1M', '1Y', 'All'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof FarmDetailsView>

export const ActiveDesktop: Story = {}
export const ActiveMobile = getMobileStory(ActiveDesktop)
export const ActiveTablet = getTabletStory(ActiveDesktop)

export const NoDepositWithRewards: Story = {
  args: {
    farm: {
      address: farmAddresses[mainnet.id].skyUsds,
      name: 'SKY Farm',
      rewardType: 'token',
      apy: Percentage(0.05),
      entryAssetsGroup: {
        type: 'stablecoins',
        name: 'Stablecoins',
        assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
      },
      rewardToken: tokens.SKY,
      stakingToken: tokens.USDS,
      earned: NormalizedNumber(71.2345783),
      staked: NormalizedNumber.ZERO,
      rewardRate: NormalizedNumber(0.0000000003756),
      totalRewarded: NormalizedNumber(24520),
      earnedTimestamp: 1724337615,
      periodFinish: 2677721600,
      totalSupply: NormalizedNumber(100_000),
      depositors: 6,
    },
  },
}
export const NoDepositWithRewardsMobile = getMobileStory(NoDepositWithRewards)
export const NoDepositWithRewardsTablet = getTabletStory(NoDepositWithRewards)

export const InactiveDesktop: Story = {
  args: {
    farm: {
      address: farmAddresses[mainnet.id].skyUsds,
      apy: Percentage(0.05),
      name: 'SKY Farm',
      rewardType: 'token',
      entryAssetsGroup: {
        type: 'stablecoins',
        name: 'Stablecoins',
        assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
      },
      rewardToken: tokens.SKY,
      stakingToken: tokens.USDS,
      earned: NormalizedNumber.ZERO,
      staked: NormalizedNumber.ZERO,
      totalRewarded: NormalizedNumber(24520),
      rewardRate: NormalizedNumber(0.0000000003756),
      earnedTimestamp: 1724337615,
      periodFinish: 2677721600,
      totalSupply: NormalizedNumber(100_000),
      depositors: 6,
    },
    isFarmActive: false,
  },
}
export const InactiveMobile = getMobileStory(InactiveDesktop)
export const InactiveTablet = getTabletStory(InactiveDesktop)

export const NotConnectedDesktop: Story = {
  args: {
    farm: {
      address: farmAddresses[mainnet.id].skyUsds,
      name: 'SKY Farm',
      rewardType: 'token',
      apy: Percentage(0.05),
      entryAssetsGroup: {
        type: 'stablecoins',
        name: 'Stablecoins',
        assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
      },
      rewardToken: tokens.SKY,
      stakingToken: tokens.USDS,
      earned: NormalizedNumber.ZERO,
      staked: NormalizedNumber.ZERO,
      totalRewarded: NormalizedNumber(24520),
      rewardRate: NormalizedNumber(0.0000000003756),
      earnedTimestamp: 1724337615,
      periodFinish: 2677721600,
      totalSupply: NormalizedNumber(100_000),
      depositors: 6,
    },
    isFarmActive: false,
    walletConnected: false,
  },
}
export const NotConnectedMobile = getMobileStory(NotConnectedDesktop)
export const NotConnectedTablet = getTabletStory(NotConnectedDesktop)

export const ActiveDesktopChainMismatch: Story = {
  args: {
    chainMismatch: true,
  },
}

export const NoApiData: Story = {
  args: {
    farm: {
      apy: undefined,
      totalRewarded: undefined,
      depositors: undefined,
      rewardToken: tokens.SKY.clone({ unitPriceUsd: NormalizedNumber.ZERO }),
      address: farmAddresses[mainnet.id].skyUsds,
      name: 'SKY Farm',
      rewardType: 'token',
      entryAssetsGroup: {
        type: 'stablecoins',
        name: 'Stablecoins',
        assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
      },
      stakingToken: tokens.USDS,
      earned: NormalizedNumber(71.2345783),
      staked: NormalizedNumber.ZERO,
      rewardRate: NormalizedNumber(0.0000000003756),
      earnedTimestamp: 1724337615,
      periodFinish: 2677721600,
      totalSupply: NormalizedNumber(100_000),
    },
    chartDetails: {
      farmHistory: { isError: true } as FarmHistoryQueryResult,
      onTimeframeChange: () => {},
      timeframe: 'All',
      availableTimeframes: ['7D', '1M', '1Y', 'All'],
    },
  },
}

export const NoApiDataMobile = getMobileStory(NoApiData)
export const NoApiDataTablet = getTabletStory(NoApiData)
