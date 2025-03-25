import { usdcVaultAddress } from '@/config/contracts-generated'
import {
  arbitrumSusdcMyEarningsQueryOptions,
  arbitrumSusdsMyEarningsQueryOptions,
} from '@/domain/savings-charts/my-earnings-query/arbitrum'
import {
  arbitrumSusdcSavingsRateQueryOptions,
  arbitrumSusdsSavingsRateQueryOptions,
} from '@/domain/savings-charts/savings-rate-query/arbitrum'
import { ssrAuthOracleConverterQueryOptions } from '@/domain/savings-converters/ssrAuthOracleConverter'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets } from '@/ui/assets'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { arbitrum } from 'viem/chains'
import { USDC_ACCOUNT_ENABLED } from '../flags'
import { ChainConfigEntry } from '../types'
import { defineToken } from '../utils/defineToken'

const usdc = defineToken({
  address: CheckedAddress('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('USDC'),
})

const susdc = defineToken({
  address: CheckedAddress(usdcVaultAddress[arbitrum.id]),
  oracleType: 'vault',
  assetsDecimals: 6,
  symbol: TokenSymbol('sUSDC'),
})

const usds = defineToken({
  address: CheckedAddress('0x6491c05A82219b8D1479057361ff1654749b876b'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('USDS'),
})

const susds = defineToken({
  address: CheckedAddress('0xdDb46999F8891663a8F2828d25298f70416d7610'),
  oracleType: 'ssr-auth-oracle',
  symbol: TokenSymbol('sUSDS'),
})

export const arbitrumConfig: ChainConfigEntry = {
  originChainId: arbitrum.id,
  daiSymbol: undefined,
  sdaiSymbol: undefined,
  usdsSymbol: usds.symbol,
  susdsSymbol: susds.symbol,
  meta: {
    name: 'Arbitrum',
    logo: assets.chain.arbitrum,
  },
  tokensWithMalformedApprove: [],
  permitSupport: {},
  airdrop: {},
  markets: undefined,
  farms: undefined,
  savings: {
    accounts: [
      {
        savingsToken: susds.symbol,
        underlyingToken: usds.symbol,
        supportedStablecoins: [usds.symbol, usdc.symbol],
        fetchConverterQuery: ssrAuthOracleConverterQueryOptions,
        savingsRateQueryOptions: arbitrumSusdsSavingsRateQueryOptions,
        myEarningsQueryOptions: arbitrumSusdsMyEarningsQueryOptions,
      },
      ...(USDC_ACCOUNT_ENABLED
        ? [
            {
              savingsToken: susdc.symbol,
              underlyingToken: usdc.symbol,
              supportedStablecoins: [usdc.symbol],
              fetchConverterQuery: ssrAuthOracleConverterQueryOptions,
              savingsRateQueryOptions: arbitrumSusdcSavingsRateQueryOptions,
              myEarningsQueryOptions: arbitrumSusdcMyEarningsQueryOptions,
            },
          ]
        : []),
    ],
    psmStables: [usds.symbol, usdc.symbol],
  },
  sparkToken: undefined,
  definedTokens: [usdc, usds, susds, susdc],
}
