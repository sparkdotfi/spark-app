import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { Token } from '../types/Token'

import { OracleFeedProvider } from '@/config/chain/types'
import { CheckedAddress } from '@marsfoundation/common-universal'
import { TokenSymbol } from '../types/TokenSymbol'

export interface OracleInfoBase {
  chainId: number
  price: NormalizedUnitNumber
  priceOracleAddress: CheckedAddress
  token: Token
}

export interface MarketPriceOracleInfo extends OracleInfoBase {
  type: 'market-price'
  providedBy: OracleFeedProvider[]
}

export interface YieldingFixedOracleInfo extends OracleInfoBase {
  type: 'yielding-fixed'
  ratio: NormalizedUnitNumber
  ratioSourceOracle: CheckedAddress
  baseAssetOracle: CheckedAddress
  baseAssetPrice: NormalizedUnitNumber
  baseAssetSymbol: TokenSymbol
  providedBy: OracleFeedProvider[]
}

export interface FixedOracleInfo extends OracleInfoBase {
  type: 'fixed'
}

export interface UnderlyingAssetOracleInfo extends OracleInfoBase {
  type: 'underlying-asset'
  asset: string
  providedBy?: OracleFeedProvider[]
}

export interface UnknownOracleInfo extends OracleInfoBase {
  type: 'unknown'
}

export type OracleInfo =
  | MarketPriceOracleInfo
  | YieldingFixedOracleInfo
  | FixedOracleInfo
  | UnderlyingAssetOracleInfo
  | UnknownOracleInfo
