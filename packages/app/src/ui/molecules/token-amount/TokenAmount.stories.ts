import { Meta, StoryObj } from '@storybook/react'

import { tokens } from '@sb/tokens'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { TokenAmount } from './TokenAmount'

const meta: Meta<typeof TokenAmount> = {
  title: 'Components/Molecules/New/TokenAmount',
  component: TokenAmount,
  args: {
    token: tokens.USDS,
    amount: NormalizedNumber(100),
  },
}

export default meta

type Story = StoryObj<typeof TokenAmount>

export const Default: Story = {
  args: {
    token: tokens.USDS,
    amount: NormalizedNumber(100),
  },
}
export const Horizontal: Story = {
  args: {
    token: tokens.USDS,
    amount: NormalizedNumber(100),
    variant: 'horizontal',
  },
}
export const LargeAmount: Story = {
  name: 'Large amount',
  args: {
    token: tokens.USDC,
    amount: NormalizedNumber(123435534522354),
  },
}
export const SmallAmount: Story = {
  name: 'Small amount',
  args: {
    token: tokens.ETH,
    amount: NormalizedNumber(0.00000001),
  },
}
export const CheapToken: Story = {
  name: 'Cheap token',
  args: {
    token: tokens.SKY,
    amount: NormalizedNumber(0.1),
  },
}
