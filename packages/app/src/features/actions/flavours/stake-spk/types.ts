import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface StakeSpkObjective {
  type: 'stakeSpk'
  spk: Token
  amount: NormalizedNumber
}

export interface StakeSpkAction {
  type: 'stakeSpk'
  spk: Token
  amount: NormalizedNumber
}
