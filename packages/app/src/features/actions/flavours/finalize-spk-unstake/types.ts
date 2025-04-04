import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
export interface FinalizeSpkUnstakeObjective {
  type: 'finalizeSpkUnstake'
  spk: Token
  amount: NormalizedNumber
  epochs: number[]
}

export interface FinalizeSpkUnstakeAction {
  type: 'finalizeSpkUnstake'
  spk: Token
  amount: NormalizedNumber
  epochs: number[]
}
