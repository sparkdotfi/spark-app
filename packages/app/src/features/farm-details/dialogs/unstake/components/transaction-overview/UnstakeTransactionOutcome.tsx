import { Token } from '@/domain/types/Token'
import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { TokenAmount } from '@/ui/molecules/token-amount/TokenAmount'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface UnstakeTransactionOutcomeProps {
  outcomeTokenRouteItem: TxOverviewRouteItem
  rewardToken: Token
  isExiting: boolean
  earnedRewards: NormalizedNumber
}

export function UnstakeTransactionOutcome({
  outcomeTokenRouteItem,
  rewardToken,
  isExiting,
  earnedRewards,
}: UnstakeTransactionOutcomeProps) {
  const outcomeToken = outcomeTokenRouteItem.token

  const exitContent = (() => {
    if (isExiting) {
      return (
        <div className="flex items-center gap-2">
          <TokenAmount
            token={outcomeToken}
            amount={outcomeTokenRouteItem.value}
            usdAmount={outcomeTokenRouteItem.usdValue}
            variant="horizontal"
            amountDataTestId={testIds.farmDetails.unstakeDialog.transactionOverview.outcome}
            usdAmountDataTestId={testIds.farmDetails.unstakeDialog.transactionOverview.outcomeUsd}
          />
          <div className="text-secondary">+</div>
          <TokenAmount
            token={rewardToken}
            amount={earnedRewards}
            variant="horizontal"
            amountDataTestId={testIds.farmDetails.unstakeDialog.transactionOverview.rewardOutcome}
            usdAmountDataTestId={testIds.farmDetails.unstakeDialog.transactionOverview.rewardOutcomeUsd}
          />
        </div>
      )
    }

    return (
      <TokenAmount
        token={outcomeToken}
        amount={outcomeTokenRouteItem.value}
        usdAmount={outcomeTokenRouteItem.usdValue}
        variant="horizontal"
        amountDataTestId={testIds.farmDetails.unstakeDialog.transactionOverview.outcome}
        usdAmountDataTestId={testIds.farmDetails.unstakeDialog.transactionOverview.outcomeUsd}
      />
    )
  })()

  return exitContent
}
