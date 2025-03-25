import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface SparkReward {
  token: Token
  amountToClaim: NormalizedUnitNumber
}
