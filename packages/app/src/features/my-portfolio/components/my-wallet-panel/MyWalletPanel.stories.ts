import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

import { TokenWithBalance } from '@/domain/common/types'
import { MyWalletPanel } from './MyWalletPanel'

const meta: Meta<typeof MyWalletPanel> = {
  title: 'Features/MyPortfolio/Components/MyWalletPanel',
  component: MyWalletPanel,
  decorators: [WithClassname('max-w-[425px]'), WithTooltipProvider()],
  args: {
    includeDeposits: true,
    setIncludeDeposits: () => {},
  },
}

export default meta
type Story = StoryObj<typeof MyWalletPanel>

const assets: TokenWithBalance[] = [
  {
    token: tokens.ETH,
    balance: NormalizedUnitNumber(132.28),
  },
  {
    token: tokens.stETH,
    balance: NormalizedUnitNumber(48.32),
  },
  {
    token: tokens.USDC,
    balance: NormalizedUnitNumber(90000),
  },
  {
    token: tokens.WBTC,
    balance: NormalizedUnitNumber(2),
  },
  {
    token: tokens.sDAI,
    balance: NormalizedUnitNumber(50000),
  },
  {
    token: tokens.DAI,
    balance: NormalizedUnitNumber(50000),
  },
  {
    token: tokens.SKY,
    balance: NormalizedUnitNumber(15),
  },
  {
    token: tokens.USDT,
    balance: NormalizedUnitNumber(7000),
  },
]

export const Default: Story = {
  name: 'Normal',
  args: {
    assets: [...assets.slice(0, 4)],
  },
}
export const NormalMobile = getMobileStory(Default)
export const NormalTablet = getTabletStory(Default)

export const TwoAssets: Story = {
  name: 'Two Assets',
  args: {
    assets: [...assets.slice(4, 6)],
  },
}
export const TwoAssetsMobile = getMobileStory(TwoAssets)
export const TwoAssetsTablet = getTabletStory(TwoAssets)

export const EightAssets: Story = {
  name: 'Eight Assets',
  args: {
    assets,
  },
}
export const EightAssetsMobile = getMobileStory(EightAssets)
export const EightAssetsTablet = getTabletStory(EightAssets)

export const NoDeposits: Story = {
  name: 'No Deposits',
  args: {
    assets: [...assets.slice(4, 6)],
    includeDeposits: false,
    setIncludeDeposits: () => {},
  },
}
export const NoDepositsMobile = getMobileStory(NoDeposits)
export const NoDepositsTablet = getTabletStory(NoDeposits)

export const NoAssets: Story = {
  name: 'No Assets',
  args: {
    assets: [],
  },
}
export const NoAssetsMobile = getMobileStory(NoAssets)
export const NoAssetsTablet = getTabletStory(NoAssets)

export const OneAsset: Story = {
  name: 'One Asset',
  args: {
    assets: [assets[0]!],
  },
}
export const OneAssetMobile = getMobileStory(OneAsset)
export const OneAssetTablet = getTabletStory(OneAsset)
