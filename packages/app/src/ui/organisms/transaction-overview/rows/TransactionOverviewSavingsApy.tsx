import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { HorizontalScroll } from '@/ui/atoms/horizontal-scroll/HorizontalScroll'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

export interface TransactionOverviewSavingsApyProps {
  apy: Percentage
  stableEarnRate: NormalizedNumber
  underlyingToken: Token
}

export function TransactionOverviewSavingsApy({
  apy,
  stableEarnRate,
  underlyingToken,
}: TransactionOverviewSavingsApyProps) {
  return (
    <HorizontalScroll>
      <div className="flex items-baseline gap-2">
        {apy.gt(0) && (
          <div
            data-testid={testIds.dialog.savings.transactionOverview.apy.value}
            className="typography-label-2 text-primary"
          >
            {formatPercentage(apy)}
          </div>
        )}
        <div
          className="typography-body-4 text-secondary"
          data-testid={testIds.dialog.savings.transactionOverview.apy.description}
        >
          Earn ~{underlyingToken.format(stableEarnRate, { style: 'auto' })} {underlyingToken.symbol}/year
        </div>
      </div>
    </HorizontalScroll>
  )
}
