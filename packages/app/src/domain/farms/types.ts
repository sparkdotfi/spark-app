import { AssetsGroup, FarmConfig } from '@/config/chain/types'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Token } from '../types/Token'

export interface FarmApiDetails {
  apy: Percentage
  depositors: number
  rewardTokenPriceUsd?: NormalizedUnitNumber
  totalRewarded: NormalizedUnitNumber
}

export interface FarmBlockchainDetails {
  address: CheckedAddress
  entryAssetsGroup: AssetsGroup
  rewardType: FarmConfig['rewardType']
  name: string
  rewardToken: Token
  stakingToken: Token
  rewardRate: NormalizedUnitNumber
  earnedTimestamp: number
  periodFinish: number
  totalSupply: NormalizedUnitNumber
  earned: NormalizedUnitNumber
  staked: NormalizedUnitNumber
}

export type Farm = Partial<FarmApiDetails> & FarmBlockchainDetails
