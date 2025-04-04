import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { mainnet } from 'viem/chains'
import { mockChartData } from '../fixtures/mockChartsData'
import { SparkStakingHistoryQueryResult } from '../types'
import { SpkStakingView } from './SpkStakingView'

const meta: Meta<typeof SpkStakingView> = {
  title: 'Features/SpkStaking/Views/SpkStaking',
  component: SpkStakingView,
  decorators: [WithTooltipProvider(), withRouter],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    chainId: mainnet.id,
    generalStats: {
      apr: Percentage(0.05),
      stakers: 100,
      tvl: NormalizedNumber(1000000),
    },
    mainPanelData: {
      type: 'cta',
      props: {
        type: 'connected',
        apy: Percentage(0.05),
        epochDuration: 24 * 60 * 60 * 7, // 7 days
        spkBalance: NormalizedNumber(5000),
        stake: () => {},
      },
    },
    chartDetails: {
      history: {
        data: mockChartData,
        isLoading: false,
        isError: false,
      } as SparkStakingHistoryQueryResult,
      onTimeframeChange: () => {},
      timeframe: 'All',
      availableTimeframes: ['7D', '1M', '1Y', 'All'],
    },
    withdrawalsTableRows: [
      {
        action: () => {},
        actionName: 'Claim',
        amount: NormalizedNumber(1000),
        claimableAt: new Date('2025-04-03'),
        isActionEnabled: true,
        timeToClaim: 1000,
        token: tokens.SPK,
      },
    ],
    availableToStakeRow: {
      token: tokens.SPK,
      balance: NormalizedNumber(5000),
      blockExplorerLink: 'https://etherscan.io/token/0x0000000000000000000000000000000000000000',
      openStakeDialog: () => {},
    },
  },
}

export default meta
type Story = StoryObj<typeof SpkStakingView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const Active: Story = {
  args: {
    mainPanelData: {
      type: 'active',
      props: {
        apy: Percentage(0.05),
        stakedAmount: NormalizedNumber(1000),
        rewardToken: tokens.USDS,
        stakingToken: tokens.SPK,
        claimableRewards: NormalizedNumber(1000),
        isRewardOutOfSync: false,
        refreshGrowingRewardIntervalInMs: undefined,
        calculateReward: () => NormalizedNumber(1000),
        openClaimDialog: () => {},
        openUnstakeDialog: () => {},
        openStakeDialog: () => {},
      },
    },
  },
}
export const ActiveMobile = getMobileStory(Active)
export const ActiveTablet = getTabletStory(Active)
