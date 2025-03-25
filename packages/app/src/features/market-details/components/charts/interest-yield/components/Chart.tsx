import { formatPercentage } from '@/domain/common/format'
import { colors as chartColors } from '@/ui/charts/colors'
import { Margins, defaultMargins } from '@/ui/charts/defaults'
import { formatPercentageTick } from '@/ui/charts/utils'
import { Percentage } from '@sparkdotfi/common-universal'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { curveLinear } from '@visx/curve'
import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { Text } from '@visx/text'
import { TooltipWithBounds, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { extent, max, minIndex } from 'd3-array'
import { Fragment, MouseEvent, TouchEvent } from 'react'
import { GraphDataPoint } from '../types'

const colors = { ...chartColors, primary: '#FFA480', secondary: '#7A6BFF' }

export interface ChartProps {
  width: number
  height: number
  margins?: Margins
  xAxisNumTicks?: number
  yAxisNumTicks?: number
  data: GraphDataPoint[]
  optimalUtilizationRate: Percentage
  utilizationRate: Percentage
  utilizationRateLabelMargin?: number
}

function Chart({
  width,
  height,
  margins = defaultMargins,
  xAxisNumTicks = 5,
  yAxisNumTicks = 5,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipLeft = 0,
  data,
  optimalUtilizationRate,
  utilizationRate,
  utilizationRateLabelMargin = 0,
}: ChartProps & WithTooltipProvidedProps<GraphDataPoint>) {
  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom

  const xValueScale = scaleLinear({
    range: [0, innerWidth],
    domain: extent(data, ({ x }) => x) as [number, number],
  })
  const yValueScale = scaleLinear({
    range: [innerHeight, 0],
    domain: [0, (max(data, (d) => d.y) || 0) * 1.1], // 10% padding on top
    nice: true,
  })

  function handleTooltip(event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>): void {
    const point = localPoint(event) || { x: 0 }
    const x = point.x - margins.left
    const domainX = xValueScale.invert(x)
    const closestElement = data[minIndex(data, (d) => Math.abs(d.x - domainX))]
    showTooltip({
      tooltipData: closestElement,
      tooltipLeft: x,
    })
  }

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margins.left} top={margins.top}>
          <GridRows
            scale={yValueScale}
            width={innerWidth}
            strokeDasharray="3"
            stroke={colors.backgroundLine}
            strokeWidth={1}
            pointerEvents="none"
            numTicks={5}
          />

          <LinePath
            stroke={colors.primary}
            strokeWidth={2}
            data={data}
            x={(data) => xValueScale(data.x)}
            y={(data) => yValueScale(data.y)}
            curve={curveLinear}
          />

          <LinearGradient
            id="area-gradient"
            from={colors.primary}
            to={colors.primary}
            fromOpacity={0.5}
            toOpacity={0}
          />

          <AreaClosed
            strokeWidth={2}
            data={data}
            x={(data) => xValueScale(data.x)}
            y={(data) => yValueScale(data.y)}
            yScale={yValueScale}
            curve={curveLinear}
            fill="url(#area-gradient)"
          />

          <AxisBottom
            top={innerHeight - margins.bottom / 4}
            scale={xValueScale}
            strokeWidth={0}
            numTicks={xAxisNumTicks}
            tickFormat={formatPercentageTick}
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

          <UtilizationLine
            label="Current"
            value={utilizationRate}
            xValueScale={xValueScale}
            innerHeight={innerHeight}
            marginY={utilizationRateLabelMargin}
          />
          <UtilizationLine
            label="Optimal"
            value={optimalUtilizationRate}
            xValueScale={xValueScale}
            innerHeight={innerHeight}
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
              <Fragment>
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(tooltipData.y)}
                  r={8}
                  fill={colors.primary}
                  pointerEvents="none"
                />
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(tooltipData.y)}
                  r={4}
                  fill={colors.dot}
                  stroke={colors.dotStroke}
                  strokeWidth={3}
                  pointerEvents="none"
                />
              </Fragment>
            </g>
          )}
        </Group>
      </svg>

      {tooltipData && (
        <TooltipWithBounds top={20} left={tooltipLeft + 40} unstyled applyPositionStyle>
          <TooltipContent data={tooltipData} />
        </TooltipWithBounds>
      )}
    </>
  )
}

function TooltipContent({ data }: { data: GraphDataPoint }) {
  return (
    <div className="typography-label-4 flex gap-3 rounded-sm border border-primary bg-primary p-3 shadow">
      <div className="flex flex-col gap-3 text-secondary">
        <p>Utilization Rate:</p>
        <p>Borrow APY:</p>
      </div>
      <div className="flex flex-col gap-3 text-primary">
        <p>{formatPercentage(Percentage(data.x))}</p>
        <p>{formatPercentage(Percentage(data.y, { allowMoreThan1: true }))}</p>
      </div>
    </div>
  )
}

export interface UtilizationLineProps {
  label: string
  value: Percentage
  xValueScale: (value: number) => number
  innerHeight: number
  marginY?: number
}
export function UtilizationLine({ label, value, xValueScale, innerHeight, marginY = 0 }: UtilizationLineProps) {
  return (
    <>
      <Line
        from={{ x: xValueScale(value.toNumber()), y: marginY }}
        to={{ x: xValueScale(value.toNumber()), y: innerHeight }}
        stroke={colors.secondary}
        strokeWidth={2}
        pointerEvents="none"
        strokeDasharray="3"
      />
      <Text
        x={xValueScale(value.toNumber())}
        y={-23 + marginY}
        width={360}
        textAnchor="middle"
        verticalAnchor="middle"
        fontSize="10px"
        fill={colors.tooltipLine}
      >
        {label}
      </Text>
      <Text
        x={xValueScale(value.toNumber())}
        y={-10 + marginY}
        width={360}
        textAnchor="middle"
        verticalAnchor="middle"
        fontSize="10px"
        fill={colors.tooltipLine}
      >
        {formatPercentage(value)}
      </Text>
    </>
  )
}

const ChartWithTooltip = withTooltip<ChartProps, GraphDataPoint>(Chart)
export { ChartWithTooltip as Chart }
