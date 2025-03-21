import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { MarketPriceOracleInfo, YieldingFixedOracleInfo } from '@/domain/oracles/types'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { CheckedAddress } from '@marsfoundation/common-universal'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { withRouter } from 'storybook-addon-remix-react-router'
import { OraclePanel } from './OraclePanel'

const meta: Meta<typeof OraclePanel> = {
  title: 'Features/MarketDetails/Components/OraclePanel',
  component: OraclePanel,
  decorators: [WithTooltipProvider(), ZeroAllowanceWagmiDecorator(), WithClassname('max-w-2xl'), withRouter],
  args: {
    isLoading: false,
    error: undefined,
  },
}

export default meta
type Story = StoryObj<typeof OraclePanel>

export const FixedDesktop: Story = {
  args: {
    data: {
      type: 'fixed',
      token: tokens.DAI,
      price: NormalizedUnitNumber(1),
      chainId: 1,
      priceOracleAddress: CheckedAddress('0x1234567890123456789012345678901234567890'),
    },
  },
}
export const FixedMobile = getMobileStory(FixedDesktop)
export const FixedTablet = getTabletStory(FixedDesktop)

const marketPriceData: MarketPriceOracleInfo = {
  type: 'market-price',
  providedBy: ['chainlink'],
  token: tokens.WETH,
  price: NormalizedUnitNumber(2235.0672),
  chainId: 1,
  priceOracleAddress: CheckedAddress('0x1234567890123456789012345678901234567890'),
}
export const MarketPriceDesktop: Story = {
  args: {
    data: marketPriceData,
  },
}
export const MarketPriceRedundantDesktop: Story = {
  args: {
    data: {
      ...marketPriceData,
      providedBy: ['chainlink', 'chronicle', 'redstone'],
    },
  },
}
export const MarketPriceMobile = getMobileStory(MarketPriceDesktop)
export const MarketPriceTablet = getTabletStory(MarketPriceDesktop)

export const UnderlyingAssetDesktop: Story = {
  args: {
    data: {
      type: 'underlying-asset',
      asset: 'EUR (FIAT)',
      token: tokens.EURe,
      price: NormalizedUnitNumber(1.24),
      chainId: 1,
      priceOracleAddress: CheckedAddress('0x1234567890123456789012345678901234567890'),
      providedBy: ['chainlink', 'chronicle', 'redstone'],
    },
  },
}
export const UnderlyingAssetMobile = getMobileStory(UnderlyingAssetDesktop)
export const UnderlyingAssetTablet = getTabletStory(UnderlyingAssetDesktop)

const yieldingFixedData: YieldingFixedOracleInfo = {
  type: 'yielding-fixed',
  baseAssetSymbol: TokenSymbol('ETH'),
  providedBy: ['chainlink'],
  ratio: NormalizedUnitNumber(2.137),
  ratioSourceOracle: CheckedAddress(tokens.weETH.address),
  price: NormalizedUnitNumber(4776.34),
  token: tokens.weETH,
  chainId: 1,
  priceOracleAddress: CheckedAddress('0x28897036f8459bFBa886083dD6b4Ce4d2f14a57F'),
  baseAssetOracle: CheckedAddress('0xb20A1374EfCaFa32F701Ab14316fA2E5b3400eD5'),
  baseAssetPrice: tokens.WETH.unitPriceUsd,
}

export const YieldingFixedDesktop: Story = {
  args: {
    data: yieldingFixedData,
  },
}
export const YieldingFixedRedundantDesktop: Story = {
  args: {
    data: {
      ...yieldingFixedData,
      providedBy: ['chainlink', 'chronicle', 'redstone'],
    },
  },
}
export const YieldingFixedMobile = getMobileStory(YieldingFixedDesktop)
export const YieldingFixedTablet = getTabletStory(YieldingFixedDesktop)

export const UnknownDesktop: Story = {
  args: {
    data: {
      type: 'unknown',
      price: NormalizedUnitNumber(1.06),
      token: tokens.sDAI,
      chainId: 1,
      priceOracleAddress: CheckedAddress('0x1234567890123456789012345678901234567890'),
    },
  },
}

export const UnknownMobile = getMobileStory(UnknownDesktop)
export const UnknownTablet = getTabletStory(UnknownDesktop)

export const LoadingDesktop: Story = {
  args: {
    data: undefined,
    isLoading: true,
  },
}
