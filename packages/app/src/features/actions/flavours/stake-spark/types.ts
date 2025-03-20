import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'

export interface StakeSparkObjective {
  type: 'stakeSpark'
  spk: Token
  amount: NormalizedUnitNumber
}

export interface StakeSparkAction {
  type: 'stakeSpark'
  spk: Token
  amount: NormalizedUnitNumber
}
