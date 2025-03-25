import { Address } from 'viem'

import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface PermitAction {
  type: 'permit'
  token: Token
  spender: Address
  value: NormalizedUnitNumber
}
