import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
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
        usdSum: NormalizedUnitNumber(144.46),
        isClaimEnabled: true,
        claimableRewardsWithPrice: [
          {
            token: tokens.wstETH,
            amountPending: NormalizedUnitNumber(0.01),
            amountToClaim: NormalizedUnitNumber(0.02),
            chainId: mainnet.id,
          },
          {
            token: tokens.sUSDS,
            amountPending: NormalizedUnitNumber(23),
            amountToClaim: NormalizedUnitNumber(97),
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedUnitNumber(122),
            amountToClaim: NormalizedUnitNumber(1721),
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
        usdSum: NormalizedUnitNumber(0),
        isClaimEnabled: true,
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedUnitNumber(1232),
            amountToClaim: NormalizedUnitNumber(1721),
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
        usdSum: NormalizedUnitNumber(0),
        isClaimEnabled: true,
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedUnitNumber(1232),
            amountToClaim: NormalizedUnitNumber(1721),
            chainId: mainnet.id,
          },
          {
            token: tokens.ABC,
            amountPending: NormalizedUnitNumber(12),
            amountToClaim: NormalizedUnitNumber(243),
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
        usdSum: NormalizedUnitNumber(0),
        isClaimEnabled: false,
        claimableRewardsWithPrice: [
          {
            token: tokens.wstETH,
            amountPending: NormalizedUnitNumber(0),
            amountToClaim: NormalizedUnitNumber(0),
            chainId: mainnet.id,
          },
          {
            token: tokens.sUSDS,
            amountPending: NormalizedUnitNumber(0),
            amountToClaim: NormalizedUnitNumber(0),
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedUnitNumber(0),
            amountToClaim: NormalizedUnitNumber(0),
            chainId: mainnet.id,
          },
        ],
        claimAll: () => {},
        chainId: mainnet.id,
      },
    },
  },
}
