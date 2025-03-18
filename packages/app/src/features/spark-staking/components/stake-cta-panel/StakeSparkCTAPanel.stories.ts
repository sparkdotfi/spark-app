import { Percentage } from '@marsfoundation/common-universal'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { StakeSparkCTAPanel } from './StakeSparkCTAPanel'

const meta: Meta<typeof StakeSparkCTAPanel> = {
  title: 'Features/Savings/Components/StakeSparkCTAPanel',
  component: StakeSparkCTAPanel,
  decorators: [WithTooltipProvider(), withRouter(), WithClassname('max-w-7xl grid lg:grid-cols-2')],
  args: {
    apy: Percentage(0.12),
    isConnected: true,
    stake: () => {},
    connectWallet: () => {},
    tryInSandbox: () => {},
  },
}

export default meta
type Story = StoryObj<typeof StakeSparkCTAPanel>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
