import { Meta, StoryObj } from '@storybook/react'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { EasyBorrowSidePanel } from './EasyBorrowSidePanel'

const meta: Meta<typeof EasyBorrowSidePanel> = {
  title: 'Features/EasyBorrow/Components/EasyBorrowSidePanel',
  component: EasyBorrowSidePanel,
  decorators: [WithTooltipProvider(), WithClassname('max-w-[425px]')],
  args: {
    borrowRate: Percentage(0.05),
  },
}

export default meta
type Story = StoryObj<typeof EasyBorrowSidePanel>

export const Default: Story = {}
export const WithHF: Story = {
  name: 'With HF',
  args: {
    hf: bigNumberify(1.71341),
  },
}
export const WithHFAndLiquidationDetails: Story = {
  name: 'With HF and liquidation details',
  args: {
    hf: bigNumberify(1.71341),
    liquidationDetails: {
      liquidationPrice: NormalizedNumber(1262.9),
      tokenWithPrice: {
        priceInUSD: NormalizedNumber(1895.81),
        symbol: TokenSymbol('ETH'),
      },
    },
  },
}
