import { AssetsGroup, FarmConfig } from '@/config/chain/types'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Token } from '../types/Token'

export interface FarmApiDetails {
  apy: Percentage
  depositors: number
  rewardTokenPriceUsd?: NormalizedNumber
  totalRewarded: NormalizedNumber
}

export interface FarmBlockchainDetails {
  address: CheckedAddress
  entryAssetsGroup: AssetsGroup
  rewardType: FarmConfig['rewardType']
  name: string
  rewardToken: Token
  stakingToken: Token
  rewardRate: NormalizedNumber
  earnedTimestamp: number
  periodFinish: number
  totalSupply: NormalizedNumber
  earned: NormalizedNumber
  staked: NormalizedNumber
}

export type Farm = Partial<FarmApiDetails> & FarmBlockchainDetails
