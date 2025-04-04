import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface ApproveDelegationAction {
  type: 'approveDelegation'
  token: Token
  value: NormalizedNumber
}
