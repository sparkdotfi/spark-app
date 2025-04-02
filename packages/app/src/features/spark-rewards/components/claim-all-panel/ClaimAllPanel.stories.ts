import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { mainnet } from 'viem/chains'
import { ClaimAllPanel } from './ClaimAllPanel'

const meta: Meta<typeof ClaimAllPanel> = {
  title: 'Features/SparkRewards/Components/ClaimAllPanel',
  component: ClaimAllPanel,
  decorators: [WithTooltipProvider(), WithClassname('max-w-[425px]')],
  args: {
    selectNetwork: () => {},
    claimableRewardsSummaryResult: {
      isPending: false,
      isError: false,
      error: null,
      data: {
        usdSum: NormalizedNumber(144.46),
        isClaimEnabled: true,
        claimableRewardsWithPrice: [
          {
            token: tokens.wstETH,
            amountPending: NormalizedNumber(0.01),
            amountToClaim: NormalizedNumber(0.02),
            chainId: mainnet.id,
          },
          {
            token: tokens.sUSDS,
            amountPending: NormalizedNumber(23),
            amountToClaim: NormalizedNumber(97),
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedNumber(122),
            amountToClaim: NormalizedNumber(1721),
            chainId: mainnet.id,
          },
        ],
        claimAll: () => {},
        chainId: mainnet.id,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ClaimAllPanel>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const Pending: Story = {
  args: {
    claimableRewardsSummaryResult: {
      isPending: true,
      isError: false,
      error: null,
      data: undefined,
    },
  },
}

export const ErrorState: Story = {
  args: {
    claimableRewardsSummaryResult: {
      isPending: false,
      isError: true,
      error: new Error('Failed to load claimable rewards data'),
      data: undefined,
    },
  },
}

export const OneTokenWithoutPrice: Story = {
  args: {
    claimableRewardsSummaryResult: {
      isPending: false,
      isError: false,
      error: null,
      data: {
        usdSum: NormalizedNumber.ZERO,
        isClaimEnabled: true,
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedNumber(1232),
            amountToClaim: NormalizedNumber(1721),
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithPrice: [],
        claimAll: () => {},
        chainId: mainnet.id,
      },
    },
  },
}
export const TwoTokensWithoutPrice: Story = {
  args: {
    claimableRewardsSummaryResult: {
      isPending: false,
      isError: false,
      error: null,
      data: {
        usdSum: NormalizedNumber.ZERO,
        isClaimEnabled: true,
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedNumber(1232),
            amountToClaim: NormalizedNumber(1721),
            chainId: mainnet.id,
          },
          {
            token: tokens.ABC,
            amountPending: NormalizedNumber(12),
            amountToClaim: NormalizedNumber(243),
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithPrice: [],
        claimAll: () => {},
        chainId: mainnet.id,
      },
    },
  },
}

export const NothingToClaim: Story = {
  args: {
    claimableRewardsSummaryResult: {
      isPending: false,
      isError: false,
      error: null,
      data: {
        usdSum: NormalizedNumber.ZERO,
        isClaimEnabled: false,
        claimableRewardsWithPrice: [
          {
            token: tokens.wstETH,
            amountPending: NormalizedNumber.ZERO,
            amountToClaim: NormalizedNumber.ZERO,
            chainId: mainnet.id,
          },
          {
            token: tokens.sUSDS,
            amountPending: NormalizedNumber.ZERO,
            amountToClaim: NormalizedNumber.ZERO,
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedNumber.ZERO,
            amountToClaim: NormalizedNumber.ZERO,
            chainId: mainnet.id,
          },
        ],
        claimAll: () => {},
        chainId: mainnet.id,
      },
    },
  },
}
