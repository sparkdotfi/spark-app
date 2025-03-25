import { Token } from '@/domain/types/Token'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { testIds } from '@/ui/utils/testIds'
import { assert } from '@sparkdotfi/common-universal'
import { TransactionOverviewPlaceholder } from '../../../common/components/transaction-overview/components/TransactionOverviewPlaceholder'
import { MigrateDialogTxOverview } from '../types'

interface MigrateTransactionOverviewProps {
  txOverview: MigrateDialogTxOverview
  selectedToken: Token
  showAPY?: boolean
}

function MigrateTransactionOverview({ txOverview, selectedToken, showAPY }: MigrateTransactionOverviewProps) {
  if (txOverview.status !== 'success') {
    return <TransactionOverviewPlaceholder badgeToken={selectedToken.symbol} showAPY={showAPY} />
  }
  const { apyChange, route } = txOverview

  assert(route.length > 0, 'Route must have at least one item')
  const outcome = route.at(-1)!

  return (
    <TransactionOverview>
      {apyChange && (
        <TransactionOverview.Row>
          <TransactionOverview.Label>APY</TransactionOverview.Label>
          <TransactionOverview.ApyChange currentApy={apyChange.current} updatedApy={apyChange.updated} />
        </TransactionOverview.Row>
      )}
      <TransactionOverview.Row>
        <TransactionOverview.Label>Route</TransactionOverview.Label>
        <TransactionOverview.Route
          route={txOverview.route.map((item) => ({
            type: 'token-amount',
            token: item.token,
            amount: item.value,
            usdAmount: item.usdValue,
          }))}
        />
      </TransactionOverview.Row>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Outcome</TransactionOverview.Label>
        <TransactionOverview.TokenAmount
          token={outcome.token}
          amount={outcome.value}
          usdAmount={outcome.usdValue}
          amountDataTestId={testIds.dialog.transactionOverview.outcome}
          usdAmountDataTestId={testIds.dialog.transactionOverview.outcomeUsd}
        />
      </TransactionOverview.Row>
    </TransactionOverview>
  )
}

export {
  MigrateTransactionOverview as TransactionOverview,
  type MigrateTransactionOverviewProps as TransactionOverviewProps,
}
