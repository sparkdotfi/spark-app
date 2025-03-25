import { Token } from '@/domain/types/Token'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { RouteItem } from '@/ui/organisms/transaction-overview/rows/TransactionOverviewRoute'
import { testIds } from '@/ui/utils/testIds'
import { assert } from '@sparkdotfi/common-universal'
import type { TxOverview } from '../logic/createTxOverview'

interface StakeTransactionOverviewProps {
  txOverview: TxOverview
  selectedToken: Token
}

function StakeTransactionOverview({ txOverview }: StakeTransactionOverviewProps) {
  if (txOverview.status !== 'success') {
    const placeholder = '-'

    return (
      <TransactionOverview showSkyBadge>
        {txOverview.showEstimatedRewards && (
          <TransactionOverview.Row>
            <TransactionOverview.Label>Estimated rewards</TransactionOverview.Label>
            <TransactionOverview.Generic>{placeholder}</TransactionOverview.Generic>
          </TransactionOverview.Row>
        )}
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
  const { apy, stakingToken, rewardToken, rewardsPerYear, routeToStakingToken } = txOverview

  assert(routeToStakingToken.length > 0, 'Route must have at least one item')
  const stakingTokenRouteItem = routeToStakingToken.at(-1)!

  const route: RouteItem[] = [
    ...routeToStakingToken.map(
      (item) =>
        ({
          type: 'token-amount',
          token: item.token,
          amount: item.value,
          usdAmount: item.usdValue,
        }) as const,
    ),
    {
      type: 'generic',
      upperText: `${rewardToken.symbol} Farm`,
      lowerText: `${stakingToken.symbol} Deposited`,
      upperTextDataTestId: testIds.farmDetails.stakeDialog.transactionOverview.route.destination.farmName,
      lowerTextDataTestId: testIds.farmDetails.stakeDialog.transactionOverview.route.destination.stakingToken,
    },
  ]

  return (
    <TransactionOverview showSkyBadge>
      {txOverview.showEstimatedRewards && (
        <TransactionOverview.Row>
          <TransactionOverview.Label>Estimated rewards</TransactionOverview.Label>
          <TransactionOverview.FarmApy apy={apy} rewardsPerYear={rewardsPerYear} rewardToken={rewardToken} />
        </TransactionOverview.Row>
      )}
      <TransactionOverview.Row>
        <TransactionOverview.Label>Route</TransactionOverview.Label>
        <TransactionOverview.Route route={route} />
      </TransactionOverview.Row>
      <TransactionOverview.Row>
        <TransactionOverview.Label>Outcome</TransactionOverview.Label>
        <TransactionOverview.StakedInFarm
          token={stakingToken}
          amount={stakingTokenRouteItem.value}
          farmName={`${rewardToken.symbol} Farm`}
        />
      </TransactionOverview.Row>
    </TransactionOverview>
  )
}

export {
  StakeTransactionOverview as TransactionOverview,
  type StakeTransactionOverviewProps as TransactionOverviewProps,
}
