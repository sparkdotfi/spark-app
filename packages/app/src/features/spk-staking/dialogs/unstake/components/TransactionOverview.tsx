import { Token } from '@/domain/types/Token'
import { formatTargetDate } from '@/features/spk-staking/utils/formatTargetDate'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
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
          <TransactionOverview.Label>Rewards</TransactionOverview.Label>
          <TransactionOverview.Generic>{placeholder}</TransactionOverview.Generic>
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Claimable on</TransactionOverview.Label>
          <TransactionOverview.Generic>{placeholder}</TransactionOverview.Generic>
        </TransactionOverview.Row>
      </TransactionOverview>
    )
  }
  const { apyBefore, apyAfter, claimableOn } = txOverview

  return (
    <TransactionOverview>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Rewards</TransactionOverview.Label>
        <TransactionOverview.ApyChange currentApy={apyBefore} updatedApy={apyAfter} />
      </TransactionOverview.Row>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Claimable on</TransactionOverview.Label>
        <TransactionOverview.Generic>{formatTargetDate(claimableOn)}</TransactionOverview.Generic>
      </TransactionOverview.Row>
    </TransactionOverview>
  )
}

export {
  StakeTransactionOverview as TransactionOverview,
  type StakeTransactionOverviewProps as TransactionOverviewProps,
}
