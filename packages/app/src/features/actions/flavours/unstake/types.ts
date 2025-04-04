import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'

export interface UnstakeObjective {
  type: 'unstake'
  token: Token // stablecoins
  amount: NormalizedNumber
  exit: boolean
  farm: CheckedAddress
}

export interface UnstakeAction {
  type: 'unstake'
  stakingToken: Token
  rewardToken: Token
  amount: NormalizedNumber
  exit: boolean
  farm: CheckedAddress
}
