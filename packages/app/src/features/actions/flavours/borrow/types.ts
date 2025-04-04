import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface BorrowObjective {
  type: 'borrow'
  token: Token
  value: NormalizedNumber
}

export interface BorrowAction {
  type: 'borrow'
  token: Token
  value: NormalizedNumber
}
