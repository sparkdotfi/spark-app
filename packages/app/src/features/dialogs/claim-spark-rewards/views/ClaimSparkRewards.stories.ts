import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { encodeFunctionResult, zeroAddress } from 'viem'

import { Hex, NormalizedUnitNumber } from '@marsfoundation/common-universal'

import { incentiveControllerAbi } from '@/config/abis/incentiveControllerAbi'
import { mainnet } from 'viem/chains'
import { ClaimSparkRewardsView, ClaimSparkRewardsViewProps } from './ClaimSparkRewardsView'

const meta: Meta<typeof ClaimSparkRewardsView> = {
  title: 'Features/Dialogs/Views/ClaimSparkRewards',
  component: ClaimSparkRewardsView,
  decorators: [
    ZeroAllowanceWagmiDecorator({
      requestFnOverride: async () => {
        return encodeFunctionResult({
          abi: incentiveControllerAbi,
          functionName: 'claimAllRewards',
          result: [[zeroAddress], [0n]],
        })
      },
    }),
    WithTooltipProvider(),
    WithClassname('max-w-xl'),
  ],
  args: {
    chainId: mainnet.id,
    objectives: [
      {
        type: 'claimSparkRewards',
        source: 'campaigns',
        token: tokens.RED,
        epoch: 1,
        cumulativeAmount: NormalizedUnitNumber(1000),
        merkleRoot: Hex.random(),
        merkleProof: Array.from({ length: 7 }, () => Hex.random()),
      },
      {
        type: 'claimSparkRewards',
        source: 'campaigns',
        token: tokens.USDS,
        epoch: 1,
        cumulativeAmount: NormalizedUnitNumber(250),
        merkleRoot: Hex.random(),
        merkleProof: Array.from({ length: 7 }, () => Hex.random()),
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    claims: [
      {
        token: tokens.RED,
        amountToClaim: NormalizedUnitNumber(100),
      },
      {
        token: tokens.USDS,
        amountToClaim: NormalizedUnitNumber(1000),
      },
    ],
  } satisfies ClaimSparkRewardsViewProps,
}

export default meta
type Story = StoryObj<typeof ClaimSparkRewardsView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
