import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { ExitFarmSwitch } from './ExitFarmSwitch'

const meta: Meta<typeof ExitFarmSwitch> = {
  title: 'Features/FarmDetails/Dialogs/Components/ExitFarmSwitch',
  component: ExitFarmSwitch,
  args: {
    checked: false,
    onSwitch: () => {},
    reward: {
      token: tokens.SKY,
      value: NormalizedUnitNumber(2311.34),
    },
  },
}

export default meta
type Story = StoryObj<typeof ExitFarmSwitch>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const SwitchOn: Story = {
  args: {
    checked: true,
  },
}
