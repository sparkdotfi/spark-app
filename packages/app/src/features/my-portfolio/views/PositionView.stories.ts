import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { PositionView } from './PositionView'

const meta: Meta<typeof PositionView> = {
  title: 'Features/MyPortfolio/Views/PositionView',
  component: PositionView,
  decorators: [withRouter, WithTooltipProvider()],
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedUnitNumber(167_600),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedUnitNumber(50),
        },
        {
          token: tokens.stETH,
          value: NormalizedUnitNumber(25),
        },
      ],
      borrow: {
        current: NormalizedUnitNumber(50_000),
        max: NormalizedUnitNumber(75_000),
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
        balance: NormalizedUnitNumber('84.330123431'),
        deposit: NormalizedUnitNumber('13.74'),
        supplyAPY: Percentage(0.0145),
        isUsedAsCollateral: true,
      },
      {
        token: tokens.stETH,
        reserveStatus: 'active',
        balance: NormalizedUnitNumber('16.76212348'),
        deposit: NormalizedUnitNumber('34.21'),
        supplyAPY: Percentage(0.0145),
        isUsedAsCollateral: true,
      },
      {
        token: tokens.DAI,
        reserveStatus: 'active',
        balance: NormalizedUnitNumber('48.9234234'),
        deposit: NormalizedUnitNumber('9.37'),
        supplyAPY: Percentage(0.0145),
        isUsedAsCollateral: false,
      },
      {
        token: tokens.GNO,
        balance: NormalizedUnitNumber('299.9234234'),
        deposit: NormalizedUnitNumber('1.37'),
        supplyAPY: Percentage(0.0345),
        isUsedAsCollateral: false,
        reserveStatus: 'frozen',
      },
      {
        token: tokens.wstETH,
        balance: NormalizedUnitNumber('89.923'),
        deposit: NormalizedUnitNumber('5.37'),
        supplyAPY: Percentage(0.012),
        isUsedAsCollateral: false,
        reserveStatus: 'paused',
      },
    ],
    borrows: [
      {
        token: tokens.DAI,
        reserveStatus: 'active',
        available: NormalizedUnitNumber('22727'),
        debt: NormalizedUnitNumber('50000'),
        borrowAPY: Percentage(0.11),
      },
      {
        token: tokens.ETH,
        reserveStatus: 'active',
        available: NormalizedUnitNumber('11.99'),
        debt: NormalizedUnitNumber(0),
        borrowAPY: Percentage(0.157),
      },
      {
        token: tokens.stETH,
        reserveStatus: 'active',
        available: NormalizedUnitNumber('14.68'),
        debt: NormalizedUnitNumber(0),
        borrowAPY: Percentage(0.145),
      },
      {
        token: tokens.GNO,
        available: NormalizedUnitNumber('0'),
        debt: NormalizedUnitNumber(10),
        borrowAPY: Percentage(0.345),
        reserveStatus: 'frozen',
      },
      {
        token: tokens.wstETH,
        available: NormalizedUnitNumber('0'),
        debt: NormalizedUnitNumber(2),
        borrowAPY: Percentage(0.32),
        reserveStatus: 'paused',
      },
    ],
    eModeCategoryId: 0,
    walletComposition: {
      assets: [
        {
          token: tokens.ETH,
          balance: NormalizedUnitNumber(132.28),
        },
        {
          token: tokens.USDC,
          balance: NormalizedUnitNumber(90000),
        },
        {
          token: tokens.stETH,
          balance: NormalizedUnitNumber(34.21),
        },
        {
          token: tokens.DAI,
          balance: NormalizedUnitNumber(50000),
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
