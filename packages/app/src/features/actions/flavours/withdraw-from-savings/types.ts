import { Token } from '@/domain/types/Token'
import { Mode } from '@/features/dialogs/savings/withdraw/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'

export type WithdrawFromSavingsObjective = {
  type: 'withdrawFromSavings'
  token: Token
  savingsToken: Token
  amount: NormalizedNumber
  isRedeem: boolean // When redeeming, amount is in savings token. Otherwise, amount is in stable.
} & (
  | {
      mode: 'send'
      receiver?: CheckedAddress
    }
  | {
      mode: 'withdraw'
    }
)

export interface WithdrawFromSavingsAction {
  type: 'withdrawFromSavings'
  token: Token
  savingsToken: Token
  amount: NormalizedNumber
  isRedeem: boolean
  mode: Mode
  receiver?: CheckedAddress
}
