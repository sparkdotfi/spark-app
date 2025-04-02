import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { z } from 'zod'

export interface GetUnstakeDialogFormValidatorParams {
  stakedAmount: NormalizedUnitNumber
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getUnstakeDialogFormValidator({ stakedAmount }: GetUnstakeDialogFormValidatorParams) {
  return AssetInputSchema.superRefine((field, ctx) => {
    const value = NormalizedUnitNumber(field.value === '' ? '0' : field.value)
    const isMaxSelected = field.isMaxSelected

    const issue = validateUnstake({
      value,
      isMaxSelected,
      user: { staked: stakedAmount },
    })
    if (issue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationIssueToMessage[issue],
        path: ['value'],
      })
    }
  })
}

export type WithdrawValidationIssue = 'exceeds-staked-amount' | 'value-not-positive'

export interface ValidateWithdrawArgs {
  value: NormalizedUnitNumber
  isMaxSelected: boolean
  user: {
    staked: NormalizedUnitNumber
  }
}

export function validateUnstake({
  value,
  isMaxSelected,
  user: { staked },
}: ValidateWithdrawArgs): WithdrawValidationIssue | undefined {
  if (isMaxSelected) {
    return undefined
  }

  if (value.lte(0)) {
    return 'value-not-positive'
  }

  if (staked.lt(value)) {
    return 'exceeds-staked-amount'
  }
}

const validationIssueToMessage: Record<WithdrawValidationIssue, string> = {
  'value-not-positive': 'Unstake value should be positive',
  'exceeds-staked-amount': 'Exceeds your staked amount',
}
