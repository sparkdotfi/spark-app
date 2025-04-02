import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { mainnet } from 'viem/chains'
import { SuccessView, SuccessViewProps } from './SuccessView'

const meta: Meta<typeof SuccessView> = {
  title: 'Features/Dialogs/Views/ClaimSparkRewards/Success',
  component: SuccessView,
  decorators: [WithClassname('max-w-xl')],
  args: {
    claimedRewards: [
      {
        token: tokens.RED,
        amountToClaim: NormalizedNumber(0.00157),
      },
      {
        token: tokens.wstETH,
        amountToClaim: NormalizedNumber(0.0003498),
      },
    ],
    chainId: mainnet.id,
    onClose: () => {},
  } satisfies SuccessViewProps,
}

export default meta
type Story = StoryObj<typeof SuccessView>

export const Desktop: Story = {}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
