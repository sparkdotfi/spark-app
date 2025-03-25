import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { raise } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { userEvent } from '@storybook/test'
import { within } from '@storybook/test'
import { arbitrum, base, mainnet } from 'viem/chains'
import { OngoingCampaignRow } from '../../types'
import { OngoingCampaignsPanel } from './OngoingCampaignsPanel'

const meta: Meta<typeof OngoingCampaignsPanel> = {
  title: 'Features/SparkRewards/Components/OngoingCampaignsPanel',
  decorators: [WithClassname('max-w-4xl'), WithTooltipProvider()],
  component: OngoingCampaignsPanel,
}

export default meta
type Story = StoryObj<typeof OngoingCampaignsPanel>

const data: OngoingCampaignRow[] = [
  {
    id: '1',
    type: 'social',
    rewardChainId: mainnet.id,
    platform: 'x',
    link: 'https://x.com/marsfoundation',
    shortDescription: 'Follow us on X/Twitter and get SPK tokens',
    longDescription:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rewardTokenSymbol: tokens.SPK.symbol,
    involvedTokensSymbols: [],
    restrictedCountryCodes: ['US'],
    onEngageButtonClick: () => {},
  },
  {
    id: '2',
    type: 'sparklend',
    rewardChainId: mainnet.id,
    chainId: arbitrum.id,
    shortDescription: 'Deposit wstETH, Borrow USDS or USDC on Arbitrum. Get SKY tokens. Limited time offer.',
    longDescription:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    rewardTokenSymbol: tokens.SKY.symbol,
    involvedTokensSymbols: [tokens.wstETH.symbol, tokens.USDS.symbol],
    restrictedCountryCodes: ['US'],
    onEngageButtonClick: () => {},
  },
  {
    id: '3',
    type: 'sparklend',
    rewardChainId: mainnet.id,
    chainId: mainnet.id,
    shortDescription: 'Borrow USDS and get RED airdrop',
    longDescription:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rewardTokenSymbol: tokens.RED.symbol,
    involvedTokensSymbols: [tokens.USDS.symbol],
    restrictedCountryCodes: ['US'],
    onEngageButtonClick: () => {},
  },
  {
    id: '4',
    type: 'savings',
    rewardChainId: mainnet.id,
    chainId: base.id,
    shortDescription: 'Deposit USDS and get SPK tokens',
    longDescription:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rewardTokenSymbol: tokens.SPK.symbol,
    involvedTokensSymbols: [tokens.sUSDS.symbol],
    restrictedCountryCodes: ['US'],
    onEngageButtonClick: () => {},
  },
  {
    id: '5',
    type: 'external',
    rewardChainId: mainnet.id,
    link: 'https://www.google.com',
    shortDescription: 'Search the web and get SPK tokens',
    longDescription:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    rewardTokenSymbol: tokens.SPK.symbol,
    involvedTokensSymbols: [],
    restrictedCountryCodes: ['US'],
    onEngageButtonClick: () => {},
  },
]

const args: Story['args'] = {
  ongoingCampaignsResult: {
    data: data.map((campaign) => ({
      ...campaign,
      onEngageButtonClick: () => Promise.resolve(),
    })),
    isPending: false,
    isError: false,
    error: null,
  },
  isGuestMode: false,
}

export const Desktop: Story = {
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const items = await canvas.findAllByRole('button')
    const firstItem = items[0] ?? raise('No accordion item found')
    await userEvent.click(firstItem)
  },
}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const NoCampaigns: Story = {
  args: {
    ...args,
    ongoingCampaignsResult: { data: [], isPending: false, isError: false, error: null },
  },
}
export const NoCampaignsMobile = getMobileStory(NoCampaigns)
export const NoCampaignsTablet = getTabletStory(NoCampaigns)

export const Pending: Story = {
  args: {
    ...args,
    ongoingCampaignsResult: { data: undefined, isPending: true, isError: false, error: null },
  },
}
export const PendingMobile = getMobileStory(Pending)
export const PendingTablet = getTabletStory(Pending)

export const ErrorState: Story = {
  args: {
    ...args,
    ongoingCampaignsResult: {
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Could not fetch rewards'),
    },
  },
}
export const ErrorStateMobile = getMobileStory(ErrorState)
export const ErrorStateTablet = getTabletStory(ErrorState)

export const GuestMode: Story = {
  args: {
    ...args,
    isGuestMode: true,
  },
}
export const GuestModeMobile = getMobileStory(GuestMode)
export const GuestModeTablet = getTabletStory(GuestMode)
