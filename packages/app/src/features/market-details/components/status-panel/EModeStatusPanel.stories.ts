import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { Percentage } from '@sparkdotfi/common-universal'

import { EModeStatusPanel } from './EModeStatusPanel'

const meta: Meta<typeof EModeStatusPanel> = {
  title: 'Features/MarketDetails/Components/StatusPanel/EModeStatusPanel',
  component: EModeStatusPanel,
  decorators: [WithTooltipProvider(), WithClassname('max-w-2xl'), withRouter],
  args: {
    maxLtv: Percentage(0.95),
    liquidationThreshold: Percentage(0.9),
    liquidationPenalty: Percentage(0.02),
    categoryId: 1,
    eModeCategoryTokens: [tokens.WETH.symbol, tokens.wstETH.symbol, tokens.rETH.symbol],
  },
}

export default meta
type Story = StoryObj<typeof EModeStatusPanel>

export const ETHDesktop: Story = {
  name: 'ETH Correlated',
}
export const ETHMobile: Story = {
  ...getMobileStory(ETHDesktop),
  name: 'ETH Correlated (Mobile)',
}
export const ETHTablet: Story = {
  ...getTabletStory(ETHDesktop),
  name: 'ETH Correlated (Tablet)',
}

export const SdaiDesktop: Story = {
  name: 'sDAI Correlated',
  args: {
    categoryId: 2,
    eModeCategoryTokens: [tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDT.symbol],
  },
}
export const SdaiMobile: Story = {
  ...getMobileStory(SdaiDesktop),
  name: 'sDAI Correlated (Mobile)',
}
export const SdaiTablet: Story = {
  ...getTabletStory(SdaiDesktop),
  name: 'sDAI Correlated (Tablet)',
}
