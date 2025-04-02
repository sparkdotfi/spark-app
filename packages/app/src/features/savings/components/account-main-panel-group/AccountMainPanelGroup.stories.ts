import { links } from '@/ui/constants/links'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { AccountMainPanelGroup } from './AccountMainPanelGroup'

const meta: Meta<typeof AccountMainPanelGroup> = {
  title: 'Features/Savings/Components/AccountMainPanelGroup',
  component: AccountMainPanelGroup,
  decorators: [WithTooltipProvider(), WithClassname('max-w-[1200px] md:h-[320px] grid grid-cols-1')],
  args: {
    underlyingToken: tokens.USDS,
    savingsToken: tokens.sUSDS,
    savingsTokenBalance: NormalizedUnitNumber(22_543.2349),
    sparkRewardsOneYearProjection: NormalizedUnitNumber.ZERO,
    calculateUnderlyingTokenBalance: () => ({
      depositedAssets: NormalizedUnitNumber(25_000.12),
      depositedAssetsPrecision: 4,
    }),
    openDepositDialog: () => {},
    openSendDialog: () => {},
    openWithdrawDialog: () => {},
    oneYearProjection: NormalizedUnitNumber(3125.0),
    apy: Percentage(0.125),
    apyExplainer:
      'Current annual interest in the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.susds,
    sparkRewardsSummary: {
      totalApy: Percentage(0),
      rewards: [],
    },
  },
}

export default meta
type Story = StoryObj<typeof AccountMainPanelGroup>

export const Desktop: Story = {}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)

export const USDC: Story = {
  args: {
    underlyingToken: tokens.USDC,
    savingsToken: tokens.sUSDC,
  },
}

export const DAI: Story = {
  args: {
    underlyingToken: tokens.DAI,
    savingsToken: tokens.sDAI,
  },
}
