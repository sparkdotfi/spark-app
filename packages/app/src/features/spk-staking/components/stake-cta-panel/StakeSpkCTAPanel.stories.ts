import { WithClassname } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { StakeSpkCTAPanel, StakeSpkCTAPanelProps } from './StakeSpkCTAPanel'

const meta: Meta<typeof StakeSpkCTAPanel> = {
  title: 'Features/SpkStaking/Components/StakeSpkCTAPanel',
  component: StakeSpkCTAPanel,
  decorators: [withRouter(), WithClassname('max-w-7xl grid lg:grid-cols-2')],
  args: {
    apy: Percentage(0.12),
    epochDuration: 24 * 60 * 60 * 7, // 7 days
  },
}
export default meta
type Story = StoryObj<typeof StakeSpkCTAPanel>

export const Desktop: StoryObj<StakeSpkCTAPanelProps & { type: 'connected' }> = {
  args: {
    type: 'connected',
    stake: () => {},
    spkBalance: NormalizedNumber(100),
  },
}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const Disconnected: Story = {
  args: {
    type: 'disconnected',
    connectWallet: () => {},
    tryInSandbox: () => {},
  },
}

export const NothingToStake: Story = {
  args: {
    type: 'connected',
    spkBalance: NormalizedNumber.ZERO,
  },
}
