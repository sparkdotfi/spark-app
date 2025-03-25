import { WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'

import { Percentage } from '@sparkdotfi/common-universal'
import { withRouter } from 'storybook-addon-remix-react-router'
import { UpgradeSavingsBanner } from './UpgradeSavingsBanner'

const meta: Meta<typeof UpgradeSavingsBanner> = {
  title: 'Features/Savings/Components/UpgradeSavingsBanner',
  component: UpgradeSavingsBanner,
  decorators: [WithTooltipProvider(), withRouter()],
  args: {
    onUpgradeSavingsClick: () => {},
    apyImprovement: Percentage(0.01),
  },
}

export default meta
type Story = StoryObj<typeof UpgradeSavingsBanner>

export const Desktop: Story = {}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)

export const WithoutAPY: Story = {
  args: {
    apyImprovement: undefined,
  },
}
export const WithoutAPYMobile = getMobileStory(WithoutAPY)
export const WithoutAPYTablet = getTabletStory(WithoutAPY)
