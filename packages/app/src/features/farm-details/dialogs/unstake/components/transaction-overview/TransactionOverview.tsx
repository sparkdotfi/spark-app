import { Token } from '@/domain/types/Token'
import { HorizontalScroll } from '@/ui/atoms/horizontal-scroll/HorizontalScroll'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { RouteItem } from '@/ui/organisms/transaction-overview/rows/TransactionOverviewRoute'
import { testIds } from '@/ui/utils/testIds'
import { assert } from '@sparkdotfi/common-universal'
import { TxOverview } from '../../logic/createTxOverview'
import { UnstakeTransactionOutcome } from './UnstakeTransactionOutcome'

export interface UnstakeTransactionOverviewProps {
  txOverview: TxOverview
  selectedToken: Token
}

export function UnstakeTransactionOverview({ txOverview }: UnstakeTransactionOverviewProps) {
  if (txOverview.status !== 'success') {
    const placeholder = '-'

    return (
      <TransactionOverview showSkyBadge>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Route</TransactionOverview.Label>
          <TransactionOverview.RoutePlaceholder>{placeholder}</TransactionOverview.RoutePlaceholder>
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Outcome</TransactionOverview.Label>
          <TransactionOverview.Generic>{placeholder}</TransactionOverview.Generic>
        </TransactionOverview.Row>
      </TransactionOverview>
    )
  }
  const { rewardToken, routeToOutcomeToken, stakingToken, earnedRewards, isExiting } = txOverview

  assert(routeToOutcomeToken.length > 0, 'Route must have at least one item')
  const outcomeTokenRouteItem = routeToOutcomeToken.at(-1)!
  const route: RouteItem[] = [
    {
      type: 'generic',
      upperText: `${rewardToken.symbol} Farm`,
      lowerText: `${stakingToken.symbol} Deposited`,
      upperTextDataTestId: testIds.farmDetails.unstakeDialog.transactionOverview.route.farm.farmName,
      lowerTextDataTestId: testIds.farmDetails.unstakeDialog.transactionOverview.route.farm.stakingToken,
    },
    ...routeToOutcomeToken.map(
      (item) =>
        ({
          type: 'token-amount',
          token: item.token,
          amount: item.value,
          usdAmount: item.usdValue,
        }) as const,
    ),
  ]

  return (
    <TransactionOverview showSkyBadge>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Route</TransactionOverview.Label>
        <TransactionOverview.Route route={route} />
      </TransactionOverview.Row>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Outcome</TransactionOverview.Label>
        <HorizontalScroll>
          <TransactionOverview.Generic>
            <UnstakeTransactionOutcome
              outcomeTokenRouteItem={outcomeTokenRouteItem}
              rewardToken={rewardToken}
              isExiting={isExiting}
              earnedRewards={earnedRewards}
            />
          </TransactionOverview.Generic>
        </HorizontalScroll>
      </TransactionOverview.Row>
    </TransactionOverview>
  )
}

export {
  UnstakeTransactionOverview as TransactionOverview,
  type UnstakeTransactionOverviewProps as TransactionOverviewProps,
}
