import { Token } from '@/domain/types/Token'
import { formatTimeLeft } from '@/features/spk-staking/utils/formatTimeLeft'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { UnixTime } from '@sparkdotfi/common-universal'
import type { TxOverview } from '../logic/createTxOverview'

interface StakeTransactionOverviewProps {
  txOverview: TxOverview
  selectedToken: Token
}

function StakeTransactionOverview({ txOverview }: StakeTransactionOverviewProps) {
  if (txOverview.status !== 'success') {
    const placeholder = '-'

    return (
      <TransactionOverview>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Estimated rewards</TransactionOverview.Label>
          <TransactionOverview.Generic>{placeholder}</TransactionOverview.Generic>
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Unstaking delay</TransactionOverview.Label>
          <TransactionOverview.Generic>{placeholder}</TransactionOverview.Generic>
        </TransactionOverview.Row>
      </TransactionOverview>
    )
  }
  const { apy, usds, rewardsPerYearUsd, unstakingDelay } = txOverview

  return (
    <TransactionOverview>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Estimated rewards</TransactionOverview.Label>
        <TransactionOverview.FarmApy apy={apy} rewardsPerYear={rewardsPerYearUsd} rewardToken={usds} />
      </TransactionOverview.Row>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Unstaking delay</TransactionOverview.Label>
        <TransactionOverview.Generic>{formatTimeLeft(UnixTime(unstakingDelay))}</TransactionOverview.Generic>
      </TransactionOverview.Row>
    </TransactionOverview>
  )
}

export {
  StakeTransactionOverview as TransactionOverview,
  type StakeTransactionOverviewProps as TransactionOverviewProps,
}
