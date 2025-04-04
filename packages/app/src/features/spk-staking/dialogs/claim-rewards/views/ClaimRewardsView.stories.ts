import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { encodeFunctionResult } from 'viem'

import { Hex, NormalizedNumber } from '@sparkdotfi/common-universal'

import { testStakingRewardsAbi } from '@/config/contracts-generated'
import { ClaimRewardsView, ClaimRewardsViewProps } from './ClaimRewardsView'

const meta: Meta<typeof ClaimRewardsView> = {
  title: 'Features/SpkStaking/Dialogs/Views/ClaimRewards',
  component: ClaimRewardsView,
  decorators: [
    ZeroAllowanceWagmiDecorator({
      requestFnOverride: async () => {
        return encodeFunctionResult({
          abi: testStakingRewardsAbi,
          functionName: 'claim',
          result: 0n,
        })
      },
    }),
    WithTooltipProvider(),
    WithClassname('max-w-xl'),
  ],
  args: {
    objectives: [
      {
        type: 'claimSparkRewards',
        source: 'spark-staking',
        token: tokens.USDS,
        epoch: 1,
        cumulativeAmount: NormalizedNumber(1000),
        merkleRoot: Hex.random(),
        merkleProof: Array.from({ length: 7 }, () => Hex.random()),
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    rewardToken: tokens.USDS,
    rewardAmount: NormalizedNumber(1000),
  } satisfies ClaimRewardsViewProps,
}

export default meta
type Story = StoryObj<typeof ClaimRewardsView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
