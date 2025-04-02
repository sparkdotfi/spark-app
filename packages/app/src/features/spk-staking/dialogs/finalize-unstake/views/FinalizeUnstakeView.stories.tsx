import { testSpkStakingAbi } from '@/config/contracts-generated'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { encodeFunctionResult } from 'viem'
import { FinalizeUnstakeView, FinalizeUnstakeViewProps } from './FinalizeUnstakeView'

const meta: Meta<typeof FinalizeUnstakeView> = {
  title: 'Features/SpkStaking/Dialogs/Views/FinalizeUnstake',
  component: FinalizeUnstakeView,
  decorators: [
    ZeroAllowanceWagmiDecorator({
      requestFnOverride: async () => {
        return encodeFunctionResult({
          abi: testSpkStakingAbi,
          functionName: 'claimBatch',
          result: 0n,
        })
      },
    }),
    WithClassname('max-w-xl'),
    WithTooltipProvider(),
  ],
  args: {
    objectives: [
      {
        type: 'finalizeSpkUnstake',
        spk: tokens.SPK,
        amount: NormalizedNumber(100),
        epochs: [1, 2, 3, 4, 5],
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    spk: tokens.SPK,
    unstakeAmount: NormalizedNumber(100),
  } satisfies FinalizeUnstakeViewProps,
}

export default meta
type Story = StoryObj<typeof FinalizeUnstakeView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
