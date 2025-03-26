import { Token } from '@/domain/types/Token'
import { TransferFromUserFormNormalizedData } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { SpkStakingEpochs } from '@/features/spk-staking/types'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

export interface CreateTxOverviewParams {
  apy: Percentage
  usds: Token
  spkStakingEpochs: SpkStakingEpochs
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
  spkStakingEpochs,
  timestamp,
}: CreateTxOverviewParams): TxOverview {
  const amount = formValues.value
  if (amount.eq(0)) {
    return { status: 'no-overview' }
  }

  const stakedAmountUsd = formValues.token.toUSD(amount)
  const rewardsPerYearUsd = NormalizedUnitNumber(stakedAmountUsd.multipliedBy(apy))

  const { currentEpoch, epochDurationInit, epochDuration } = spkStakingEpochs
  const unstakingDelay = (currentEpoch + 2n) * epochDuration + epochDurationInit - BigInt(timestamp)

  return {
    apy,
    usds,
    status: 'success',
    rewardsPerYearUsd,
    unstakingDelay: Number(unstakingDelay), // storybook doesn't support bigint
  }
}
