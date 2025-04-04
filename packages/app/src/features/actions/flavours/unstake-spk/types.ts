import { Token } from '@/domain/types/Token'
import { BaseUnitNumber, NormalizedNumber } from '@sparkdotfi/common-universal'

export interface UnstakeSpkObjective {
  type: 'unstakeSpk'
  spk: Token
  amount: NormalizedNumber
  accountActiveShares: BaseUnitNumber
  unstakeAll: boolean
}

export interface UnstakeSpkAction {
  type: 'unstakeSpk'
  spk: Token
  amount: NormalizedNumber
  accountActiveShares: BaseUnitNumber
  unstakeAll: boolean
}
