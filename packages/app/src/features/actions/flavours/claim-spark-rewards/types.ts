import { Token } from '@/domain/types/Token'
import { Hex, NormalizedNumber } from '@sparkdotfi/common-universal'

export interface ClaimSparkRewardsObjective {
  type: 'claimSparkRewards'
  source: 'campaigns' | 'spark-staking'
  token: Token
  epoch: number
  cumulativeAmount: NormalizedNumber
  merkleRoot: Hex
  merkleProof: Hex[]
}

export interface ClaimSparkRewardsAction {
  type: 'claimSparkRewards'
  source: 'campaigns' | 'spark-staking'
  token: Token
  epoch: number
  cumulativeAmount: NormalizedNumber
  merkleRoot: Hex
  merkleProof: Hex[]
}
