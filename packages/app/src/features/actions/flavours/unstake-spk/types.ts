import { Token } from '@/domain/types/Token'
import { BaseUnitNumber, NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface UnstakeSpkObjective {
  type: 'unstakeSpk'
  spk: Token
  amount: NormalizedUnitNumber
  accountActiveShares: BaseUnitNumber
  unstakeAll: boolean
}

export interface UnstakeSpkAction {
  type: 'unstakeSpk'
  spk: Token
  amount: NormalizedUnitNumber
  accountActiveShares: BaseUnitNumber
  unstakeAll: boolean
}
