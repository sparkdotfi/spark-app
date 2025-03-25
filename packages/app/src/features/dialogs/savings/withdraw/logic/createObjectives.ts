import { TokenWithBalance } from '@/domain/common/types'
import { WithdrawFromSavingsObjective } from '@/features/actions/flavours/withdraw-from-savings/types'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Mode } from '../types'

export interface CreateObjectivesParams {
  formValues: TransferFromUserFormNormalizedData
  receiver: CheckedAddress | undefined
  mode: Mode
  savingsTokenWithBalance: TokenWithBalance
}
export function createObjectives({
  formValues,
  receiver,
  mode,
  savingsTokenWithBalance,
}: CreateObjectivesParams): WithdrawFromSavingsObjective[] {
  const isMaxSelected = formValues.isMaxSelected

  return [
    {
      type: 'withdrawFromSavings',
      token: formValues.token,
      amount: isMaxSelected ? savingsTokenWithBalance.balance : formValues.value,
      isRedeem: isMaxSelected,
      savingsToken: savingsTokenWithBalance.token,
      receiver,
      mode,
    },
  ]
}
