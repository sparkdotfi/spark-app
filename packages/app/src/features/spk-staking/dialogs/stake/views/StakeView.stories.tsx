import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { StakeView, StakeViewProps } from './StakeView'

const meta: Meta<typeof StakeView> = {
  title: 'Features/SpkStaking/Dialogs/Views/Stake',
  component: (args) => {
    const form = useForm() as any
    return <StakeView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
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
        type: 'stakeSpk',
        spk: tokens.SPK,
        amount: NormalizedUnitNumber(100),
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      status: 'success',
      apy: Percentage(0.05),
      usds: tokens.USDS,
      unstakingDelay: 804800, // more than a week
      rewardsPerYearUsd: NormalizedUnitNumber(542),
    },
  } satisfies Omit<StakeViewProps, 'form'>,
}

export default meta
type Story = StoryObj<typeof StakeView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
