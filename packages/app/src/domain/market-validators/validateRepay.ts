import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { ReserveStatus } from '../market-info/reserve-status'

export type RepayValidationIssue =
  | 'value-not-positive'
  | 'exceeds-debt'
  | 'exceeds-balance'
  | 'reserve-paused'
  | 'reserve-not-active'

export interface ValidateRepayArgs {
  value: NormalizedNumber
  asset: {
    status: ReserveStatus
  }
  user: {
    debt: NormalizedNumber
    balance: NormalizedNumber
  }
}

export function validateRepay({
  value,
  asset: { status },
  user: { debt, balance },
}: ValidateRepayArgs): RepayValidationIssue | undefined {
  if (value.lte(0)) {
    return 'value-not-positive'
  }

  if (status === 'not-active') {
    return 'reserve-not-active'
  }

  if (status === 'paused') {
    return 'reserve-paused'
  }

  if (debt.lt(value)) {
    return 'exceeds-debt'
  }

  if (balance.lt(value)) {
    return 'exceeds-balance'
  }
}

export const repayValidationIssueToMessage: Record<RepayValidationIssue, string> = {
  'value-not-positive': 'Repay value should be positive',
  'reserve-paused': 'Reserve is paused',
  'reserve-not-active': 'Reserve is not active',
  'exceeds-debt': 'Exceeds your debt',
  'exceeds-balance': 'Exceeds your balance',
}
