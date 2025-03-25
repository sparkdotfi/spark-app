import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { bigNumberify } from '@sparkdotfi/common-universal'
import { Percentage } from '@sparkdotfi/common-universal'

import { InterestYieldChart } from './InterestYieldChart'

const meta: Meta<typeof InterestYieldChart> = {
  title: 'Features/MarketDetails/Components/Charts/InterestYield',
  component: InterestYieldChart,
}

export default meta
type Story = StoryObj<typeof InterestYieldChart>

export const wstETH: Story = {
  name: 'wstETH',
  args: {
    optimalUtilizationRate: Percentage('0.45'),
    utilizationRate: Percentage('0.00018168087759056403'),
    variableRateSlope1: bigNumberify('45000000000000000000000000'),
    variableRateSlope2: bigNumberify('800000000000000000000000000'),
    baseVariableBorrowRate: bigNumberify('2500000000000000000000000'),
  },
}

export const wstETHMobile: Story = {
  ...getMobileStory(wstETH),
  name: 'wstETH Mobile',
}
export const wstETHTablet: Story = {
  ...getTabletStory(wstETH),
  name: 'wstETH Tablet',
}

export const DAI: Story = {
  name: 'DAI',
  args: {
    optimalUtilizationRate: Percentage('1'),
    utilizationRate: Percentage('0.97012653796557908901'),
    variableRateSlope1: bigNumberify('0'),
    variableRateSlope2: bigNumberify('0'),
    baseVariableBorrowRate: bigNumberify('62599141818649791361008000'),
  },
}

export const DAIMobile = getMobileStory(DAI)
export const DAITablet = getTabletStory(DAI)
