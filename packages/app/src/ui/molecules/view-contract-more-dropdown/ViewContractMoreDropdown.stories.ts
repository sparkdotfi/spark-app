import { WithClassname } from '@sb/decorators'
import { getHoveredStory } from '@sb/utils'
import { Meta, StoryObj } from '@storybook/react'

import { within } from '@storybook/test'
import { userEvent } from '@storybook/test'
import { withRouter } from 'storybook-addon-remix-react-router'
import { ViewContractMoreDropdown } from './ViewContractMoreDropdown'

const meta: Meta<typeof ViewContractMoreDropdown> = {
  title: 'Components/Molecules/ViewContractMoreDropdown',
  component: ViewContractMoreDropdown,
  decorators: [WithClassname('p-8 bg-primary flex justify-end h-48'), withRouter()],
  args: { blockExplorerLink: '/' },
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button')
    await userEvent.click(button)
  },
}

export default meta
type Story = StoryObj<typeof ViewContractMoreDropdown>

export const Default: Story = {
  name: 'Default',
}

export const Hovered = getHoveredStory(Default, 'button')
