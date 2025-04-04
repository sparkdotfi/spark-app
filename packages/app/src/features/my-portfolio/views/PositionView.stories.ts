import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

import { PositionView } from './PositionView'

const meta: Meta<typeof PositionView> = {
  title: 'Features/MyPortfolio/Views/PositionView',
  component: PositionView,
  decorators: [withRouter, WithTooltipProvider()],
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(167_600),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(50),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(25),
        },
      ],
      borrow: {
        current: NormalizedNumber(50_000),
        max: NormalizedNumber(75_000),
        percents: {
          borrowed: 29,
          max: 44,
          rest: 71,
        },
      },
    },
    deposits: [
      {
        token: tokens.ETH,
        reserveStatus: 'active',
        balance: NormalizedNumber('84.330123431'),
        deposit: NormalizedNumber('13.74'),
        supplyAPY: Percentage(0.0145),
        isUsedAsCollateral: true,
      },
      {
        token: tokens.stETH,
        reserveStatus: 'active',
        balance: NormalizedNumber('16.76212348'),
        deposit: NormalizedNumber('34.21'),
        supplyAPY: Percentage(0.0145),
        isUsedAsCollateral: true,
      },
      {
        token: tokens.DAI,
        reserveStatus: 'active',
        balance: NormalizedNumber('48.9234234'),
        deposit: NormalizedNumber('9.37'),
        supplyAPY: Percentage(0.0145),
        isUsedAsCollateral: false,
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
    ],
    borrows: [
      {
        token: tokens.DAI,
        reserveStatus: 'active',
        available: NormalizedNumber('22727'),
        debt: NormalizedNumber('50000'),
        borrowAPY: Percentage(0.11),
      },
      {
        token: tokens.ETH,
        reserveStatus: 'active',
        available: NormalizedNumber('11.99'),
        debt: NormalizedNumber.ZERO,
        borrowAPY: Percentage(0.157),
      },
      {
        token: tokens.stETH,
        reserveStatus: 'active',
        available: NormalizedNumber('14.68'),
        debt: NormalizedNumber.ZERO,
        borrowAPY: Percentage(0.145),
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
    ],
    eModeCategoryId: 0,
    walletComposition: {
      assets: [
        {
          token: tokens.ETH,
          balance: NormalizedNumber(132.28),
        },
        {
          token: tokens.USDC,
          balance: NormalizedNumber(90000),
        },
        {
          token: tokens.stETH,
          balance: NormalizedNumber(34.21),
        },
        {
          token: tokens.DAI,
          balance: NormalizedNumber(50000),
        },
      ],
      includeDeposits: true,
      setIncludeDeposits: () => {},
    },
    openDialog: () => {},
  },
}

export default meta
type Story = StoryObj<typeof PositionView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
