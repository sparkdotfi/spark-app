import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface DepositObjective {
  type: 'deposit'
  token: Token
  value: NormalizedNumber
}

export interface DepositAction {
  type: 'deposit'
  token: Token
  value: NormalizedNumber
}
