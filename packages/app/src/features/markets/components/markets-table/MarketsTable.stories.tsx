import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage, raise } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
import { withRouter } from 'storybook-addon-remix-react-router'
import { MarketsTable } from './MarketsTable'

const meta: Meta<typeof MarketsTable> = {
  title: 'Features/Markets/Components/MarketsTable',
  component: MarketsTable,
  decorators: [WithTooltipProvider(), WithClassname('max-w-6xl'), withRouter],
  args: {
    entries: [
      {
        token: tokens.wstETH,
        reserveStatus: 'frozen',
        borrowApyDetails: { baseApy: Percentage(0.11) },
        depositApyDetails: {
          baseApy: Percentage(0.157),
        },
        totalBorrowed: NormalizedUnitNumber(0),
        totalSupplied: NormalizedUnitNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
      {
        token: tokens.GNO,
        reserveStatus: 'paused',
        borrowApyDetails: { baseApy: Percentage(0.11) },
        depositApyDetails: {
          baseApy: Percentage(0.157),
        },
        totalBorrowed: NormalizedUnitNumber(0),
        totalSupplied: NormalizedUnitNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'no',
          collateralEligibilityStatus: 'no',
          borrowEligibilityStatus: 'no',
        },
      },
      {
        token: tokens.ETH,
        reserveStatus: 'active',
        borrowApyDetails: {
          baseApy: Percentage(0.11),
          sparkRewards: [
            {
              rewardTokenSymbol: TokenSymbol('wstETH'),
              action: 'borrow',
              longDescription: 'Borrow ETH and get wstETH',
              apy: Percentage(0.12),
            },
            {
              rewardTokenSymbol: TokenSymbol('RED'),
              action: 'supply',
              longDescription: 'Supply rETH and get RED',
            },
          ],
        },
        depositApyDetails: {
          baseApy: Percentage(0.157),
          airdrops: [TokenSymbol('SPK')],
        },
        totalBorrowed: NormalizedUnitNumber(0),
        totalSupplied: NormalizedUnitNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
      {
        token: tokens.rETH,
        reserveStatus: 'active',
        borrowApyDetails: { baseApy: Percentage(0.11) },
        depositApyDetails: {
          baseApy: Percentage(0.157),
          airdrops: [TokenSymbol('SPK')],
          sparkRewards: [
            {
              rewardTokenSymbol: TokenSymbol('USDS'),
              action: 'supply',
              longDescription: 'Supply rETH and get USDS',
              apy: Percentage(0.01),
            },
            {
              rewardTokenSymbol: TokenSymbol('RED'),
              action: 'supply',
              longDescription: 'Supply rETH and get RED',
            },
          ],
        },
        totalBorrowed: NormalizedUnitNumber(0),
        totalSupplied: NormalizedUnitNumber(11.99),
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
      {
        token: tokens.DAI,
        reserveStatus: 'active',
        borrowApyDetails: {
          baseApy: Percentage(0.0553),
        },
        depositApyDetails: { baseApy: Percentage(0.05) },
        totalBorrowed: NormalizedUnitNumber(1257),
        totalSupplied: NormalizedUnitNumber(0),
        marketStatus: {
          supplyAvailabilityStatus: 'yes',
          collateralEligibilityStatus: 'yes',
          borrowEligibilityStatus: 'yes',
        },
      },
    ],
    chainId: 1,
  },
}

export default meta
type Story = StoryObj<typeof MarketsTable>

export const Default: Story = {
  name: 'Default',
}

export const Mobile = getMobileStory<Story>({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switches = await canvas.findAllByRole('switch')
    ;(switches[0] ?? raise('No switch element found')).click()
  },
})
export const Tablet = getTabletStory(Default)
