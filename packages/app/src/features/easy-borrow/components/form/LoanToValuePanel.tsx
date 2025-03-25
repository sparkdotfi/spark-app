import { formatPercentage } from '@/domain/common/format'
import { Panel } from '@/ui/atoms/panel/Panel'
import { testIds } from '@/ui/utils/testIds'
import { nonZeroOrDefault } from '@/utils/bigNumber'
import { Percentage } from '@sparkdotfi/common-universal'
import { LoanToValueSlider } from './LoanToValueSlider'

interface LoanToValuePanelProps {
  ltv: Percentage
  maxLtv: Percentage
  liquidationLtv: Percentage
  onLtvChange: (value: Percentage) => void
  disabled?: boolean
  className?: string
}
export function LoanToValuePanel({
  ltv,
  maxLtv,
  liquidationLtv,
  onLtvChange,
  disabled,
  className,
}: LoanToValuePanelProps) {
  return (
    <Panel className={className}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="typography-heading-5 flex flex-row justify-between text-primary">
            <h4>Loan to Value (LTV)</h4>
            <h4 data-testid={testIds.easyBorrow.form.ltv}>{formatPercentage(ltv)}</h4>
          </div>

          <div className="typography-label-3 mt-2 flex flex-row justify-between text-secondary">
            <div>Ratio of the collateral value to the borrowed value</div>
            <div className="text-right">max. {formatPercentage(maxLtv)}</div>
          </div>
        </div>

        <LoanToValueSlider
          ltv={ltv}
          liquidationLtv={nonZeroOrDefault(liquidationLtv, Percentage(0.8))}
          maxAvailableLtv={nonZeroOrDefault(maxLtv, Percentage(0.825))}
          onLtvChange={onLtvChange}
          disabled={disabled}
        />
      </div>
    </Panel>
  )
}
