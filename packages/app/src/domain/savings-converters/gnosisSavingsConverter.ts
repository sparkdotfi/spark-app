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

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
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
        totalAssets: NormalizedUnitNumber(bigNumberify(totalAssets).shiftedBy(-decimals)),
        totalSupply: NormalizedUnitNumber(bigNumberify(totalSupply).shiftedBy(-decimals)),
        currentTimestamp: timestamp,
      })
    },
  }
}

export interface GnosisSavingsConverterParams {
  vaultAPY: Percentage
  totalSupply: NormalizedUnitNumber
  totalAssets: NormalizedUnitNumber
  currentTimestamp: number
}

export class GnosisSavingsConverter implements SavingsConverter {
  private vaultAPY: Percentage
  private totalSupply: NormalizedUnitNumber
  private totalAssets: NormalizedUnitNumber
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
      .dividedBy(365 * 24 * 60 * 60)
      .multipliedBy(timestamp - this.currentTimestamp)
      .plus(1)
  }

  convertToShares({ assets }: { assets: NormalizedUnitNumber }): NormalizedUnitNumber {
    return NormalizedUnitNumber(assets.multipliedBy(this.totalAssets.plus(1)).dividedBy(this.totalSupply.plus(1)))
  }

  convertToAssets({ shares }: { shares: NormalizedUnitNumber }): NormalizedUnitNumber {
    return NormalizedUnitNumber(shares.multipliedBy(this.totalSupply.plus(1)).dividedBy(this.totalAssets.plus(1)))
  }

  predictAssetsAmount({
    timestamp,
    shares,
  }: { timestamp: number; shares: NormalizedUnitNumber }): NormalizedUnitNumber {
    const growthFactor = this.getGrowthFactor(timestamp)
    const assets = this.convertToAssets({ shares })
    return NormalizedUnitNumber(assets.multipliedBy(growthFactor))
  }

  predictSharesAmount({
    timestamp,
    assets,
  }: { timestamp: number; assets: NormalizedUnitNumber }): NormalizedUnitNumber {
    const growthFactor = this.getGrowthFactor(timestamp)
    const predictedAssetsBuyingPower = NormalizedUnitNumber(assets.dividedBy(growthFactor))
    return NormalizedUnitNumber(this.convertToShares({ assets: predictedAssetsBuyingPower }))
  }
}

export function gnosisSavingsUsdsInfoQuery(): SavingsConverterQueryOptions {
  return {
    queryKey: ['gnosis-savings-usds-info'],
    queryFn: async () => null,
  }
}
