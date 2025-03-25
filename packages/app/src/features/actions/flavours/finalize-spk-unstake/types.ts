import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
export interface FinalizeSpkUnstakeObjective {
  type: 'finalizeSpkUnstake'
  spk: Token
  amount: NormalizedUnitNumber
  epochs: number[]
}

export interface FinalizeSpkUnstakeAction {
  type: 'finalizeSpkUnstake'
  spk: Token
  amount: NormalizedUnitNumber
  epochs: number[]
}
