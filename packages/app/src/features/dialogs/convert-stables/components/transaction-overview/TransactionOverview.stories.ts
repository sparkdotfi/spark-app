import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { TransactionOverview } from './TransactionOverview'

const meta: Meta<typeof TransactionOverview> = {
  title: 'Features/Dialogs/ConvertStables/Components/TransactionOverview',
  component: TransactionOverview,
  decorators: [WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    inToken: tokens.DAI,
    outToken: tokens.USDC,
    txOverview: {
      status: 'success',
      route: [
        { token: tokens.DAI, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
        { token: tokens.USDC, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
      ],
      inToken: tokens.DAI,
      outcome: { token: tokens.USDC, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
    },
  },
}

export default meta
type Story = StoryObj<typeof TransactionOverview>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const NoOverview: Story = {
  args: {
    inToken: tokens.DAI,
    outToken: tokens.USDC,
    txOverview: {
      status: 'no-overview',
    },
  },
}
