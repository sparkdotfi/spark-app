import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

export interface CreateTxOverviewParams {
  apy: Percentage
  amountStaked: NormalizedUnitNumber
  nextEpochEnd: number
  formValues: TransferFromUserFormNormalizedData
}

export type TxOverview =
  | { status: 'no-overview' }
  | {
      status: 'success'
      apyBefore: Percentage
      apyAfter: Percentage
      claimableOn: Date
    }

export function createTxOverview({ formValues, amountStaked, apy, nextEpochEnd }: CreateTxOverviewParams): TxOverview {
  const amount = formValues.value
  if (amount.eq(0)) {
    return { status: 'no-overview' }
  }

  const claimAll = amount.eq(amountStaked) || formValues.isMaxSelected

  return {
    status: 'success',
    apyBefore: apy,
    apyAfter: claimAll ? Percentage(0) : apy,
    claimableOn: new Date(nextEpochEnd * 1000),
  }
}
