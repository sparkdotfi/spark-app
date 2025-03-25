import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface BorrowObjective {
  type: 'borrow'
  token: Token
  value: NormalizedUnitNumber
}

export interface BorrowAction {
  type: 'borrow'
  token: Token
  value: NormalizedUnitNumber
}
