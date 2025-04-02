import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { Meta, StoryObj } from '@storybook/react'

import { tokens } from '@sb/tokens'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { userEvent, within } from '@storybook/test'
import { TopbarRewards } from './TopbarRewards'

const meta: Meta<typeof TopbarRewards> = {
  title: 'Features/Topbar/Components/TopbarRewards',
  decorators: [WithTooltipProvider(), WithClassname('flex justify-end h-96')],
  component: TopbarRewards,
  args: {
    rewards: [
      {
        token: tokens.wstETH,
        amount: NormalizedNumber(0.00157),
      },
      {
        token: tokens.WBTC,
        amount: NormalizedNumber(0.0003498),
      },
    ],
    onClaim: () => {},
    totalClaimableReward: NormalizedNumber(0.0029198),
  },
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button')

    await userEvent.click(button)
  },
}

export default meta
type Story = StoryObj<typeof TopbarRewards>

export const Default: Story = {}
