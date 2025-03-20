import { Token } from '@/domain/types/Token'
import { BaseUnitNumber, NormalizedUnitNumber } from '@marsfoundation/common-universal'

export interface UnstakeSparkObjective {
  type: 'unstakeSpark'
  spk: Token
  amount: NormalizedUnitNumber
  accountActiveShares: BaseUnitNumber
  unstakeAll: boolean
}

export interface UnstakeSparkAction {
  type: 'unstakeSpark'
  spk: Token
  amount: NormalizedUnitNumber
  accountActiveShares: BaseUnitNumber
  unstakeAll: boolean
}
