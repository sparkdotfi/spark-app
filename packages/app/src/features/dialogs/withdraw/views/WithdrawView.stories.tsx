import { getMockMarketInfo, getMockReserve } from '@/test/integration/constants'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { useForm } from 'react-hook-form'
import { WithdrawView } from './WithdrawView'

const meta: Meta<typeof WithdrawView> = {
  title: 'Features/Dialogs/Views/Withdraw',
  component: (args) => {
    const form = useForm() as any
    return <WithdrawView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    withdrawOptions: [
      {
        token: tokens.DAI,
        balance: NormalizedNumber(50000),
      },
      {
        token: tokens.ETH,
        balance: NormalizedNumber(10),
      },
    ],
    assetsToWithdrawFields: {
      selectedAsset: {
        token: tokens.DAI,
        balance: NormalizedNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedNumber(5000),
      changeAsset: () => {},
    },
    withdrawAsset: {
      token: tokens.DAI,
      value: NormalizedNumber(2000),
    },
    objectives: [
      {
        type: 'withdraw',
        reserve: getMockReserve({
          token: tokens.DAI,
        }),
        value: NormalizedNumber(2000),
        gatewayApprovalValue: NormalizedNumber(2000),
        all: false,
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: false,
      goToSuccessScreen: () => {},
    },
    currentPositionOverview: {
      healthFactor: BigNumber(4),
      tokenSupply: NormalizedNumber(2000),
      supplyAPY: Percentage(0.04),
    },
    updatedPositionOverview: {
      healthFactor: BigNumber(1.1),
      tokenSupply: NormalizedNumber(1000),
      supplyAPY: Percentage(0.04),
    },
    riskAcknowledgement: {
      onStatusChange: () => {},
      warning: { type: 'liquidation-warning-withdraw' },
    },
    actionsContext: {
      marketInfo: getMockMarketInfo(),
    },
  },
}

export default meta
type Story = StoryObj<typeof WithdrawView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
