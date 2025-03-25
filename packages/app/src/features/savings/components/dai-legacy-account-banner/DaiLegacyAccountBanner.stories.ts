import { WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Percentage } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { DaiLegacyAccountBanner } from './DaiLegacyAccountBanner'

const meta: Meta<typeof DaiLegacyAccountBanner> = {
  title: 'Features/Savings/Components/DaiLegacyAccountBanner',
  component: DaiLegacyAccountBanner,
  decorators: [WithTooltipProvider(), withRouter()],
  args: { apyImprovement: Percentage(0.01) },
}

export default meta
type Story = StoryObj<typeof DaiLegacyAccountBanner>

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
