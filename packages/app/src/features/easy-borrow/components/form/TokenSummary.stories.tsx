import { tokens } from '@sb/tokens'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

import { TokenSummary } from './TokenSummary'

const meta: Meta<typeof TokenSummary> = {
  title: 'Features/EasyBorrow/Components/Form/TokenSummary',
  component: TokenSummary,
  args: {
    position: {
      tokens: [tokens.ETH, tokens.DAI, tokens.USDC],
      totalValueUSD: NormalizedUnitNumber(100_000),
    },
  },
}

export default meta

type Story = StoryObj<typeof TokenSummary>

export const Default: Story = {
  name: 'Default',
}

export const ManySymbols: Story = {
  name: 'Many symbols',
  args: {
    position: {
      tokens: [tokens.ETH, tokens.DAI, tokens.USDC, tokens.USDT, tokens.GNO],
      totalValueUSD: NormalizedUnitNumber(100_000),
    },
  },
}
