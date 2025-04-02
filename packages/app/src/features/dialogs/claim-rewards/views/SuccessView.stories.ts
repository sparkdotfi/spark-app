import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { SuccessView } from './SuccessView'

const meta: Meta<typeof SuccessView> = {
  title: 'Features/Dialogs/Views/ClaimRewards/Success',
  component: SuccessView,
  decorators: [WithClassname('max-w-xl')],
  args: {
    claimedRewards: [
      {
        token: tokens.wstETH,
        amount: NormalizedNumber(0.00157),
      },
      {
        token: tokens.WBTC,
        amount: NormalizedNumber(0.0003498),
      },
    ],
  },
}

export default meta
type Story = StoryObj<typeof SuccessView>

export const Desktop: Story = {}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
