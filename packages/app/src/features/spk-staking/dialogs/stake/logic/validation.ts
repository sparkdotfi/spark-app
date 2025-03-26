import { TransferFromUserValidationIssue } from '@/features/dialogs/common/logic/transfer-from-user/validation'

export const validationIssueToMessage: Record<TransferFromUserValidationIssue, string> = {
  'value-not-positive': 'Stake amount should be positive',
  'exceeds-balance': 'Exceeds your balance',
}
