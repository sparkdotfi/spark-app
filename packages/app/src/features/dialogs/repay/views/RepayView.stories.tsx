import { getMockReserve } from '@/test/integration/constants'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { useForm } from 'react-hook-form'
import { RepayView } from './RepayView'

const meta: Meta<typeof RepayView> = {
  title: 'Features/Dialogs/Views/Repay',
  component: (args) => {
    const form = useForm() as any
    return <RepayView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    debtAsset: tokens.DAI,
    repayOptions: [
      {
        token: tokens.DAI,
        balance: NormalizedUnitNumber(50000),
      },
      {
        token: tokens.ETH,
        balance: NormalizedUnitNumber(10),
      },
    ],
    assetsToRepayFields: {
      selectedAsset: {
        token: tokens.DAI,
        balance: NormalizedUnitNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedUnitNumber(5000),
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'repay',
        reserve: getMockReserve({ token: tokens.DAI }),
        useAToken: false,
        value: NormalizedUnitNumber(2000),
        requiredApproval: NormalizedUnitNumber(2000),
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    currentPositionOverview: {
      healthFactor: BigNumber(4),
      debt: NormalizedUnitNumber(5000),
    },
    updatedPositionOverview: {
      healthFactor: BigNumber(2),
      debt: NormalizedUnitNumber(2000),
    },
  },
}

export default meta
type Story = StoryObj<typeof RepayView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
