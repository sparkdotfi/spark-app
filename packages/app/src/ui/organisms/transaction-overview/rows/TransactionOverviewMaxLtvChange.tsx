import { formatPercentage } from '@/domain/common/format'
import { testIds } from '@/ui/utils/testIds'
import { Percentage } from '@sparkdotfi/common-universal'
import { MoveRightIcon } from 'lucide-react'

interface TransactionOverviewMaxLtvChangeProps {
  currentMaxLTV: Percentage
  updatedMaxLTV?: Percentage
}

export function TransactionOverviewMaxLtvChange({
  currentMaxLTV,
  updatedMaxLTV,
}: TransactionOverviewMaxLtvChangeProps) {
  if (!updatedMaxLTV) {
    return (
      <div
        className="typography-label-2 text-primary"
        data-testid={testIds.dialog.eMode.transactionOverview.maxLtv.before}
      >
        {formatPercentage(currentMaxLTV)}
      </div>
    )
  }

  return (
    <div className="typography-label-2 flex items-center gap-2.5 text-primary">
      <div data-testid={testIds.dialog.eMode.transactionOverview.maxLtv.before}>{formatPercentage(currentMaxLTV)}</div>
      <MoveRightIcon className="icon-xxs icon-secondary" />
      <div data-testid={testIds.dialog.eMode.transactionOverview.maxLtv.after}>{formatPercentage(updatedMaxLTV)}</div>
    </div>
  )
}
