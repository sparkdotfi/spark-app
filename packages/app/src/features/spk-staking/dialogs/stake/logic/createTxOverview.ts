import { Token } from '@/domain/types/Token'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

export interface CreateTxOverviewParams {
  apy: Percentage
  usds: Token
  nextEpochEnd: number
  timestamp: number
  formValues: TransferFromUserFormNormalizedData
}

export type TxOverview =
  | { status: 'no-overview' }
  | {
      status: 'success'
      apy: Percentage
      usds: Token
      rewardsPerYearUsd: NormalizedUnitNumber
      unstakingDelay: number
    }

export function createTxOverview({
  formValues,
  apy,
  usds,
  nextEpochEnd,
  timestamp,
}: CreateTxOverviewParams): TxOverview {
  const amount = formValues.value
  if (amount.eq(0)) {
    return { status: 'no-overview' }
  }

  const stakedAmountUsd = formValues.token.toUSD(amount)
  const rewardsPerYearUsd = NormalizedUnitNumber(stakedAmountUsd.multipliedBy(apy))

  const unstakingDelay = Math.max(0, nextEpochEnd - timestamp)

  return {
    apy,
    usds,
    status: 'success',
    rewardsPerYearUsd,
    unstakingDelay,
  }
}
