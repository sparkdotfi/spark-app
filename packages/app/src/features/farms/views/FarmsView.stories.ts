import { AssetsGroup } from '@/config/chain/types'
import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { mainnet } from 'viem/chains'
import { FarmsView, FarmsViewProps } from './FarmsView'

const entryAssetsGroup: AssetsGroup = {
  type: 'stablecoins',
  name: 'Stablecoins',
  assets: [tokens.DAI.symbol, tokens.sDAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol, tokens.sUSDS.symbol],
}

const inactiveFarms = [
  {
    apy: Percentage(0.051),
    staked: NormalizedUnitNumber(0),
    rewardToken: tokens.wstETH,
    stakingToken: tokens.DAI,
    detailsLink: 'farm-details/1/0x1234567890123456789012345678901234567890',
    entryAssetsGroup,
    isPointsFarm: false,
  },
  {
    apy: Percentage(0),
    staked: NormalizedUnitNumber(0),
    rewardToken: tokens.CLE,
    stakingToken: tokens.USDS,
    detailsLink: 'farm-details/1/0x1234567890123456789012345678901234567891',
    entryAssetsGroup,
    isPointsFarm: true,
  },
] satisfies FarmsViewProps['inactiveFarms']

const activeFarms = [
  {
    apy: Percentage(0.034),
    staked: NormalizedUnitNumber(100),
    rewardToken: tokens.weETH,
    stakingToken: tokens.USDS,
    detailsLink: 'farm-details/1/0x1234567890123456789012345678901234567892',
    entryAssetsGroup,
    isPointsFarm: false,
  },
] satisfies FarmsViewProps['activeFarms']

const meta: Meta<typeof FarmsView> = {
  title: 'Features/Farms/Views/FarmsView',
  component: FarmsView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithTooltipProvider(), withRouter],
  args: {
    inactiveFarms,
    activeFarms,
    chainId: mainnet.id,
  },
}

export default meta
type Story = StoryObj<typeof FarmsView>

export const Desktop: Story = {}
export const Mobile: Story = getMobileStory(Desktop)
export const Tablet: Story = getTabletStory(Desktop)

export const NoApiData: Story = {
  args: {
    inactiveFarms: inactiveFarms.map((farm) => ({
      ...farm,
      apy: undefined,
    })),
    activeFarms: activeFarms.map((farm) => ({
      ...farm,
      apy: undefined,
    })),
    chainId: 1,
  },
}

export const NoApiDataMobile = getMobileStory(NoApiData)
export const NoApiDataTablet = getTabletStory(NoApiData)
