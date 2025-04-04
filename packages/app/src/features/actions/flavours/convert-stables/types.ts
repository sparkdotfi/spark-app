import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface ConvertStablesObjective {
  type: 'convertStables'
  inToken: Token
  outToken: Token
  amount: NormalizedNumber
}
