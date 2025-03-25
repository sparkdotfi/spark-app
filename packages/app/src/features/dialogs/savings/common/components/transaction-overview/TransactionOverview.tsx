import { Token } from '@/domain/types/Token'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { testIds } from '@/ui/utils/testIds'
import { assert } from '@sparkdotfi/common-universal'
import { SavingsDialogTxOverview } from '../../types'
import { TransactionOverviewPlaceholder } from './components/TransactionOverviewPlaceholder'

interface SavingsTransactionOverviewProps {
  txOverview: SavingsDialogTxOverview
  selectedToken: Token
  showAPY?: boolean
}

export function SavingsTransactionOverview({ txOverview, selectedToken, showAPY }: SavingsTransactionOverviewProps) {
  if (txOverview.status !== 'success') {
    return <TransactionOverviewPlaceholder badgeToken={selectedToken.symbol} showAPY={showAPY} showSkyBadge />
  }
  const { APY, underlyingToken, stableEarnRate, route } = txOverview

  assert(route.length > 0, 'Route must have at least one item')
  const outcome = route.at(-1)!

  return (
    <TransactionOverview showSkyBadge>
      {showAPY && (
        <TransactionOverview.Row>
          <TransactionOverview.Label>APY</TransactionOverview.Label>
          <TransactionOverview.SavingsApy apy={APY} stableEarnRate={stableEarnRate} underlyingToken={underlyingToken} />
        </TransactionOverview.Row>
      )}
      <TransactionOverview.Row>
        <TransactionOverview.Label>Route</TransactionOverview.Label>
        <TransactionOverview.Route
          route={route.map((item) => ({
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
  SavingsTransactionOverview as TransactionOverview,
  type SavingsTransactionOverviewProps as TransactionOverviewProps,
}
