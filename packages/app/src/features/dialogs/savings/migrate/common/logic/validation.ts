import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getMigrateDialogFormValidator(tokenRepository: TokenRepository) {
  return AssetInputSchema.superRefine((field, ctx) => {
    const value = NormalizedUnitNumber(field.value === '' ? '0' : field.value)
    const balance = tokenRepository.findOneBalanceBySymbol(field.symbol)

    const issue = validateMigration({
      value,
      user: { balance },
    })
    if (issue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: migrateValidationIssueToMessage[issue],
        path: ['value'],
      })
    }
  })
}

export type MigrationValidationIssue = 'exceeds-balance' | 'value-not-positive'

export interface ValidateMigrationArgs {
  value: NormalizedUnitNumber
  user: {
    balance: NormalizedUnitNumber
  }
}

export function validateMigration({
  value,
  user: { balance },
}: ValidateMigrationArgs): MigrationValidationIssue | undefined {
  if (value.isLessThanOrEqualTo(0)) {
    return 'value-not-positive'
  }

  if (balance.lt(value)) {
    return 'exceeds-balance'
  }
}

export const migrateValidationIssueToMessage: Record<MigrationValidationIssue, string> = {
  'value-not-positive': 'Migrated value should be positive',
  'exceeds-balance': 'Exceeds your balance',
}
