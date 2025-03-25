import { STORYBOOK_TIMESTAMP } from '@sb/consts'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { BorrowStatusPanel } from './BorrowStatusPanel'

const meta: Meta<typeof BorrowStatusPanel> = {
  title: 'Features/MarketDetails/Components/StatusPanel/BorrowStatusPanel',
  component: BorrowStatusPanel,
  decorators: [WithTooltipProvider(), WithClassname('max-w-2xl'), withRouter],
}

export default meta
type Story = StoryObj<typeof BorrowStatusPanel>

const chartProps = {
  optimalUtilizationRate: Percentage('0.45'),
  utilizationRate: Percentage('0.08'),
  variableRateSlope1: bigNumberify('45000000000000000000000000'),
  variableRateSlope2: bigNumberify('800000000000000000000000000'),
  baseVariableBorrowRate: bigNumberify('2500000000000000000000000'),
}

export const CanBeBorrowed: Story = {
  name: 'Can be borrowed',
  args: {
    status: 'yes',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(1244),
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    borrowLiquidity: NormalizedUnitNumber(1244),
    limitedByBorrowCap: true,
    chartProps,
    sparkRewards: [],
  },
}

export const CanBeBorrowedMobile = {
  ...getMobileStory(CanBeBorrowed),
  name: 'Can be borrowed (Mobile)',
}
export const CanBeBorrowedTablet = {
  ...getTabletStory(CanBeBorrowed),
  name: 'Can be borrowed (Tablet)',
}

export const OnlyInSiloedMode: Story = {
  name: 'Only in siloed mode',
  args: {
    status: 'only-in-siloed-mode',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(1244),
    borrowLiquidity: NormalizedUnitNumber(1244),
    limitedByBorrowCap: true,
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    chartProps,
    sparkRewards: [],
  },
}

export const BorrowCapReached: Story = {
  name: 'Borrow cap reached',
  args: {
    status: 'borrow-cap-reached',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(2244),
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    borrowLiquidity: NormalizedUnitNumber(0),
    limitedByBorrowCap: true,
    chartProps,
    sparkRewards: [],
  },
}

export const CannotBeBorrowed: Story = {
  name: 'Cannot be borrowed',
  args: {
    status: 'no',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(0),
    apy: Percentage(0),
    reserveFactor: Percentage(0.05),
    borrowLiquidity: NormalizedUnitNumber(0),
    limitedByBorrowCap: true,
    chartProps,
    sparkRewards: [],
  },
}

export const WithCapAutomatorInfo: Story = {
  name: 'With cap automator info',
  args: {
    status: 'yes',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(1244),
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    borrowLiquidity: NormalizedUnitNumber(1244),
    limitedByBorrowCap: true,
    chartProps,
    capAutomatorInfo: {
      maxCap: NormalizedUnitNumber(2944),
      gap: NormalizedUnitNumber(0),
      increaseCooldown: 43200,
      lastIncreaseTimestamp: Math.floor(STORYBOOK_TIMESTAMP / 1000 - 41903),
      lastUpdateBlock: 0,
    },
    sparkRewards: [],
  },
}

export const WithCapAutomatorInfoMobile = {
  ...getMobileStory(WithCapAutomatorInfo),
  name: 'With cap automator info (Mobile)',
}

export const DAI: Story = {
  name: 'DAI',
  args: {
    status: 'yes',
    token: tokens.DAI,
    totalBorrowed: NormalizedUnitNumber(1244),
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    borrowLiquidity: NormalizedUnitNumber(1244),
    limitedByBorrowCap: true,
    chartProps: {
      optimalUtilizationRate: Percentage('1'),
      utilizationRate: Percentage('0.97012653796557908901'),
      variableRateSlope1: bigNumberify('0'),
      variableRateSlope2: bigNumberify('0'),
      baseVariableBorrowRate: bigNumberify('62599141818649791361008000'),
    },
    showTokenBadge: true,
    sparkRewards: [],
  },
}

export const WithOneSparkReward: Story = {
  name: 'With One Spark Reward',
  args: {
    status: 'yes',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(1244),
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    borrowLiquidity: NormalizedUnitNumber(1244),
    limitedByBorrowCap: true,
    chartProps,
    sparkRewards: [
      {
        rewardTokenSymbol: TokenSymbol('USDS'),
        action: 'borrow',
        longDescription: 'Borrow WBTC and get USDS',
        apy: Percentage(0.01),
      },
    ],
  },
}

export const WithMultipleSparkReward: Story = {
  name: 'With Multiple Spark Reward',
  args: {
    status: 'yes',
    token: tokens.WBTC,
    totalBorrowed: NormalizedUnitNumber(1244),
    apy: Percentage(0.01),
    reserveFactor: Percentage(0.05),
    borrowCap: NormalizedUnitNumber(2244),
    borrowLiquidity: NormalizedUnitNumber(1244),
    limitedByBorrowCap: true,
    chartProps,
    sparkRewards: [
      {
        rewardTokenSymbol: TokenSymbol('USDS'),
        action: 'borrow',
        longDescription: 'Borrow WBTC and get USDS',
        apy: Percentage(0.01),
      },
      {
        rewardTokenSymbol: TokenSymbol('wstETH'),
        action: 'borrow',
        longDescription: 'Borrow WBTC and get wstETH',
        apy: Percentage(0.012),
      },
    ],
  },
}
