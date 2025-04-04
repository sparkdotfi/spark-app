import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, raise } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { WithdrawalsTablePanel } from './WithdrawalsTablePanel'

const meta: Meta<typeof WithdrawalsTablePanel> = {
  title: 'Features/SpkStaking/Components/WithdrawalsTablePanel',
  decorators: [WithTooltipProvider(), WithClassname('max-w-4xl')],
  component: WithdrawalsTablePanel,
  args: {
    rows: [
      {
        token: tokens.SPK,
        amount: NormalizedNumber(78.8456),
        timeToClaim: 703412,
        claimableAt: new Date('2025-04-04T12:34:35.000Z'),
        action: () => {},
        actionName: 'Claim',
        isActionEnabled: false,
      },
      {
        token: tokens.SPK,
        amount: NormalizedNumber(123.4323),
        timeToClaim: 0,
        claimableAt: new Date('2025-03-21T12:34:35.000Z'),
        action: () => {},
        actionName: 'Claim',
        isActionEnabled: true,
      },
    ],
  },
}

export default meta
type Story = StoryObj<typeof WithdrawalsTablePanel>

export const Desktop: Story = {}
export const Mobile: Story = {
  ...getMobileStory(Desktop),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const rows = await canvas.findAllByRole('switch')
    const firstRow = rows[0] ?? raise('No table row found')
    await userEvent.click(firstRow)
  },
}
export const Tablet = getTabletStory(Desktop)
