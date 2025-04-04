import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage, raise } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
import { withRouter } from 'storybook-addon-remix-react-router'
import { Borrow } from '../../logic/assets'
import { BorrowTable } from './BorrowTable'

const assets: Borrow[] = [
  {
    token: tokens.DAI,
    available: NormalizedNumber('22727'),
    debt: NormalizedNumber('50000'),
    borrowAPY: Percentage(0.11),
    reserveStatus: 'active',
  },
  {
    token: tokens.ETH,
    available: NormalizedNumber('11.99'),
    debt: NormalizedNumber.ZERO,
    borrowAPY: Percentage(0.157),
    reserveStatus: 'active',
  },
  {
    token: tokens.stETH,
    available: NormalizedNumber('14.68'),
    debt: NormalizedNumber.ZERO,
    borrowAPY: Percentage(0.145),
    reserveStatus: 'active',
  },
  {
    token: tokens.GNO,
    available: NormalizedNumber('0'),
    debt: NormalizedNumber(10),
    borrowAPY: Percentage(0.345),
    reserveStatus: 'frozen',
  },
  {
    token: tokens.wstETH,
    available: NormalizedNumber('0'),
    debt: NormalizedNumber(2),
    borrowAPY: Percentage(0.32),
    reserveStatus: 'paused',
  },
]

const meta: Meta<typeof BorrowTable> = {
  title: 'Features/MyPortfolio/Components/BorrowTable',
  decorators: [withRouter, WithTooltipProvider()],
  component: BorrowTable,
  args: {
    assets,
    openDialog: () => {},
    eModeCategoryId: 0,
  },
}

export default meta
type Story = StoryObj<typeof BorrowTable>

export const Desktop: Story = {}

const WithCanvas: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switches = await canvas.findAllByRole('switch')
    ;(switches[0] ?? raise('No switch element found')).click()
  },
}

export const Mobile = getMobileStory(WithCanvas)
export const Tablet = getTabletStory(Desktop)
