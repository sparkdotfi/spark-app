import { Reserve } from '@/domain/market-info/marketInfo'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface RepayObjective {
  type: 'repay'
  reserve: Reserve
  useAToken: boolean
  value: NormalizedUnitNumber
  requiredApproval: NormalizedUnitNumber
}

export interface RepayAction {
  type: 'repay'
  reserve: Reserve
  value: NormalizedUnitNumber
  useAToken: boolean
}
