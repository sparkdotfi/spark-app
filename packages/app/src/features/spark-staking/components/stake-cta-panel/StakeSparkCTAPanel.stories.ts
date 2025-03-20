import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { WithClassname } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { StakeSparkCTAPanel, StakeSparkCTAPanelProps } from './StakeSparkCTAPanel'

const meta: Meta<typeof StakeSparkCTAPanel> = {
  title: 'Features/SparkStaking/Components/StakeSparkCTAPanel',
  component: StakeSparkCTAPanel,
  decorators: [withRouter(), WithClassname('max-w-7xl grid lg:grid-cols-2')],
  args: {
    apy: Percentage(0.12),
  },
}
export default meta
type Story = StoryObj<typeof StakeSparkCTAPanel>

export const Desktop: StoryObj<StakeSparkCTAPanelProps & { type: 'connected' }> = {
  args: {
    type: 'connected',
    stake: () => {},
    spkBalance: NormalizedUnitNumber(100),
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
    spkBalance: NormalizedUnitNumber(0),
  },
}
