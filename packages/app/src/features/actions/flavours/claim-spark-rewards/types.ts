import { Token } from '@/domain/types/Token'
import { Hex, NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface ClaimSparkRewardsObjective {
  type: 'claimSparkRewards'
  source: 'campaigns' | 'spark-staking'
  token: Token
  epoch: number
  cumulativeAmount: NormalizedUnitNumber
  merkleRoot: Hex
  merkleProof: Hex[]
}

export interface ClaimSparkRewardsAction {
  type: 'claimSparkRewards'
  source: 'campaigns' | 'spark-staking'
  token: Token
  epoch: number
  cumulativeAmount: NormalizedUnitNumber
  merkleRoot: Hex
  merkleProof: Hex[]
}
