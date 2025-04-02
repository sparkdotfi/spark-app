import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface UpgradeObjective {
  type: 'upgrade'
  fromToken: Token
  toToken: Token
  amount: NormalizedNumber
}

export interface UpgradeAction {
  type: 'upgrade'
  fromToken: Token
  toToken: Token
  amount: NormalizedNumber
}
