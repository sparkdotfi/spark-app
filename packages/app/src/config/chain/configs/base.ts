import { usdcVaultAddress } from '@/config/contracts-generated'
import {
  baseSusdcMyEarningsQueryOptions,
  baseSusdsMyEarningsQueryOptions,
} from '@/domain/savings-charts/my-earnings-query/base'
import { baseSusdsSavingsRateQueryOptions } from '@/domain/savings-charts/savings-rate-query/base'
import { ssrAuthOracleConverterQueryOptions } from '@/domain/savings-converters/ssrAuthOracleConverter'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { assets } from '@/ui/assets'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { base } from 'viem/chains'
import { USDC_ACCOUNT_ENABLED } from '../flags'
import { ChainConfigEntry } from '../types'
import { defineToken } from '../utils/defineToken'

const usdc = defineToken({
  address: CheckedAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('USDC'),
})

const susds = defineToken({
  address: CheckedAddress('0x5875eEE11Cf8398102FdAd704C9E96607675467a'),
  oracleType: 'ssr-auth-oracle',
  symbol: TokenSymbol('sUSDS'),
})

const usds = defineToken({
  address: CheckedAddress('0x820C137fa70C8691f0e44Dc420a5e53c168921Dc'),
  oracleType: 'fixed-usd',
  symbol: TokenSymbol('USDS'),
})

const susdc = defineToken({
  address: CheckedAddress(usdcVaultAddress[base.id]),
  oracleType: 'vault',
  assetsDecimals: 6,
  symbol: TokenSymbol('sUSDC'),
})

export const baseConfig: ChainConfigEntry = {
  originChainId: base.id,
  daiSymbol: undefined,
  sdaiSymbol: undefined,
  usdsSymbol: usds.symbol,
  susdsSymbol: susds.symbol,
  meta: {
    name: 'Base',
    logo: assets.chain.base,
  },
  tokensWithMalformedApprove: [],
  permitSupport: {},
  airdrop: {},
  markets: undefined,
  savings: {
    accounts: [
      ...(USDC_ACCOUNT_ENABLED
        ? [
            {
              savingsToken: susdc.symbol,
              underlyingToken: usdc.symbol,
              supportedStablecoins: [usdc.symbol],
              fetchConverterQuery: ssrAuthOracleConverterQueryOptions,
              savingsRateQueryOptions: baseSusdsSavingsRateQueryOptions,
              myEarningsQueryOptions: baseSusdcMyEarningsQueryOptions,
            },
          ]
        : []),
      {
        savingsToken: susds.symbol,
        underlyingToken: usds.symbol,
        supportedStablecoins: [usds.symbol, usdc.symbol],
        fetchConverterQuery: ssrAuthOracleConverterQueryOptions,
        savingsRateQueryOptions: baseSusdsSavingsRateQueryOptions,
        myEarningsQueryOptions: baseSusdsMyEarningsQueryOptions,
      },
    ],
    psmStables: [usdc.symbol, usds.symbol],
  },
  farms: undefined,
  sparkToken: undefined,
  definedTokens: [usds, usdc, susds, susdc],
}
