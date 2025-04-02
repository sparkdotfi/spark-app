import { AxisBottom, AxisLeft } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { ContinuousDomain, scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { TooltipWithBounds, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { extent, max, min } from 'd3-array'
import { MouseEvent, TouchEvent } from 'react'

import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { ChartTooltipContent } from '@/ui/charts/ChartTooltipContent'
import { colors as colorsPreset } from '@/ui/charts/colors'
import { Margins, POINT_RADIUS, defaultMargins } from '@/ui/charts/defaults'
import { formatTooltipDate, formatUSDTicks, getVerticalDomainWithPadding } from '@/ui/charts/utils'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface ChartDataPoint {
  balance: NormalizedNumber
  date: Date
}

const colors = {
  ...colorsPreset,
  secondary: '#BECAF9',
}

export interface ChartProps {
  height: number
  width: number
  margins?: Margins
  xAxisNumTicks?: number
  yAxisNumTicks?: number
  data: ChartDataPoint[]
  predictions: ChartDataPoint[]
}

function MyEarningsChart({
  height,
  width,
  margins = defaultMargins,
  xAxisNumTicks = 3,
  yAxisNumTicks = 5,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipLeft = 0,
  data,
  predictions,
}: ChartProps & WithTooltipProvidedProps<ChartDataPoint>) {
  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom
  const xAxisData = [...data, ...predictions]

  const xValueScale = scaleTime({
    range: [0, innerWidth],
    domain: extent(xAxisData, ({ date }) => date) as [Date, Date],
  })
  const yValueScale = scaleLinear({
    range: [innerHeight, 0],
    domain: calculateBalanceDomain(xAxisData),
    nice: true,
  })

  function handleTooltip(event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>): void {
    const point = localPoint(event) || { x: 0 }
    // @note radius is added to make last point accessible for tooltip
    const x = point.x - margins.left + POINT_RADIUS
    const domainX = xValueScale.invert(x)
    const lastSmallerElement =
      xAxisData.reduce(
        (prev, curr) => (curr.date.getTime() < domainX.getTime() ? curr : prev),
        null as ChartDataPoint | null,
      ) || xAxisData[0]

    if (lastSmallerElement) {
      showTooltip({
        tooltipData: lastSmallerElement,
        tooltipLeft: xValueScale(lastSmallerElement.date),
      })
    }
  }

  const dataLastElement = data[data.length - 1]

  const chartParts = [
    {
      key: 'predictions',
      balance: predictions,
      color: colors.secondary,
    },
    {
      key: 'data',
      balance: data,
      color: colors.primary,
    },
  ]

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
            numTicks={yAxisNumTicks}
          />

          {chartParts.map(({ balance, color, key }) => (
            <g key={key}>
              <LinearGradient id={`area-gradient-${key}`} from={color} to={color} fromOpacity={0.5} toOpacity={0} />

              <AreaClosed
                strokeWidth={2}
                data={balance}
                x={(data) => xValueScale(data.date)}
                y={(data) => yValueScale(data.balance.toNumber())}
                yScale={yValueScale}
                curve={curveLinear}
                fill={`url(#area-gradient-${key})`}
              />

              <LinePath
                stroke={color}
                strokeWidth={2}
                data={balance}
                x={(data) => xValueScale(data.date)}
                y={(data) => yValueScale(data.balance.toNumber())}
                curve={curveLinear}
              />
            </g>
          ))}

          {dataLastElement && (
            <circle
              cx={xValueScale(dataLastElement.date)}
              cy={yValueScale(dataLastElement.balance.toNumber())}
              r={POINT_RADIUS}
              fill={colors.primary}
              pointerEvents="none"
            />
          )}

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
            tickFormat={formatUSDTicks}
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
                cy={yValueScale(tooltipData.balance.toNumber())}
                r={8}
                fill={colors.primary}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={yValueScale(tooltipData.balance.toNumber())}
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
          <TooltipContent data={tooltipData} />
        </TooltipWithBounds>
      )}
    </div>
  )
}

function TooltipContent({ data }: { data: ChartDataPoint }) {
  const isPrediction = isDataPointPrediction(data)

  return (
    <ChartTooltipContent>
      <ChartTooltipContent.Date>{formatTooltipDate(data.date)}</ChartTooltipContent.Date>
      <ChartTooltipContent.Value dotColor={isPrediction ? colors.secondary : colors.primary}>
        Savings{isPrediction && ' Prediction'}: {USD_MOCK_TOKEN.formatUSD(data.balance)}
      </ChartTooltipContent.Value>
    </ChartTooltipContent>
  )
}

function isDataPointPrediction(dataPoint: ChartDataPoint): boolean {
  return Date.now() < dataPoint.date.getTime()
}

function calculateBalanceDomain(data: ChartDataPoint[]): ContinuousDomain {
  const minBalance = min(data, (d) => d.balance.toNumber()) || 0
  const maxBalance = max(data, (d) => d.balance.toNumber()) || 0

  return getVerticalDomainWithPadding(minBalance, maxBalance)
}

const MyEarningsChartWithTooltip = withTooltip<ChartProps, ChartDataPoint>(MyEarningsChart)

export { MyEarningsChartWithTooltip as MyEarningsChart }
