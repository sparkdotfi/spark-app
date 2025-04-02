import { testSpkStakingAbi } from '@/config/contracts-generated'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { encodeFunctionResult } from 'viem'
import { UnstakeView, UnstakeViewProps } from './UnstakeView'

const meta: Meta<typeof UnstakeView> = {
  title: 'Features/SpkStaking/Dialogs/Views/Unstake',
  render: (args) => {
    const form = useForm({
      defaultValues: {
        symbol: tokens.SPK.symbol,
        value: '100',
      },
    }) as any
    return <UnstakeView {...args} form={form} />
  },
  decorators: [
    ZeroAllowanceWagmiDecorator({
      requestFnOverride: async () => {
        return encodeFunctionResult({
          abi: testSpkStakingAbi,
          functionName: 'withdraw',
          result: [0n, 0n],
        })
      },
    }),
    WithClassname('max-w-xl'),
    WithTooltipProvider(),
  ],
  args: {
    selectableAssets: [
      {
        token: tokens.SPK,
        balance: NormalizedUnitNumber(50000),
      },
    ],
    assetsFields: {
      selectedAsset: {
        token: tokens.SPK,
        balance: NormalizedUnitNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedUnitNumber(50000),
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'unstakeSpk',
        spk: tokens.SPK,
        amount: NormalizedUnitNumber(100),
        accountActiveShares: NormalizedUnitNumber(100).toBaseUnit(18),
        unstakeAll: false,
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      status: 'success',
      apyBefore: Percentage(0.05),
      apyAfter: Percentage(0),
      claimableOn: new Date('2025-03-21T12:34:35.000Z'),
    },
  } satisfies Omit<UnstakeViewProps, 'form'>,
}

export default meta
type Story = StoryObj<typeof UnstakeView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const EmptyInput: Story = {
  render: (args) => {
    const form = useForm({
      defaultValues: {
        symbol: tokens.SPK.symbol,
        value: '',
      },
    }) as any
    return <UnstakeView {...args} form={form} />
  },
  args: {
    pageStatus: {
      state: 'form',
      actionsEnabled: false,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      status: 'no-overview',
    },
    objectives: [
      {
        type: 'unstakeSpk',
        spk: tokens.SPK,
        amount: NormalizedUnitNumber(0),
        accountActiveShares: NormalizedUnitNumber(100).toBaseUnit(18),
        unstakeAll: false,
      },
    ],
  },
}
