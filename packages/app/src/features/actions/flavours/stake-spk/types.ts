import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface StakeSpkObjective {
  type: 'stakeSpk'
  spk: Token
  amount: NormalizedUnitNumber
}

export interface StakeSpkAction {
  type: 'stakeSpk'
  spk: Token
  amount: NormalizedUnitNumber
}
