import { Reserve } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface WithdrawObjective {
  type: 'withdraw'
  reserve: Reserve
  value: NormalizedUnitNumber
  all: boolean
  gatewayApprovalValue?: NormalizedUnitNumber
}

export interface WithdrawAction {
  type: 'withdraw'
  token: Token
  value: NormalizedUnitNumber
}
