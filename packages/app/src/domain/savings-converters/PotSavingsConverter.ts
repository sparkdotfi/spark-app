import { fromRay, pow } from '@/utils/math'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { SavingsConverter } from './types'

export interface PotParams {
  dsr: BigNumber
  rho: BigNumber
  chi: BigNumber
}
export interface PotSavingsConverterParams {
  potParams: PotParams
  currentTimestamp: number
}

export class PotSavingsConverter implements SavingsConverter {
  readonly DSR: Percentage
  readonly potParams: PotParams
  readonly currentTimestamp: number

  constructor({ potParams, currentTimestamp }: PotSavingsConverterParams) {
    this.potParams = potParams
    this.currentTimestamp = currentTimestamp
    this.DSR = Percentage(pow(fromRay(potParams.dsr), 60 * 60 * 24 * 365).minus(1), { allowMoreThan1: true })
  }

  get apy(): Percentage {
    return this.DSR
  }

  get supportsRealTimeInterestAccrual(): boolean {
    return true
  }

  private getUpdatedChi(timestamp: number): BigNumber {
    const { dsr, rho, chi } = this.potParams
    return fromRay(pow(fromRay(dsr), bigNumberify(timestamp).minus(rho)).times(chi))
  }

  convertToShares({ assets }: { assets: NormalizedNumber }): NormalizedNumber {
    return this.predictSharesAmount({ timestamp: this.currentTimestamp, assets })
  }

  convertToAssets({ shares }: { shares: NormalizedNumber }): NormalizedNumber {
    return this.predictAssetsAmount({ timestamp: this.currentTimestamp, shares })
  }

  predictAssetsAmount({ timestamp, shares }: { timestamp: number; shares: NormalizedNumber }): NormalizedNumber {
    const updatedChi = this.getUpdatedChi(timestamp)
    return shares.times(NormalizedNumber(updatedChi))
  }

  predictSharesAmount({ timestamp, assets }: { timestamp: number; assets: NormalizedNumber }): NormalizedNumber {
    const updatedChi = this.getUpdatedChi(timestamp)
    return assets.div(NormalizedNumber(updatedChi))
  }
}
