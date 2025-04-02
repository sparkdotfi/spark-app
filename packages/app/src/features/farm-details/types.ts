import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface FarmInfo {
  rewardToken: Token
  stakingToken: Token
  earned: NormalizedNumber
  staked: NormalizedNumber
  rewardRate: NormalizedNumber
  earnedTimestamp: number
  periodFinish: number
  totalSupply: NormalizedNumber
}

export type RewardPointsSyncStatus = 'synced' | 'out-of-sync' | 'sync-failed'
