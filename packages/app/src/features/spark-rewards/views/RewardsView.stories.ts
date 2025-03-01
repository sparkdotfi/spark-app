import { NormalizedUnitNumber, Percentage } from '@marsfoundation/common-universal'
import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { mainnet } from 'viem/chains'
import { RewardsView, RewardsViewProps } from './RewardsView'

const meta: Meta<typeof RewardsView> = {
  title: 'Features/SparkRewards/Views/RewardsView',
  component: RewardsView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithTooltipProvider(), withRouter()],
  args: {
    ongoingCampaignsResult: {
      data: [
        {
          id: 'campaign-1',
          type: 'sparklend',
          chainId: mainnet.id,
          shortDescription: 'Early Bird Rewards',
          longDescription: 'Earn rewards for being an early adopter',
          rewardTokenSymbol: tokens.SPK.symbol,
          involvedTokensSymbols: [tokens.sUSDS.symbol],
          restrictedCountryCodes: [],
          apy: Percentage(0.1),
          engage: () => Promise.resolve(),
        },
        {
          id: 'campaign-2',
          type: 'social',
          chainId: mainnet.id,
          platform: 'x',
          link: 'https://x.com/marsfoundation',
          shortDescription: 'Social Media Rewards',
          longDescription: 'Earn rewards for social media engagement',
          rewardTokenSymbol: tokens.SPK.symbol,
          involvedTokensSymbols: [],
          restrictedCountryCodes: [],
          engage: () => Promise.resolve(),
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    },
    activeRewardsResult: {
      data: [
        {
          token: tokens.REDSTONE,
          amountPending: NormalizedUnitNumber(123.4323),
          amountToClaim: NormalizedUnitNumber(224_093.23423),
          openClaimDialog: () => {},
        },
        {
          token: tokens.SPK,
          amountPending: NormalizedUnitNumber(44_224.22),
          amountToClaim: NormalizedUnitNumber(12_213.21),
          openClaimDialog: () => {},
        },
        {
          token: tokens.USDS,
          amountPending: NormalizedUnitNumber(11.22),
          amountToClaim: NormalizedUnitNumber(0),
          openClaimDialog: () => {},
        },
      ],
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
    activeRewardsResult: {
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
    activeRewardsResult: {
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Failed to load active rewards'),
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

export const NoActiveRewards: Story = {
  args: {
    activeRewardsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
export const NoActiveRewardsMobile = getMobileStory(NoActiveRewards)
export const NoActiveRewardsTablet = getTabletStory(NoActiveRewards)

export const Nothing: Story = {
  args: {
    ongoingCampaignsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
    activeRewardsResult: {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
export const NothingMobile = getMobileStory(Nothing)
export const NothingTablet = getTabletStory(Nothing)
