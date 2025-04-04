import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { ReserveStatus } from '../market-info/reserve-status'

export type DepositValidationIssue =
  | 'value-not-positive'
  | 'exceeds-balance'
  | 'deposit-cap-reached'
  | 'reserve-not-active'

export interface ValidateDepositArgs {
  value: NormalizedNumber
  asset: {
    status: ReserveStatus
    totalLiquidity: NormalizedNumber
    supplyCap?: NormalizedNumber
  }
  user: {
    balance: NormalizedNumber
    alreadyDepositedValueUSD: NormalizedNumber
  }
}

export function validateDeposit({
  value,
  asset: { status, totalLiquidity, supplyCap },
  user: { balance, alreadyDepositedValueUSD },
}: ValidateDepositArgs): DepositValidationIssue | undefined {
  if (value.lte(0) && alreadyDepositedValueUSD.eq(0)) {
    return 'value-not-positive'
  }

  if (status !== 'active') {
    return 'reserve-not-active'
  }

  if (balance.lt(value)) {
    return 'exceeds-balance'
  }

  if (supplyCap && value.plus(totalLiquidity).gt(supplyCap)) {
    return 'deposit-cap-reached'
  }
}

export const depositValidationIssueToMessage: Record<DepositValidationIssue, string> = {
  'value-not-positive': 'Deposit value should be positive',
  'reserve-not-active': 'Depositing is not available for this asset',
  'deposit-cap-reached': 'Deposit cap reached',
  'exceeds-balance': 'Exceeds your balance',
}
