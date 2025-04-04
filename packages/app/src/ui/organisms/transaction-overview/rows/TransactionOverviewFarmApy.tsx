import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { HorizontalScroll } from '@/ui/atoms/horizontal-scroll/HorizontalScroll'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

export interface TransactionOverviewFarmApyProps {
  apy: Percentage
  rewardsPerYear: NormalizedNumber
  rewardToken: Token
}

export function TransactionOverviewFarmApy({ apy, rewardsPerYear, rewardToken }: TransactionOverviewFarmApyProps) {
  return (
    <HorizontalScroll>
      <div className="flex h-[18px] items-baseline gap-2">
        {apy.gt(0) && (
          <div
            data-testid={testIds.farmDetails.stakeDialog.transactionOverview.estimatedRewards.apy}
            className="typography-label-2 text-primary"
          >
            {formatPercentage(apy)}
          </div>
        )}
        <div
          className="typography-body-4 text-secondary"
          data-testid={testIds.farmDetails.stakeDialog.transactionOverview.estimatedRewards.description}
        >
          Earn ~{rewardToken.format(rewardsPerYear, { style: 'auto' })} {rewardToken.symbol}/year
        </div>
      </div>
    </HorizontalScroll>
  )
}
