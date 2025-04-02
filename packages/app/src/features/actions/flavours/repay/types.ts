import { Reserve } from '@/domain/market-info/marketInfo'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface RepayObjective {
  type: 'repay'
  reserve: Reserve
  useAToken: boolean
  value: NormalizedNumber
  requiredApproval: NormalizedNumber
}

export interface RepayAction {
  type: 'repay'
  reserve: Reserve
  value: NormalizedNumber
  useAToken: boolean
}
