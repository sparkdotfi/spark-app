import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface ApproveDelegationAction {
  type: 'approveDelegation'
  token: Token
  value: NormalizedUnitNumber
}
