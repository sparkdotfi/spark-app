import { ssrAuthOracleConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { readContract } from 'wagmi/actions'
import { PotSavingsConverter } from './PotSavingsConverter'
import { SavingsConverterQueryOptions, SavingsConverterQueryParams } from './types'

export function ssrAuthOracleConverterQueryOptions({
  wagmiConfig,
  timestamp,
  chainId,
}: SavingsConverterQueryParams): SavingsConverterQueryOptions {
  return {
    queryKey: ['ssr-auth-oracle-converter', { chainId }],
    queryFn: async () => {
      const { ssr, chi, rho } = await readContract(wagmiConfig, {
        abi: ssrAuthOracleConfig.abi,
        address: getContractAddress(ssrAuthOracleConfig.address, chainId),
        functionName: 'getSUSDSData',
      })

      return {
        ssr,
        rho,
        chi,
      }
    },
    select: ({ ssr, rho, chi }) => {
      return new PotSavingsConverter({
        potParams: {
          dsr: bigNumberify(ssr),
          rho: bigNumberify(rho),
          chi: bigNumberify(chi),
        },
        currentTimestamp: timestamp,
      })
    },
  }
}
