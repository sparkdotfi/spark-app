import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface DepositToSavingsObjective {
  type: 'depositToSavings'
  value: NormalizedNumber
  token: Token
  savingsToken: Token
}

export interface DepositToSavingsAction {
  type: 'depositToSavings'
  value: NormalizedNumber
  token: Token
  savingsToken: Token
}
