import { getChainConfigEntry } from '@/config/chain'
import { NormalizedUnitNumber, assertNever } from '@marsfoundation/common-universal'
import { queryOptions } from '@tanstack/react-query'
import { Config } from 'wagmi'
import { MarketInfo, Reserve } from '../market-info/marketInfo'
import { OracleInfo, OracleInfoBase } from './types'

interface OracleQueryParams {
  reserve: Reserve
  marketInfo: MarketInfo
  wagmiConfig: Config
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function oracleQueryOptions({ reserve, marketInfo, wagmiConfig }: OracleQueryParams) {
  return queryOptions<OracleInfo>({
    queryKey: oracleInfoQueryKey({ reserve, marketInfo }),
    queryFn: async () => {
      const oracleConfig = getChainConfigEntry(marketInfo.chainId).markets?.oracles[reserve.token.symbol]

      const oracleInfoBase: OracleInfoBase = {
        token: reserve.token,
        price: NormalizedUnitNumber(reserve.priceInUSD),
        priceOracleAddress: reserve.priceOracle,
        chainId: marketInfo.chainId,
      }

      if (!oracleConfig) {
        return {
          ...oracleInfoBase,
          type: 'unknown',
        }
      }

      switch (oracleConfig.type) {
        case 'market-price': {
          return {
            ...oracleInfoBase,
            providedBy: oracleConfig.providedBy,
            type: oracleConfig.type,
          }
        }

        case 'fixed': {
          return {
            ...oracleInfoBase,
            type: oracleConfig.type,
          }
        }

        case 'underlying-asset': {
          return {
            ...oracleInfoBase,
            providedBy: oracleConfig.providedBy,
            asset: oracleConfig.asset,
            type: oracleConfig.type,
          }
        }

        case 'yielding-fixed': {
          const { ratio, ratioSourceOracle, baseAssetOracle, baseAssetPrice } = await oracleConfig.oracleFetcher({
            reserve,
            wagmiConfig,
          })

          return {
            ...oracleInfoBase,
            ratio,
            ratioSourceOracle,
            baseAssetOracle,
            baseAssetPrice,
            type: oracleConfig.type,
            baseAssetSymbol: oracleConfig.baseAssetSymbol,
            providedBy: oracleConfig.providedBy,
          }
        }

        default:
          assertNever(oracleConfig)
      }
    },
  })
}

export function oracleInfoQueryKey({ marketInfo, reserve }: Omit<OracleQueryParams, 'wagmiConfig'>): unknown[] {
  return ['oracle', marketInfo.chainId, reserve.token.address]
}
