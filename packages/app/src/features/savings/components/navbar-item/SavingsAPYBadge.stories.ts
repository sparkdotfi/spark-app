import { Meta, StoryObj } from '@storybook/react'

import { Percentage } from '@sparkdotfi/common-universal'
import { SavingsAPYBadge } from './SavingsAPYBadge'

const meta: Meta<typeof SavingsAPYBadge> = {
  title: 'Features/Savings/Components/NavbarItem/SavingsAPYBadge',
  component: SavingsAPYBadge,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    APY: Percentage(0.05),
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const TwoDecimals: Story = {
  name: 'Two decimals',
  args: {
    APY: Percentage(0.0497),
  },
}
