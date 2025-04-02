import { Reserve } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface WithdrawObjective {
  type: 'withdraw'
  reserve: Reserve
  value: NormalizedNumber
  all: boolean
  gatewayApprovalValue?: NormalizedNumber
}

export interface WithdrawAction {
  type: 'withdraw'
  token: Token
  value: NormalizedNumber
}
