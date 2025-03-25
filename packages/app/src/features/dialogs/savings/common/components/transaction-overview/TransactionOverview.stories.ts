import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { TransactionOverview } from './TransactionOverview'

const meta: Meta<typeof TransactionOverview> = {
  title: 'Features/Dialogs/Savings/Components/TransactionOverview',
  component: TransactionOverview,
  decorators: [WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    txOverview: {
      underlyingToken: tokens.DAI,
      status: 'success',
      APY: Percentage(0.05),
      stableEarnRate: NormalizedUnitNumber(542),
      route: [
        { token: tokens.DAI, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
        { token: tokens.sDAI, value: NormalizedUnitNumber(925.75), usdValue: NormalizedUnitNumber(1300.74) },
      ],
      skyBadgeToken: tokens.DAI,
      outTokenAmount: NormalizedUnitNumber(925.75),
    },
    showAPY: true,
  },
}

export default meta
type Story = StoryObj<typeof TransactionOverview>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const WithoutAPY: Story = {
  args: {
    showAPY: false,
  },
}
export const WithoutAPYMobile = getMobileStory(WithoutAPY)
export const WithoutAPYTablet = getTabletStory(WithoutAPY)
