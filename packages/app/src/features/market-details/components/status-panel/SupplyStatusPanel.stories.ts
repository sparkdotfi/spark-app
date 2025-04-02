import { STORYBOOK_TIMESTAMP } from '@sb/consts'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { Meta, StoryObj } from '@storybook/react'

import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { withRouter } from 'storybook-addon-remix-react-router'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { SupplyStatusPanel } from './SupplyStatusPanel'

const meta: Meta<typeof SupplyStatusPanel> = {
  title: 'Features/MarketDetails/Components/StatusPanel/SupplyStatusPanel',
  component: SupplyStatusPanel,
  decorators: [WithTooltipProvider(), WithClassname('max-w-2xl'), withRouter],
}

export default meta
type Story = StoryObj<typeof SupplyStatusPanel>

export const CanBeSupplied: Story = {
  name: 'Can Be Supplied',
  args: {
    status: 'yes',
    token: tokens.rETH,
    totalSupplied: NormalizedUnitNumber(72_000),
    supplyCap: NormalizedUnitNumber(112_000),
    apy: Percentage(0.05),
    sparkRewards: [],
  },
}

export const CanBeSuppliedMobile = getMobileStory(CanBeSupplied)
export const CanBeSuppliedTablet = getTabletStory(CanBeSupplied)

export const SupplyCapReached: Story = {
  name: 'Supply Cap Reached',
  args: {
    status: 'supply-cap-reached',
    token: tokens.rETH,
    totalSupplied: NormalizedUnitNumber(112_000),
    supplyCap: NormalizedUnitNumber(112_000),
    apy: Percentage(0.05),
    sparkRewards: [],
  },
}

export const CannotBeSupplied: Story = {
  name: 'Cannot Be Supplied',
  args: {
    status: 'no',
    token: tokens.rETH,
    totalSupplied: NormalizedUnitNumber.ZERO,
    supplyCap: NormalizedUnitNumber.ZERO,
    apy: Percentage(0),
    sparkRewards: [],
  },
}

export const WithCapAutomatorInfo: Story = {
  name: 'With cap automator info',
  args: {
    status: 'yes',
    token: tokens.rETH,
    totalSupplied: NormalizedUnitNumber(72_000),
    supplyCap: NormalizedUnitNumber(112_000),
    apy: Percentage(0.05),
    capAutomatorInfo: {
      maxCap: NormalizedUnitNumber(200_000),
      gap: NormalizedUnitNumber.ZERO,
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

export const WithOneSparkReward: Story = {
  name: 'With One Spark Reward',
  args: {
    status: 'yes',
    token: tokens.rETH,
    totalSupplied: NormalizedUnitNumber(72_000),
    supplyCap: NormalizedUnitNumber(112_000),
    apy: Percentage(0.05),
    sparkRewards: [
      {
        rewardTokenSymbol: TokenSymbol('USDS'),
        action: 'supply',
        longDescription: 'Supply rETH and get USDS',
        apy: Percentage(0.01),
      },
    ],
  },
}

export const WithMultipleSparkReward: Story = {
  name: 'With Multiple Spark Reward',
  args: {
    status: 'yes',
    token: tokens.rETH,
    totalSupplied: NormalizedUnitNumber(72_000),
    supplyCap: NormalizedUnitNumber(112_000),
    apy: Percentage(0.05),
    sparkRewards: [
      {
        rewardTokenSymbol: TokenSymbol('RED'),
        action: 'supply',
        longDescription: 'Supply cbBTC and get RED',
        apy: undefined,
      },
      {
        rewardTokenSymbol: TokenSymbol('wstETH'),
        action: 'supply',
        longDescription: 'Supply rETH and get wstETH',
        apy: Percentage(0.012),
      },
    ],
  },
}
