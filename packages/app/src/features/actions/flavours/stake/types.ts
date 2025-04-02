import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'

export interface StakeObjective {
  type: 'stake'
  token: Token // any supported input token (e.g. dai, usds, usdc, sdai, susds, ...)
  amount: NormalizedNumber // amount of input token, not necessarily stake amount (in case when input is savings token)
  farm: CheckedAddress
}

export interface StakeAction {
  type: 'stake'
  stakingToken: Token // e.g. usds for Sky farms
  stakeAmount: NormalizedNumber
  rewardToken: Token
  farm: CheckedAddress
}
