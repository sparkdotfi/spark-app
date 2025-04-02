import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { AvailableToStakePanel } from './AvailableToStakePanel'

const meta: Meta<typeof AvailableToStakePanel> = {
  title: 'Features/SpkStaking/Components/AvailableToStakePanel',
  decorators: [withRouter()],
  component: AvailableToStakePanel,
}

export default meta
type Story = StoryObj<typeof AvailableToStakePanel>

export const Desktop: Story = {
  args: {
    token: tokens.SPK,
    balance: NormalizedNumber(1234),
    blockExplorerLink: '/',
    openStakeDialog: () => {},
  },
}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
