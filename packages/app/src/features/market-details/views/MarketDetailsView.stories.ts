import { WithDevContainer, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { MarketDetailsView } from './MarketDetailsView'
import { MarketDetailsViewProps } from './types'

const meta: Meta<typeof MarketDetailsView> = {
  title: 'Features/MarketDetails/Views/MarketDetailsView',
  component: MarketDetailsView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithTooltipProvider(), WithDevContainer(), withRouter],
}

export default meta
type Story = StoryObj<typeof MarketDetailsView>

const args: MarketDetailsViewProps = {
  token: tokens.rETH,
  aToken: tokens.rETH.createAToken(CheckedAddress('0x9985dF20D7e9103ECBCeb16a84956434B6f06ae8')),
  variableDebtTokenAddress: CheckedAddress('0xBa2C8F2eA5B56690bFb8b709438F049e5Dd76B96'),
  chainName: 'Ethereum Mainnet',
  chainId: 1,
  chainMismatch: false,
  walletOverview: {
    guestMode: false,
    token: tokens.rETH,
    tokenBalance: NormalizedUnitNumber(10),
    deposit: {
      token: tokens.rETH,
      available: NormalizedUnitNumber(10),
    },
    borrow: {
      token: tokens.rETH,
      eligibility: 'yes',
      available: NormalizedUnitNumber(10),
    },
  },
  marketOverview: {
    supply: {
      hasSparkAirdrop: true,
      status: 'yes',
      totalSupplied: NormalizedUnitNumber(72_000),
      supplyCap: NormalizedUnitNumber(112_000),
      apy: Percentage(0.05),
      capAutomatorInfo: undefined,
      sparkRewards: [],
    },
    collateral: {
      status: 'yes',
      token: tokens.rETH,
      maxLtv: Percentage(0.8),
      liquidationThreshold: Percentage(0.825),
      liquidationPenalty: Percentage(0.05),
    },
    borrow: {
      hasSparkAirdrop: true,
      status: 'yes',
      totalBorrowed: NormalizedUnitNumber(1244),
      apy: Percentage(0.01),
      borrowCap: NormalizedUnitNumber(2244),
      borrowLiquidity: NormalizedUnitNumber(1244),
      limitedByBorrowCap: true,
      reserveFactor: Percentage(0.05),
      chartProps: {
        optimalUtilizationRate: Percentage('0.45'),
        utilizationRate: Percentage('0.08'),
        variableRateSlope1: bigNumberify('45000000000000000000000000'),
        variableRateSlope2: bigNumberify('800000000000000000000000000'),
        baseVariableBorrowRate: bigNumberify('2500000000000000000000000'),
      },
      capAutomatorInfo: undefined,
      sparkRewards: [],
    },

    summary: {
      type: 'default',
      marketSize: NormalizedUnitNumber(1_243_000_000),
      borrowed: NormalizedUnitNumber(823_000_000),
      available: NormalizedUnitNumber(420_000_000),
      utilizationRate: Percentage(0.66),
    },
  },
  openConnectModal: () => {},
  openDialog: () => {},
  openSandboxModal: () => {},
  oracleInfo: {
    isLoading: false,
    error: null,
    data: {
      chainId: 1,
      priceOracleAddress: tokens.rETH.address,
      ratio: NormalizedUnitNumber(1.1),
      ratioSourceOracle: CheckedAddress(tokens.rETH.address),
      token: tokens.rETH,
      price: NormalizedUnitNumber(tokens.rETH.unitPriceUsd.times(1.1)),
      baseAssetPrice: NormalizedUnitNumber(tokens.WETH.unitPriceUsd),
      type: 'yielding-fixed',
      baseAssetSymbol: TokenSymbol('WETH'),
      providedBy: ['chainlink'],
      baseAssetOracle: CheckedAddress('0x69115a2826Eb47FE9DFD1d5CA8D8642697c8b68A'),
    },
  },
}

export const Desktop: Story = {
  args,
}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const DesktopChainMismatch: Story = {
  args: {
    ...args,
    chainMismatch: true,
  },
}

export const MobileChainMismatch = getMobileStory(DesktopChainMismatch)
export const TabletChainMismatch = getTabletStory(DesktopChainMismatch)
