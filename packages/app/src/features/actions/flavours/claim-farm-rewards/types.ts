import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'

export interface ClaimFarmRewardsObjective {
  type: 'claimFarmRewards'
  farm: CheckedAddress
  rewardToken: Token
  rewardAmount: NormalizedUnitNumber
}

export interface ClaimFarmRewardsAction {
  type: 'claimFarmRewards'
  farm: CheckedAddress
  rewardToken: Token
  rewardAmount: NormalizedUnitNumber
}
