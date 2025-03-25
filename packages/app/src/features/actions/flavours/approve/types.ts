import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Address } from 'viem'

export interface ApproveAction {
  type: 'approve'
  token: Token
  spender: Address
  value: NormalizedUnitNumber
  requiredValue?: NormalizedUnitNumber // if reached, no action is needed. Useful when value is approximation (and constantly accrues debt)
}
