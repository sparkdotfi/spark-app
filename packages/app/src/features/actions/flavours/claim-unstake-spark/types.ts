import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
export interface ClaimUnstakeSparkObjective {
  type: 'claimUnstakeSpark'
  spk: Token
  amount: NormalizedUnitNumber
  epochs: number[]
}

export interface ClaimUnstakeSparkAction {
  type: 'claimUnstakeSpark'
  spk: Token
  amount: NormalizedUnitNumber
  epochs: number[]
}
