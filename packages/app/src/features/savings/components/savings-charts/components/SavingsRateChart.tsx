import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { ChartTooltipContent } from '@/ui/charts/ChartTooltipContent'
import { colors } from '@/ui/charts/colors'
import { Margins, POINT_RADIUS, defaultMargins } from '@/ui/charts/defaults'
import { formatPercentageTick, formatTooltipDate, getVerticalDomainWithPadding } from '@/ui/charts/utils'
import { Percentage } from '@sparkdotfi/common-universal'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { curveStepAfter } from '@visx/curve'
import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { ContinuousDomain, scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { TooltipWithBounds, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { extent, max } from 'd3-array'
import { MouseEvent, TouchEvent } from 'react'

export interface ChartDataPoint {
  date: Date
  rate: Percentage
}

export interface SavingsRateChartProps {
  height: number
  width: number
  margins?: Margins
  xAxisNumTicks?: number
  yAxisNumTicks?: number
  data: ChartDataPoint[]
  tooltipLabel: string
  savingsToken: Token
}

function SavingsRateChart({
  height,
  width,
  margins = defaultMargins,
  xAxisNumTicks = 5,
  yAxisNumTicks = 5,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipLeft = 0,
  data,
  tooltipLabel,
  savingsToken,
}: SavingsRateChartProps & WithTooltipProvidedProps<ChartDataPoint>) {
  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom
  const primaryColor = savingsTokenToAccentColor(savingsToken)

  const xValueScale = scaleTime({
    range: [0, innerWidth],
    domain: extent(data, ({ date }) => date) as [Date, Date],
  })
  const yValueScale = scaleLinear({
    range: [innerHeight, 0],
    domain: calculateRateDomain(data),
    nice: true,
  })

  function handleTooltip(event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>): void {
    const point = localPoint(event) || { x: 0 }
    const x = point.x - margins.left + POINT_RADIUS
    const domainX = xValueScale.invert(x)

    const lastSmallerElement =
      data.reduce(
        (prev, curr) => (curr.date.getTime() < domainX.getTime() ? curr : prev),
        null as ChartDataPoint | null,
      ) || data[0]

    showTooltip({
      tooltipData: lastSmallerElement,
      tooltipLeft: x,
    })
  }

  return (
    <div>
      <svg width={width} height={height}>
        <Group left={margins.left} top={margins.top}>
          <GridRows
            scale={yValueScale}
            width={innerWidth}
            strokeDasharray="3"
            stroke={colors.backgroundLine}
            strokeWidth={1}
            pointerEvents="none"
          />

          <LinearGradient id="area-gradient" from={primaryColor} to={primaryColor} fromOpacity={0.5} toOpacity={0} />

          <AreaClosed
            strokeWidth={2}
            data={data}
            x={(data) => xValueScale(data.date)}
            y={(data) => yValueScale(data.rate.toNumber())}
            yScale={yValueScale}
            curve={curveStepAfter}
            fill="url(#area-gradient)"
          />

          <LinePath
            stroke={primaryColor}
            strokeWidth={2}
            data={data}
            x={(data) => xValueScale(data.date)}
            y={(data) => yValueScale(data.rate.toNumber())}
            curve={curveStepAfter}
          />

          <AxisBottom
            top={innerHeight - margins.bottom / 4}
            scale={xValueScale}
            strokeWidth={0}
            numTicks={xAxisNumTicks}
            tickLabelProps={() => ({
              fill: colors.axisTickLabel,
              fontSize: 10,
              textAnchor: 'middle',
              dy: 4,
            })}
          />

          <AxisLeft
            left={0}
            scale={yValueScale}
            strokeWidth={0}
            numTicks={yAxisNumTicks}
            tickFormat={formatPercentageTick}
            tickLabelProps={() => ({
              fill: colors.axisTickLabel,
              fontSize: 10,
              dx: -margins.left + 10,
              dy: 3,
            })}
          />

          <Bar
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={hideTooltip}
          />

          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: innerHeight }}
                stroke={colors.tooltipLine}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="3"
              />
              <circle
                cx={tooltipLeft}
                cy={yValueScale(tooltipData.rate.toNumber())}
                r={8}
                fill={primaryColor}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={yValueScale(tooltipData.rate.toNumber())}
                r={4}
                fill={colors.dot}
                stroke={colors.dotStroke}
                strokeWidth={3}
                pointerEvents="none"
              />
            </g>
          )}
        </Group>
      </svg>

      {tooltipData && (
        <TooltipWithBounds top={20} left={tooltipLeft + 40} unstyled applyPositionStyle className="pointer-events-none">
          <TooltipContent data={tooltipData} tooltipLabel={tooltipLabel} primaryColor={primaryColor} />
        </TooltipWithBounds>
      )}
    </div>
  )
}

function TooltipContent({
  data,
  tooltipLabel,
  primaryColor,
}: { data: ChartDataPoint; tooltipLabel: string; primaryColor: string }) {
  return (
    <ChartTooltipContent>
      <ChartTooltipContent.Date>{formatTooltipDate(data.date)}</ChartTooltipContent.Date>
      <ChartTooltipContent.Value dotColor={primaryColor}>
        {tooltipLabel}: {formatPercentage(data.rate, { minimumFractionDigits: 0 })}
      </ChartTooltipContent.Value>
    </ChartTooltipContent>
  )
}

function calculateRateDomain(data: ChartDataPoint[]): ContinuousDomain {
  const maxRate = max(data, (d) => d.rate.toNumber()) || 0

  return getVerticalDomainWithPadding(0, maxRate)
}

const SavingsRateChartWithTooltip = withTooltip<SavingsRateChartProps, ChartDataPoint>(SavingsRateChart)

export { SavingsRateChartWithTooltip as SavingsRateChart }

function savingsTokenToAccentColor(savingsToken: Token): string {
  switch (savingsToken.symbol.toLowerCase()) {
    case 'susdc':
      return '#61B7A1'
    case 'sdai':
      return '#91CF51'
    case 'susds':
      return '#6EC275'
    default:
      return '#6EC275'
  }
}
