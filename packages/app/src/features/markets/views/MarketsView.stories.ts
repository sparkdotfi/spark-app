import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { MarketsView } from './MarketsView'

const meta: Meta<typeof MarketsView> = {
  title: 'Features/Markets/Views/MarketsView',
  component: MarketsView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithTooltipProvider(), withRouter],
}

export default meta
type Story = StoryObj<typeof MarketsView>

export const Desktop: Story = {
  args: {
    marketStats: {
      totalMarketSizeUSD: NormalizedNumber(2.2 * 10 ** 12),
      totalValueLockedUSD: NormalizedNumber(1.5 * 10 ** 12),
      totalAvailableUSD: NormalizedNumber(1.4 * 10 ** 12),
      totalBorrowsUSD: NormalizedNumber(828.48 * 10 ** 9),
    },
    activeAndPausedMarketEntries: [
      {
        token: tokens.ETH,
        reserveStatus: 'active',
        borrowApyDetails: { baseApy: Percentage(0.11) },
        depositApyDetails: {
          baseApy: Percentage(0.157),
          airdrops: [TokenSymbol('SPK')],
          legacyRewards: [{ token: tokens.stETH, APR: Percentage(0.1) }],
          sparkRewards: [
            {
              rewardTokenSymbol: TokenSymbol('USDS'),
              action: 'supply',
              longDescription: 'Supply rETH and get USDS',
              apy: Percentage(0.01),
            },
            {
              rewardTokenSymbol: TokenSymbol('RED'),
              action: 'supply',
              longDescription: 'Supply ETH and get RED',
              apy: Percentage(0.01),
            },
          ],
        },
        totalBorrowed: NormalizedNumber.ZERO,
        totalSupplied: NormalizedNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
      {
        token: tokens.DAI,
        reserveStatus: 'active',
        borrowApyDetails: {
          baseApy: Percentage(0.11),
          airdrops: [TokenSymbol('SPK')],
          sparkRewards: [
            {
              rewardTokenSymbol: TokenSymbol('wstETH'),
              action: 'borrow',
              longDescription: 'Borrow ETH and get wstETH',
              apy: Percentage(0.12),
            },
            {
              rewardTokenSymbol: TokenSymbol('RED'),
              action: 'supply',
              longDescription: 'Supply rETH and get RED',
              apy: Percentage(0.08),
            },
          ],
        },
        depositApyDetails: {
          baseApy: Percentage(0.157),
        },
        totalBorrowed: NormalizedNumber(1257),
        totalSupplied: NormalizedNumber.ZERO,
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
      {
        token: tokens.USDT,
        reserveStatus: 'paused',
        borrowApyDetails: {
          baseApy: undefined,
        },
        depositApyDetails: {
          baseApy: undefined,
        },
        totalBorrowed: NormalizedNumber(1257),
        totalSupplied: NormalizedNumber.ZERO,
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
    ],
    frozenMarketEntries: [
      {
        token: tokens.GNO,
        reserveStatus: 'frozen',
        borrowApyDetails: { baseApy: Percentage(0.11) },
        depositApyDetails: { baseApy: Percentage(0.157) },
        totalBorrowed: NormalizedNumber.ZERO,
        totalSupplied: NormalizedNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
      {
        token: tokens.USDC,
        reserveStatus: 'frozen',
        borrowApyDetails: { baseApy: undefined },
        depositApyDetails: { baseApy: undefined },
        totalBorrowed: NormalizedNumber(1257),
        totalSupplied: NormalizedNumber.ZERO,
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
    ],
    chainId: 1,
  },
}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)
