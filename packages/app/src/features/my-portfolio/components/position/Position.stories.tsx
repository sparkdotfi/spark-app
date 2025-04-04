import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import type { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { Position } from './Position'

const meta: Meta<typeof Position> = {
  title: 'Features/MyPortfolio/Components/Position',
  component: Position,
  decorators: [WithTooltipProvider()],
}

export default meta
type Story = StoryObj<typeof Position>

export const RoundValues: Story = {
  name: 'Round Values',
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
  },
}

export const RealValues: Story = {
  name: 'Real Values',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(110_412),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(32),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(17.4),
        },
      ],
      borrow: {
        current: NormalizedNumber(34780),
        max: NormalizedNumber(45012),
        percents: {
          borrowed: 31.5,
          max: 40.8,
          rest: 68.5,
        },
      },
    },
  },
}

export const SmallValues: Story = {
  name: 'Small Values',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(51.6),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(0.0001),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(0.023),
        },
      ],
      borrow: {
        current: NormalizedNumber(7),
        max: NormalizedNumber(30),
        percents: {
          borrowed: 13.5,
          max: 58,
          rest: 86.5,
        },
      },
    },
  },
}

export const BigValues: Story = {
  name: 'Big Values',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(335_260_080),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(50000),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(100000),
        },
      ],
      borrow: {
        current: NormalizedNumber(52301000),
        max: NormalizedNumber(100000000),
        percents: {
          borrowed: 15.6,
          max: 30,
          rest: 84.4,
        },
      },
    },
  },
}

export const ZeroBorrow: Story = {
  name: 'Zero Borrow',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(110_412),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(32),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(17.4),
        },
      ],
      borrow: {
        current: NormalizedNumber.ZERO,
        max: NormalizedNumber(45012),
        percents: {
          borrowed: 0,
          max: 41,
          rest: 100,
        },
      },
    },
  },
}

export const SmallBorrow: Story = {
  name: 'Small Borrow',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(110_412),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(32),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(17.4),
        },
      ],
      borrow: {
        current: NormalizedNumber(10),
        max: NormalizedNumber(45012),
        percents: {
          borrowed: 0,
          max: 41,
          rest: 100,
        },
      },
    },
  },
}

export const BigDifference: Story = {
  name: 'Big Difference',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(71_522),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(32),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(0.01),
        },
      ],
      borrow: {
        current: NormalizedNumber(34780),
        max: NormalizedNumber(45012),
        percents: {
          borrowed: 48.6,
          max: 62.9,
          rest: 51.4,
        },
      },
    },
  },
}

export const Empty: Story = {
  name: 'Empty',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber.ZERO,
      hasCollaterals: false,
      hasDeposits: false,
      healthFactor: undefined,
      collaterals: [],
      borrow: {
        current: NormalizedNumber.ZERO,
        max: NormalizedNumber.ZERO,
        percents: {
          borrowed: 0,
          max: 0,
          rest: 100,
        },
      },
    },
  },
}

export const FourTokens: Story = {
  name: 'Four Tokens',
  args: {
    positionSummary: {
      totalCollateralUSD: NormalizedNumber(94_878),
      hasCollaterals: true,
      hasDeposits: true,
      healthFactor: undefined,
      collaterals: [
        {
          token: tokens.ETH,
          value: NormalizedNumber(16),
        },
        {
          token: tokens.stETH,
          value: NormalizedNumber(17.4),
        },
        {
          token: tokens.DAI,
          value: NormalizedNumber(12000),
        },
        {
          token: tokens.sDAI,
          value: NormalizedNumber(8000),
        },
      ],
      borrow: {
        current: NormalizedNumber(24780),
        max: NormalizedNumber(35012),
        percents: {
          borrowed: 26.1,
          max: 36.9,
          rest: 73.9,
        },
      },
    },
  },
}
