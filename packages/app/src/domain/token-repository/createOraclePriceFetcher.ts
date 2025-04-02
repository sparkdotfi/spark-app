import { TokenConfig } from '@/config/chain/types'
import { ssrAuthOracleConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { fromRay } from '@/utils/math'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber, assertNever } from '@sparkdotfi/common-universal'
import { erc4626Abi, formatUnits, parseUnits } from 'viem'
import { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

export interface CreateOraclePriceFetcherParams {
  tokenConfig: TokenConfig
  wagmiConfig: Config
  chainId: number
}

export function createOraclePriceFetcher({
  tokenConfig,
  wagmiConfig,
  chainId,
}: CreateOraclePriceFetcherParams): () => Promise<NormalizedUnitNumber> {
  switch (tokenConfig.oracleType) {
    case 'zero-price':
      return async () => NormalizedUnitNumber.ZERO

    case 'fixed-usd':
      return async () => NormalizedUnitNumber(1)

    case 'vault':
      return async () => {
        const sharesDecimals = tokenConfig.sharesDecimals ?? 18
        const assetsDecimals = tokenConfig.assetsDecimals ?? 18

        const result = await readContract(wagmiConfig, {
          abi: erc4626Abi,
          address: tokenConfig.address,
          functionName: 'convertToAssets',
          args: [parseUnits('1', sharesDecimals)],
          chainId,
        })

        return NormalizedUnitNumber(formatUnits(result, assetsDecimals))
      }

    case 'ssr-auth-oracle':
      return async () => {
        const result = await readContract(wagmiConfig, {
          abi: ssrAuthOracleConfig.abi,
          address: getContractAddress(ssrAuthOracleConfig.address, chainId),
          functionName: 'getConversionRate',
          chainId,
        })

        return NormalizedUnitNumber(fromRay(bigNumberify(result)))
      }

    default:
      assertNever(tokenConfig)
  }
}
