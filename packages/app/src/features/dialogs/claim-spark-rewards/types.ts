import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface SparkReward {
  token: Token
  amountToClaim: NormalizedNumber
}
