import { gnosis } from 'viem/chains'
import { multicall } from 'wagmi/actions'

import {
  savingsXDaiAbi,
  savingsXDaiAdapterAbi,
  savingsXDaiAdapterAddress,
  savingsXDaiAddress,
} from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { fromWad } from '@/utils/math'
import { bigNumberify } from '@sparkdotfi/common-universal'

import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { SavingsConverter, SavingsConverterQueryOptions, SavingsConverterQueryParams } from './types'

export function gnosisSavingsDaiConverterQuery({
  wagmiConfig,
  timestamp,
}: SavingsConverterQueryParams): SavingsConverterQueryOptions {
  const sDaiAdapterAddress = getContractAddress(savingsXDaiAdapterAddress, gnosis.id)
  const sDaiAddress = getContractAddress(savingsXDaiAddress, gnosis.id)
  return {
    queryKey: ['gnosis-savings-dai-info'],
    queryFn: async () => {
      const [vaultAPY, totalAssets, totalSupply, decimals] = await multicall(wagmiConfig, {
        contracts: [
          {
            address: sDaiAdapterAddress,
            functionName: 'vaultAPY',
            args: [],
            abi: savingsXDaiAdapterAbi,
          },
          {
            address: sDaiAddress,
            functionName: 'totalSupply',
            args: [],
            abi: savingsXDaiAbi,
          },
          {
            address: sDaiAddress,
            functionName: 'totalAssets',
            args: [],
            abi: savingsXDaiAbi,
          },
          {
            address: sDaiAddress,
            functionName: 'decimals',
            args: [],
            abi: savingsXDaiAbi,
          },
        ],
        allowFailure: false,
      })

      return {
        vaultAPY,
        totalAssets,
        totalSupply,
        decimals,
      }
    },
    select: ({ vaultAPY, totalAssets, totalSupply, decimals }) => {
      return new GnosisSavingsConverter({
        vaultAPY: Percentage(fromWad(bigNumberify(vaultAPY))),
        totalAssets: NormalizedNumber(totalAssets).shiftedBy(-decimals),
        totalSupply: NormalizedNumber(totalSupply).shiftedBy(-decimals),
        currentTimestamp: timestamp,
      })
    },
  }
}

export interface GnosisSavingsConverterParams {
  vaultAPY: Percentage
  totalSupply: NormalizedNumber
  totalAssets: NormalizedNumber
  currentTimestamp: number
}

export class GnosisSavingsConverter implements SavingsConverter {
  private vaultAPY: Percentage
  private totalSupply: NormalizedNumber
  private totalAssets: NormalizedNumber
  readonly currentTimestamp: number

  constructor(params: GnosisSavingsConverterParams) {
    this.vaultAPY = params.vaultAPY
    this.totalSupply = params.totalSupply
    this.totalAssets = params.totalAssets
    this.currentTimestamp = params.currentTimestamp
  }

  get apy(): Percentage {
    return this.vaultAPY
  }

  get supportsRealTimeInterestAccrual(): boolean {
    return false
  }

  private getGrowthFactor(timestamp: number): BigNumber {
    return this.vaultAPY
      .div(365 * 24 * 60 * 60)
      .times(timestamp - this.currentTimestamp)
      .plus(1)
  }

  convertToShares({ assets }: { assets: NormalizedNumber }): NormalizedNumber {
    return assets.times(this.totalAssets.plus(1)).div(this.totalSupply.plus(1))
  }

  convertToAssets({ shares }: { shares: NormalizedNumber }): NormalizedNumber {
    return shares.times(this.totalSupply.plus(1)).div(this.totalAssets.plus(1))
  }

  predictAssetsAmount({ timestamp, shares }: { timestamp: number; shares: NormalizedNumber }): NormalizedNumber {
    const growthFactor = this.getGrowthFactor(timestamp)
    const assets = this.convertToAssets({ shares })
    return assets.times(NormalizedNumber(growthFactor))
  }

  predictSharesAmount({ timestamp, assets }: { timestamp: number; assets: NormalizedNumber }): NormalizedNumber {
    const growthFactor = this.getGrowthFactor(timestamp)
    const predictedAssetsBuyingPower = assets.div(NormalizedNumber(growthFactor))
    return this.convertToShares({ assets: predictedAssetsBuyingPower })
  }
}

export function gnosisSavingsUsdsInfoQuery(): SavingsConverterQueryOptions {
  return {
    queryKey: ['gnosis-savings-usds-info'],
    queryFn: async () => null,
  }
}
