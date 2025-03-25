import { susdsAbi } from '@/config/abis/susdsAbi'
import { getChainConfigEntry } from '@/config/chain'
import { SavingsConverterQuery } from '@/config/chain/types'
import { potAbi, potAddress } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { raise } from '@sparkdotfi/common-universal'
import { QueryKey, queryOptions } from '@tanstack/react-query'
import { multicall } from 'wagmi/actions'
import { TokenSymbol } from '../types/TokenSymbol'
import { PotSavingsConverter } from './PotSavingsConverter'
import { SavingsConverterQueryOptions, SavingsConverterQueryParams } from './types'

export function mainnetSavingsDaiConverterQuery({
  wagmiConfig,
  timestamp,
  chainId,
}: SavingsConverterQueryParams): SavingsConverterQueryOptions {
  const makerPotAddress = getContractAddress(potAddress, chainId)
  return {
    queryKey: ['savings-dai-info', { chainId }],
    queryFn: async () => {
      const [dsr, rho, chi] = await multicall(wagmiConfig, {
        allowFailure: false,
        contracts: [
          {
            address: makerPotAddress,
            functionName: 'dsr',
            args: [],
            abi: potAbi,
          },
          {
            address: makerPotAddress,
            functionName: 'rho',
            args: [],
            abi: potAbi,
          },
          {
            address: makerPotAddress,
            functionName: 'chi',
            args: [],
            abi: potAbi,
          },
        ],
      })

      return {
        dsr,
        rho,
        chi,
      }
    },
    select: ({ dsr, rho, chi }) => {
      return new PotSavingsConverter({
        potParams: {
          dsr: bigNumberify(dsr),
          rho: bigNumberify(rho),
          chi: bigNumberify(chi),
        },
        currentTimestamp: timestamp,
      })
    },
  }
}

export const mainnetSavingsUsdsConverterQuery = mainnetSkySavingsConverterQueryFactory(TokenSymbol('sUSDS'))
export const mainnetSavingsUsdcConverterQuery = mainnetSkySavingsConverterQueryFactory(TokenSymbol('sUSDC'))

function mainnetSkySavingsConverterQueryFactory(savingsTokenSymbol: TokenSymbol): SavingsConverterQuery {
  return function mainnetSkySavingsConverterQuery({
    wagmiConfig,
    timestamp,
    chainId,
  }: SavingsConverterQueryParams): SavingsConverterQueryOptions {
    return queryOptions({
      queryKey: ['savings-info', savingsTokenSymbol, { chainId }] as QueryKey,
      queryFn: async () => {
        const chainConfig = getChainConfigEntry(chainId)
        const savingsTokenAddress =
          chainConfig.definedTokens.find(({ symbol }) => symbol === savingsTokenSymbol)?.address ??
          raise(`${savingsTokenSymbol} address not found`)

        const [ssr, rho, chi] = await multicall(wagmiConfig, {
          allowFailure: false,
          contracts: [
            {
              address: savingsTokenAddress,
              functionName: 'ssr',
              args: [],
              abi: susdsAbi,
            },
            {
              address: savingsTokenAddress,
              functionName: 'rho',
              args: [],
              abi: susdsAbi,
            },
            {
              address: savingsTokenAddress,
              functionName: 'chi',
              args: [],
              abi: susdsAbi,
            },
          ],
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
    })
  }
}
