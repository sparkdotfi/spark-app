import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getHoveredStory } from '@sb/utils'
import { Meta, StoryObj } from '@storybook/react'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Percentage } from '@sparkdotfi/common-universal'

import { RewardBadge } from './RewardBadge'

const meta: Meta<typeof RewardBadge> = {
  title: 'Features/Markets/Components/RewardBadge',
  component: RewardBadge,
  decorators: [WithTooltipProvider(), WithClassname('bg-primary flex justify-center p-8 items-end w-96 h-56')],
}

export default meta
type Story = StoryObj<typeof RewardBadge>

export const Default: Story = {
  name: 'Default',
  args: {
    incentivizedReserve: tokens.DAI.symbol,
    rewardApr: Percentage(0.011),
    rewardToken: tokens.wstETH.symbol,
  },
}

export const Hovered = getHoveredStory(Default, 'button')

export const UnknownToken: Story = {
  name: 'UnknownToken',
  args: {
    incentivizedReserve: tokens.DAI.symbol,
    rewardApr: Percentage(0.011),
    rewardToken: TokenSymbol('SOME'),
  },
}
