import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface DepositToSavingsObjective {
  type: 'depositToSavings'
  value: NormalizedUnitNumber
  token: Token
  savingsToken: Token
}

export interface DepositToSavingsAction {
  type: 'depositToSavings'
  value: NormalizedUnitNumber
  token: Token
  savingsToken: Token
}
