import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { SpkStakingSkeleton } from './SpkStakingSkeleton'

const meta: Meta<typeof SpkStakingSkeleton> = {
  title: 'Features/SpkStaking/Components/Skeleton',
  component: SpkStakingSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SpkStakingSkeleton>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
