import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getTransferFromUserFormValidator(
  tokenRepository: TokenRepository,
  issueToMessage: Record<TransferFromUserValidationIssue, string>,
) {
  return AssetInputSchema.superRefine((field, ctx) => {
    const value = NormalizedUnitNumber(field.value === '' ? '0' : field.value)
    const balance = tokenRepository.findOneBalanceBySymbol(field.symbol)

    const issue = validateTransferFromUser({
      value,
      user: { balance },
    })
    if (issue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: issueToMessage[issue],
        path: ['value'],
      })
    }
  })
}

export type TransferFromUserValidationIssue = 'exceeds-balance' | 'value-not-positive'

export interface ValidateBalanceArgs {
  value: NormalizedUnitNumber
  user: {
    balance: NormalizedUnitNumber
  }
}

export function validateTransferFromUser({
  value,
  user: { balance },
}: ValidateBalanceArgs): TransferFromUserValidationIssue | undefined {
  if (value.isLessThanOrEqualTo(0)) {
    return 'value-not-positive'
  }

  if (balance.lt(value)) {
    return 'exceeds-balance'
  }
}
