import { OracleInfoFetcherParams, OracleInfoFetcherResult } from '@/domain/oracles/oracleInfoFetchers'
import { MyEarningsResult } from '@/domain/savings-charts/my-earnings-query/types'
import { SavingsRateQueryResult } from '@/domain/savings-charts/savings-rate-query/query'
import { SavingsRateChartData } from '@/domain/savings-charts/savings-rate-query/types'
import { SavingsConverterQueryOptions, SavingsConverterQueryParams } from '@/domain/savings-converters/types'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { UseQueryOptions } from '@tanstack/react-query'
import { SUPPORTED_CHAIN_IDS } from './constants'

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export type MyEarningsQueryOptions = (
  wallet: CheckedAddress,
  chainId: number,
) => UseQueryOptions<any, any, MyEarningsResult>
export type SavingsRateQueryOptions = () => UseQueryOptions<SavingsRateQueryResult, Error, SavingsRateChartData>

export interface NativeAssetInfo {
  nativeAssetName: string
  nativeAssetSymbol: TokenSymbol
  wrappedNativeAssetSymbol: TokenSymbol
  wrappedNativeAssetAddress: CheckedAddress
  minRemainingNativeAssetBalance: NormalizedNumber
}

export interface ChainMeta {
  name: string
  logo: string
}

export type PermitSupport = Record<CheckedAddress, boolean>

export type TokensWithMalformedApprove = CheckedAddress[]

export type TokenSymbolToNameReplacement = Record<TokenSymbol, { name: string; symbol: TokenSymbol }>

export interface TokenToAirdropAmounts {
  [token: TokenSymbol]: {
    deposit?: NormalizedNumber
    borrow?: NormalizedNumber
  }
}

export interface AirdropsPerAction {
  deposit: TokenSymbol[]
  borrow: TokenSymbol[]
}
export type Airdrop = Record<TokenSymbol, AirdropsPerAction>

export type OracleFeedProvider = 'chainlink' | 'chronicle' | 'redstone'

export type ReserveOracleType =
  | { type: 'market-price'; providedBy: OracleFeedProvider[] }
  | {
      type: 'yielding-fixed'
      baseAssetSymbol: TokenSymbol
      providedBy: OracleFeedProvider[]
      oracleFetcher: (params: OracleInfoFetcherParams) => Promise<OracleInfoFetcherResult>
    }
  | { type: 'fixed' }
  | { type: 'underlying-asset'; asset: string; providedBy?: OracleFeedProvider[] }

export type SavingsConverterQuery = (args: SavingsConverterQueryParams) => SavingsConverterQueryOptions

export interface MarketsConfig {
  defaultAssetToBorrow: TokenSymbol
  highlightedTokensToBorrow: TokenSymbol[]
  nativeAssetInfo: NativeAssetInfo
  tokenSymbolToReplacedName: TokenSymbolToNameReplacement
  oracles: Record<TokenSymbol, ReserveOracleType>
}

export interface AccountConfig {
  supportedStablecoins: TokenSymbol[]
  savingsToken: TokenSymbol
  underlyingToken: TokenSymbol
  fetchConverterQuery: (args: SavingsConverterQueryParams) => SavingsConverterQueryOptions
  savingsRateQueryOptions: SavingsRateQueryOptions | undefined
  myEarningsQueryOptions: MyEarningsQueryOptions | undefined
}

export interface SavingsConfig {
  accounts: AccountConfig[]
  psmStables: TokenSymbol[] | undefined
}

export type AssetsGroup =
  | {
      type: 'stablecoins'
      name: 'Stablecoins'
      assets: TokenSymbol[]
    }
  | {
      type: 'governance'
      name: 'Governance Tokens'
      assets: TokenSymbol[]
    }

export type FarmConfig = {
  address: CheckedAddress
  entryAssetsGroup: AssetsGroup
  historyCutoff?: Date
} & (
  | {
      rewardType: 'token'
      rewardToken: TokenSymbol
    }
  | {
      rewardType: 'points'
      rewardPoints: Token
    }
)

export interface FarmsConfig {
  getFarmDetailsApiUrl: (address: CheckedAddress) => string
  configs: FarmConfig[]
}

export interface SparkTokenConfig {
  spkSymbol: TokenSymbol
  usdsSymbol: TokenSymbol
}

export interface ChainConfigEntry {
  originChainId: SupportedChainId
  daiSymbol: TokenSymbol | undefined
  sdaiSymbol: TokenSymbol | undefined
  usdsSymbol: TokenSymbol | undefined
  susdsSymbol: TokenSymbol | undefined
  meta: ChainMeta
  permitSupport: PermitSupport
  tokensWithMalformedApprove: TokensWithMalformedApprove
  airdrop: Airdrop
  markets: MarketsConfig | undefined
  savings: SavingsConfig | undefined
  farms: FarmsConfig | undefined
  sparkToken: SparkTokenConfig | undefined
  definedTokens: TokenConfig[]
}

export type ChainConfig = Record<SupportedChainId, ChainConfigEntry>

// @note: zero-price oracle is used for tokens for which we don't have a price feed yet
export type OracleType = 'fixed-usd' | 'vault' | 'zero-price' | 'ssr-auth-oracle'

export type TokenConfig = { symbol: TokenSymbol } & (
  | {
      address: CheckedAddress
      oracleType: Exclude<OracleType, 'vault'>
    }
  | {
      address: CheckedAddress
      oracleType: 'vault'
      sharesDecimals?: number
      assetsDecimals?: number
    }
)
