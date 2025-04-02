import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import {
  ValidateBalanceArgs,
  validateTransferFromUser,
} from '@/features/dialogs/common/logic/transfer-from-user/validation'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { z } from 'zod'
import { ConvertStablesFormSchema } from './schema'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getConvertStablesFormValidator(tokenRepository: TokenRepository) {
  return ConvertStablesFormSchema.superRefine((field, ctx) => {
    const amount = NormalizedNumber(field.amount === '' ? '0' : field.amount)
    const balance = tokenRepository.findOneBalanceBySymbol(field.inTokenSymbol)

    const issue = validateTransferFromUser({
      value: amount,
      user: { balance },
    })
    if (issue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: convertStablesValidationIssueToMessage[issue],
        path: ['amount'],
      })
    }
  })
}

export interface ValidateConvertStablesWithPsm3Args extends ValidateBalanceArgs {
  isConvertToUsdc: boolean
  psm3: {
    usdsBalance: NormalizedNumber
    usdcBalance: NormalizedNumber
  }
}
export function validateConvertStablesWithPsm3({
  value,
  isConvertToUsdc,
  user: { balance },
  psm3: { usdsBalance, usdcBalance },
}: ValidateConvertStablesWithPsm3Args): ValidateConvertStables | undefined {
  if (isConvertToUsdc) {
    if (usdcBalance.lt(value)) {
      return 'usdc-withdraw-cap-reached'
    }
  } else {
    if (usdsBalance.lt(value)) {
      return 'usds-withdraw-cap-reached'
    }
  }

  return validateTransferFromUser({
    value,
    user: { balance },
  })
}

export type ValidateConvertStables =
  | 'exceeds-balance'
  | 'value-not-positive'
  | 'usds-withdraw-cap-reached'
  | 'usdc-withdraw-cap-reached'

export const convertStablesValidationIssueToMessage: Record<ValidateConvertStables, string> = {
  'value-not-positive': 'Amount should be positive',
  'exceeds-balance': 'Exceeds your balance',
  'usds-withdraw-cap-reached': 'USDS withdraw cap temporarily reached',
  'usdc-withdraw-cap-reached': 'USDC withdraw cap temporarily reached',
}
