import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface DowngradeObjective {
  type: 'downgrade'
  fromToken: Token
  toToken: Token
  amount: NormalizedNumber
}

export interface DowngradeAction {
  type: 'downgrade'
  fromToken: Token
  toToken: Token
  amount: NormalizedNumber
}
