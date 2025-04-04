import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { ClaimTransactionOverview } from './ClaimTransactionOverview'

const meta: Meta<typeof ClaimTransactionOverview> = {
  title: 'Features/FarmDetails/Dialogs/Claim/Components/TransactionOverview',
  component: ClaimTransactionOverview,
  decorators: [WithClassname('max-w-xl')],
  args: {
    txOverview: {
      reward: {
        token: tokens.SKY,
        value: NormalizedNumber(500.89),
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ClaimTransactionOverview>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const DesktopZeroApy: Story = {
  args: {
    txOverview: {
      reward: {
        token: tokens.SKY.clone({ unitPriceUsd: NormalizedNumber.ZERO }),
        value: NormalizedNumber(500.89),
      },
    },
  },
}
