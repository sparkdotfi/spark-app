import { colors } from '@/ui/charts/colors'
import { Margins, defaultMargins } from '@/ui/charts/defaults'
import { useElementSize } from '@/ui/utils/useElementSize'
import { Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { Circle } from 'lucide-react'
import { Chart } from './components/Chart'
import { getYields } from './logic/getYields'

export interface InterestYieldChartProps {
  optimalUtilizationRate: Percentage
  utilizationRate: Percentage
  variableRateSlope1: BigNumber
  variableRateSlope2: BigNumber
  baseVariableBorrowRate: BigNumber
}
export function InterestYieldChart({
  optimalUtilizationRate,
  utilizationRate,
  variableRateSlope1,
  variableRateSlope2,
  baseVariableBorrowRate,
}: InterestYieldChartProps) {
  const [ref, { width }] = useElementSize()

  const yields = getYields({
    optimalUtilizationRate,
    variableRateSlope1,
    variableRateSlope2,
    baseVariableBorrowRate,
  })

  const chartProps: React.ComponentProps<typeof Chart> & { margins: Margins } = {
    data: yields,
    width,
    height: 180,
    optimalUtilizationRate,
    utilizationRate,
    margins: { ...defaultMargins },
  }

  // if distance between optimal and current utilization rate is small, put the utilization rate label higher
  if (optimalUtilizationRate.minus(utilizationRate).abs().lt(0.1)) {
    chartProps.utilizationRateLabelMargin = -25
    chartProps.margins.top += 25
    chartProps.height += 25
  }

  // if optimal utilization rate is close to 100%, increase the right margin so that label fits
  if (optimalUtilizationRate.minus(1).abs().lt(0.05)) {
    chartProps.margins.right += 5
  }

  return (
    <div ref={ref}>
      <div className="ml-10 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Circle size={4} fill={colors.primary} stroke="0" />
          <div className="typography-label-4 text-secondary">Borrow APY</div>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle size={4} fill={colors.secondary} stroke="0" />
          <div className="typography-label-4 text-secondary">Utilization Rate</div>
        </div>
      </div>
      <Chart {...chartProps} />
    </div>
  )
}
