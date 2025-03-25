import { Token } from '@/domain/types/Token'
import { CheckedAddress } from '@sparkdotfi/common-universal'

export interface ClaimMarketRewardsObjective {
  type: 'claimMarketRewards'
  token: Token
  incentiveControllerAddress: CheckedAddress
  assets: CheckedAddress[]
}

export interface ClaimMarketRewardsAction {
  type: 'claimMarketRewards'
  token: Token
  incentiveControllerAddress: CheckedAddress
  assets: CheckedAddress[]
}
