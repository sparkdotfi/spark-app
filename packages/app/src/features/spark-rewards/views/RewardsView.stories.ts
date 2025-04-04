import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { arbitrum, mainnet } from 'viem/chains'
import { RewardsView, RewardsViewProps } from './RewardsView'

const meta: Meta<typeof RewardsView> = {
  title: 'Features/SparkRewards/Views/RewardsView',
  component: RewardsView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithTooltipProvider(), withRouter()],
  args: {
    selectNetwork: () => {},
    ongoingCampaignsResult: {
      data: [
        {
          id: 'campaign-1',
          type: 'sparklend',
          rewardChainId: mainnet.id,
          chainId: mainnet.id,
          shortDescription: 'Early Bird Rewards',
          longDescription: 'Earn rewards for being an early adopter',
          rewardTokenSymbol: tokens.SPK.symbol,
          involvedTokensSymbols: [tokens.sUSDS.symbol],
          restrictedCountryCodes: [],
          onEngageButtonClick: () => Promise.resolve(),
        },
        {
          id: 'campaign-2',
          type: 'social',
          rewardChainId: mainnet.id,
          platform: 'x',
          link: 'https://x.com/marsfoundation',
          shortDescription: 'Social Media Rewards',
          longDescription: 'Earn rewards for social media engagement',
          rewardTokenSymbol: tokens.SPK.symbol,
          involvedTokensSymbols: [],
          restrictedCountryCodes: [],
          onEngageButtonClick: () => Promise.resolve(),
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    },
    claimableRewardsResult: {
      data: [
        {
          token: tokens.RED,
          amountPending: NormalizedNumber(123.4323),
          amountToClaim: NormalizedNumber(224_093.23423),
          chainId: mainnet.id,
          actionName: 'Claim',
          action: () => {},
          isActionEnabled: true,
        },
        {
          token: tokens.SPK,
          amountPending: NormalizedNumber(44_224.22),
          amountToClaim: NormalizedNumber(12_213.21),
          chainId: mainnet.id,
          actionName: 'Claim',
          action: () => {},
          isActionEnabled: true,
        },
        {
          token: tokens.USDS,
          amountPending: NormalizedNumber(11.22),
          amountToClaim: NormalizedNumber.ZERO,
          chainId: arbitrum.id,
          actionName: 'Switch',
          action: () => {},
          isActionEnabled: true,
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    },
    claimableRewardsSummaryResult: {
      data: {
        usdSum: NormalizedNumber(1_465.59),
        isClaimEnabled: true,
        claimableRewardsWithPrice: [
          {
            token: tokens.SPK,
            amountPending: NormalizedNumber(44_224.22),
            amountToClaim: NormalizedNumber(12_213.21),
            chainId: mainnet.id,
          },
        ],
        claimableRewardsWithoutPrice: [
          {
            token: tokens.RED,
            amountPending: NormalizedNumber(123.4323),
            amountToClaim: NormalizedNumber(224_093.23423),
            chainId: mainnet.id,
          },
        ],
        claimAll: () => {},
        chainId: mainnet.id,
      },
      isPending: false,
      isError: false,
      error: null,
    },
  } satisfies RewardsViewProps,
}

export default meta
type Story = StoryObj<typeof RewardsView>

export const Desktop: Story = {}
export const Tablet = getTabletStory(Desktop)
export const Mobile = getMobileStory(Desktop)

export const Loading: Story = {
  args: {
    ongoingCampaignsResult: {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    },
    claimableRewardsResult: {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    },
    claimableRewardsSummaryResult: {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    },
  },
}
export const LoadingMobile = getMobileStory(Loading)
export const LoadingTablet = getTabletStory(Loading)

export const ErrorState: Story = {
  args: {
    ongoingCampaignsResult: {
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Failed to load campaigns'),
    },
    claimableRewardsResult: {
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Failed to load claimable rewards'),
    },
    claimableRewardsSummaryResult: {
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Failed to load claimable rewards'),
    },
  },
}
export const ErrorStateMobile = getMobileStory(ErrorState)
export const ErrorStateTablet = getTabletStory(ErrorState)

export const NoCampaigns: Story = {
  args: {
    ongoingCampaignsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
export const NoCampaignsMobile = getMobileStory(NoCampaigns)
export const NoCampaignsTablet = getTabletStory(NoCampaigns)

export const NoClaimableRewards: Story = {
  args: {
    claimableRewardsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
    claimableRewardsSummaryResult: {
      data: {
        usdSum: NormalizedNumber.ZERO,
        isClaimEnabled: false,
        claimableRewardsWithPrice: [],
        claimableRewardsWithoutPrice: [],
        chainId: mainnet.id,
        claimAll: () => {},
      },
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
export const NoClaimableRewardsMobile = getMobileStory(NoClaimableRewards)
export const NoClaimableRewardsTablet = getTabletStory(NoClaimableRewards)

export const ZeroAmounts: Story = {
  args: {
    claimableRewardsResult: {
      data: [
        {
          token: tokens.RED,
          amountPending: NormalizedNumber.ZERO,
          amountToClaim: NormalizedNumber.ZERO,
          chainId: mainnet.id,
          actionName: 'Claim',
          action: () => {},
          isActionEnabled: false,
        },
        {
          token: tokens.SPK,
          amountPending: NormalizedNumber.ZERO,
          amountToClaim: NormalizedNumber.ZERO,
          chainId: mainnet.id,
          actionName: 'Claim',
          action: () => {},
          isActionEnabled: false,
        },
        {
          token: tokens.USDS,
          amountPending: NormalizedNumber.ZERO,
          amountToClaim: NormalizedNumber.ZERO,
          chainId: arbitrum.id,
          actionName: 'Switch',
          action: () => {},
          isActionEnabled: true,
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    },
    claimableRewardsSummaryResult: {
      data: {
        usdSum: NormalizedNumber.ZERO,
        isClaimEnabled: false,
        claimableRewardsWithPrice: [
          {
            token: tokens.SPK,
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
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
export const ZeroAmountsMobile = getMobileStory(ZeroAmounts)
export const ZeroAmountsTablet = getTabletStory(ZeroAmounts)

export const Nothing: Story = {
  args: {
    ongoingCampaignsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
    claimableRewardsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
    claimableRewardsSummaryResult: {
      data: {
        usdSum: NormalizedNumber.ZERO,
        isClaimEnabled: false,
        claimableRewardsWithPrice: [],
        claimableRewardsWithoutPrice: [],
        chainId: mainnet.id,
        claimAll: () => {},
      },
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
export const NothingMobile = getMobileStory(Nothing)
export const NothingTablet = getTabletStory(Nothing)
