import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { useForm } from 'react-hook-form'

import { DepositView } from './DepositView'

const meta: Meta<typeof DepositView> = {
  title: 'Features/Dialogs/Views/Deposit',
  component: (args) => {
    const form = useForm() as any
    return <DepositView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    initialToken: tokens.USDC,
    selectableAssets: [
      {
        token: tokens.USDC,
        balance: NormalizedUnitNumber(50000),
      },
      {
        token: tokens.ETH,
        balance: NormalizedUnitNumber(1),
      },
    ],
    assetsFields: {
      selectedAsset: {
        token: tokens.USDC,
        balance: NormalizedUnitNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedUnitNumber(5000),
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'deposit',
        token: tokens.USDC,
        value: NormalizedUnitNumber(50000),
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    currentPositionOverview: {
      healthFactor: new BigNumber(1.5),
      collateralization: 'enabled',
      supplyAPY: Percentage(0.04),
    },
    updatedPositionOverview: {
      healthFactor: new BigNumber(2.3),
      collateralization: 'enabled',
      supplyAPY: Percentage(0.04),
    },
  },
}

export default meta
type Story = StoryObj<typeof DepositView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
