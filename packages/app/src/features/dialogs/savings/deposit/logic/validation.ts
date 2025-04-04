import { TransferFromUserValidationIssue } from '@/features/dialogs/common/logic/transfer-from-user/validation'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export type DepositToSavingsValidationIssue = TransferFromUserValidationIssue | 'exceeds-psm3-balance'

export const depositValidationIssueToMessage: Record<DepositToSavingsValidationIssue, string> = {
  'value-not-positive': 'Deposit value should be positive',
  'exceeds-balance': 'Exceeds your balance',
  'exceeds-psm3-balance': 'Savings deposit cap temporarily reached',
}

export interface ValidateDepositToSavingsOnBaseParams {
  psm3SusdsBalance: NormalizedNumber
  estimatedSusdsReceived: NormalizedNumber
}
export function validateDepositToSavingsWithPsm3({
  psm3SusdsBalance,
  estimatedSusdsReceived,
}: ValidateDepositToSavingsOnBaseParams): DepositToSavingsValidationIssue | undefined {
  if (psm3SusdsBalance.lt(estimatedSusdsReceived)) {
    return 'exceeds-psm3-balance'
  }
}
