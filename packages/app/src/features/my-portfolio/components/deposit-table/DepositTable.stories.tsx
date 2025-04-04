import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage, raise } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
import { withRouter } from 'storybook-addon-remix-react-router'
import { Deposit } from '../../logic/assets'
import { DepositTable } from './DepositTable'

const assets: Deposit[] = [
  {
    token: tokens.ETH,
    balance: NormalizedNumber('84.330123431'),
    deposit: NormalizedNumber('13.74'),
    supplyAPY: Percentage(0.0145),
    isUsedAsCollateral: true,
    reserveStatus: 'active',
  },
  {
    token: tokens.stETH,
    balance: NormalizedNumber('16.76212348'),
    deposit: NormalizedNumber('34.21'),
    supplyAPY: Percentage(0.0145),
    isUsedAsCollateral: true,
    reserveStatus: 'active',
  },
  {
    token: tokens.DAI,
    balance: NormalizedNumber('48.9234234'),
    deposit: NormalizedNumber('9.37'),
    supplyAPY: Percentage(0.0145),
    isUsedAsCollateral: false,
    reserveStatus: 'active',
  },
  {
    token: tokens.GNO,
    balance: NormalizedNumber('299.9234234'),
    deposit: NormalizedNumber('1.37'),
    supplyAPY: Percentage(0.0345),
    isUsedAsCollateral: false,
    reserveStatus: 'frozen',
  },
  {
    token: tokens.wstETH,
    balance: NormalizedNumber('89.923'),
    deposit: NormalizedNumber('5.37'),
    supplyAPY: Percentage(0.012),
    isUsedAsCollateral: false,
    reserveStatus: 'paused',
  },
]

const meta: Meta<typeof DepositTable> = {
  title: 'Features/MyPortfolio/Components/DepositTable',
  decorators: [withRouter, WithTooltipProvider()],
  component: DepositTable,
  args: {
    assets,
    openDialog: () => {},
  },
}

export default meta
type Story = StoryObj<typeof DepositTable>

export const Desktop: Story = {}

const WithCanvas: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switches = await canvas.findAllByRole('switch')
    ;(switches[0] ?? raise('No switch element found')).click()
  },
}

export const Mobile = getMobileStory(WithCanvas)
export const Tablet = getTabletStory(WithCanvas)
