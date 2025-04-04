import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { EntryAssetsPanel } from './EntryAssetsPanel'

const meta: Meta<typeof EntryAssetsPanel> = {
  title: 'Features/Savings/Components/EntryAssetsPanel',
  decorators: [withRouter()],
  component: EntryAssetsPanel,
}

export default meta
type Story = StoryObj<typeof EntryAssetsPanel>

export const Desktop: Story = {
  args: {
    assets: [
      {
        token: tokens.DAI,
        balance: NormalizedNumber(22727),
        blockExplorerLink: '/',
      },
      {
        token: tokens.USDS,
        balance: NormalizedNumber(22720),
        blockExplorerLink: '/',
      },
      {
        token: tokens.USDC,
        balance: NormalizedNumber.ZERO,
        blockExplorerLink: '/',
      },
    ],
    openDepositDialog: () => {},
    openConvertStablesDialog: () => {},
    showConvertDialogButton: true,
  },
}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
