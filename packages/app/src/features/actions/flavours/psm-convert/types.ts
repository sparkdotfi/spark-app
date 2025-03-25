import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface PsmConvertAction {
  type: 'psmConvert'
  inToken: Token
  outToken: Token
  amount: NormalizedUnitNumber
}
