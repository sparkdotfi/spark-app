import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface FarmInfo {
  rewardToken: Token
  stakingToken: Token
  earned: NormalizedUnitNumber
  staked: NormalizedUnitNumber
  rewardRate: NormalizedUnitNumber
  earnedTimestamp: number
  periodFinish: number
  totalSupply: NormalizedUnitNumber
}

export type RewardPointsSyncStatus = 'synced' | 'out-of-sync' | 'sync-failed'
