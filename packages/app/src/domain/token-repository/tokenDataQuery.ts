import { TokenConfig } from '@/config/chain/types'
import { assert } from '@sparkdotfi/common-universal'
import { queryOptions } from '@tanstack/react-query'
import { Address } from 'viem'
import { Config } from 'wagmi'
import { TokenWithBalance } from '../common/types'
import { Token } from '../types/Token'
import { getBalancesQueryKeyPrefix } from '../wallet/getBalancesQueryKeyPrefix'
import { createAssetDataFetcher } from './createAssetDataFetcher'
import { createOraclePriceFetcher } from './createOraclePriceFetcher'

interface TokensParams {
  tokenConfig: TokenConfig
  wagmiConfig: Config
  chainId: number
  account?: Address
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function tokenDataQueryOptions({ tokenConfig, wagmiConfig, chainId, account }: TokensParams) {
  return queryOptions<TokenWithBalance>({
    queryKey: tokenDataQueryKey({ tokenConfig, account, chainId }),
    queryFn: async () => {
      const getOraclePrice = createOraclePriceFetcher({ tokenConfig, wagmiConfig, chainId })
      const getAssetData = createAssetDataFetcher({ tokenConfig, wagmiConfig, chainId, account })

      const [assetData, oraclePrice] = await Promise.all([getAssetData(), getOraclePrice()])

      assert(
        assetData.symbol === tokenConfig.symbol,
        `Token symbol mismatch: expected ${tokenConfig.symbol}, got ${assetData.symbol} (chainId: ${chainId})`,
      )

      const token = new Token({
        name: assetData.name,
        decimals: assetData.decimals,
        address: tokenConfig.address,
        symbol: assetData.symbol,
        unitPriceUsd: oraclePrice.toFixed(),
      })

      return { token, balance: assetData.balance }
    },
  })
}

export function tokenDataQueryKey({ tokenConfig, account, chainId }: Omit<TokensParams, 'wagmiConfig'>): unknown[] {
  return [...getBalancesQueryKeyPrefix({ account, chainId }), 'token', tokenConfig.address]
}
