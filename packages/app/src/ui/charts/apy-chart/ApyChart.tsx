import { formatPercentage } from '@/domain/common/format'
import { ChartTooltipContent } from '@/ui/charts/ChartTooltipContent'
import { colors as colorsPreset } from '@/ui/charts/colors'
import { Margins, defaultMargins } from '@/ui/charts/defaults'
import { formatPercentageTick, formatTooltipDate, getVerticalDomainWithPadding } from '@/ui/charts/utils'
import { cn } from '@/ui/utils/style'
import { Percentage } from '@marsfoundation/common-universal'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { curveCardinal } from '@visx/curve'
import { localPoint } from '@visx/event'
import { LinearGradient } from '@visx/gradient'
import { GridRows } from '@visx/grid'
import { Group } from '@visx/group'
import { ContinuousDomain, scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape'
import { TooltipWithBounds, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { extent, max, min } from 'd3-array'
import { Fragment, MouseEvent, TouchEvent, useId } from 'react'

export interface ChartDataPoint {
  date: Date
  apy: Percentage
}

export interface ChartProps {
  height: number
  width: number
  margins?: Margins
  xAxisNumTicks?: number
  yAxisNumTicks?: number
  data: ChartDataPoint[]
  primaryColor: string
  lineColorClassName?: string
}

function Chart({
  height,
  width,
  margins = defaultMargins,
  xAxisNumTicks = 5,
  yAxisNumTicks = 5,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipLeft = 0,
  data: _data,
  primaryColor,
  lineColorClassName,
}: ChartProps & WithTooltipProvidedProps<ChartDataPoint>) {
  const componentId = useId()

  const data = _data.sort((a, b) => a.date.getTime() - b.date.getTime())

  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom

  const xValueScale = scaleTime({
    range: [0, innerWidth],
    domain: extent(data, ({ date }) => date) as [Date, Date],
  })
  const yValueScale = scaleLinear({
    range: [innerHeight, 0],
    domain: calculateAprDomain(data),
    nice: true,
  })

  function handleTooltip(event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>): void {
    const point = localPoint(event) || { x: 0 }
    const x = point.x - margins.left
    const domainX = xValueScale.invert(x)

    const lastSmallerElement =
      data.reduce(
        (prev, curr) => (curr.date.getTime() < domainX.getTime() ? curr : prev),
        null as ChartDataPoint | null,
      ) || data[0]

    if (lastSmallerElement) {
      showTooltip({
        tooltipData: lastSmallerElement,
        tooltipLeft: xValueScale(lastSmallerElement.date),
      })
    }
  }

  return (
    <div className="relative isolate">
      <svg width={width} height={height} className="absolute inset-0 z-[-2]">
        <Group left={margins.left} top={margins.top}>
          <GridRows
            scale={yValueScale}
            width={innerWidth}
            strokeDasharray="3"
            stroke={colorsPreset.backgroundLine}
            strokeWidth={1}
            pointerEvents="none"
            numTicks={yAxisNumTicks}
          />
        </Group>
      </svg>
      {lineColorClassName && (
        <>
          <div
            className={cn('pointer-events-none absolute z-[-1]', lineColorClassName)}
            style={{
              maskImage: `url(#line-mask-${componentId})`,
              left: margins.left,
              top: margins.top,
              width: innerWidth,
              height: innerHeight,
            }}
          />
          <div
            className={cn('pointer-events-none absolute z-[-1]', lineColorClassName)}
            style={{
              maskImage: `url(#circle-mask-${componentId})`,
              left: margins.left,
              top: margins.top,
              width: innerWidth,
              height: innerHeight,
            }}
          />
        </>
      )}
      <svg width={width} height={height}>
        <Group left={margins.left} top={margins.top}>
          {lineColorClassName ? (
            <defs>
              <mask id={`line-mask-${componentId}`}>
                <LinePath
                  stroke="white"
                  strokeWidth={2}
                  data={data}
                  x={(data) => xValueScale(data.date)}
                  y={(data) => yValueScale(data.apy.toNumber())}
                  curve={curveCardinal}
                />
              </mask>
            </defs>
          ) : (
            <LinePath
              stroke={primaryColor}
              strokeWidth={2}
              data={data}
              x={(data) => xValueScale(data.date)}
              y={(data) => yValueScale(data.apy.toNumber())}
              curve={curveCardinal}
            />
          )}

          <LinearGradient
            id={`area-gradient-${componentId}`}
            from={primaryColor}
            to={primaryColor}
            fromOpacity={0.5}
            toOpacity={0}
          />
          <AreaClosed
            strokeWidth={2}
            data={data}
            x={(data) => xValueScale(data.date)}
            y={(data) => yValueScale(data.apy.toNumber())}
            yScale={yValueScale}
            curve={curveCardinal}
            fill={`url(#area-gradient-${componentId})`}
          />

          <AxisBottom
            top={innerHeight - margins.bottom / 4}
            scale={xValueScale}
            strokeWidth={0}
            numTicks={xAxisNumTicks}
            tickLabelProps={() => ({
              fill: colorsPreset.axisTickLabel,
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
              fill: colorsPreset.axisTickLabel,
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
                stroke={colorsPreset.tooltipLine}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="3"
              />
              <Fragment>
                {lineColorClassName ? (
                  <defs>
                    <mask id={`circle-mask-${componentId}`}>
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(tooltipData.apy.toNumber())}
                        r={8}
                        fill="white"
                        pointerEvents="none"
                      />
                    </mask>
                  </defs>
                ) : (
                  <circle
                    cx={tooltipLeft}
                    cy={yValueScale(tooltipData.apy.toNumber())}
                    r={8}
                    fill={primaryColor}
                    pointerEvents="none"
                  />
                )}
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(tooltipData.apy.toNumber())}
                  r={4}
                  fill={colorsPreset.dot}
                  stroke={colorsPreset.dotStroke}
                  strokeWidth={3}
                  pointerEvents="none"
                />
              </Fragment>
            </g>
          )}
        </Group>
      </svg>

      {tooltipData && (
        <TooltipWithBounds top={20} left={tooltipLeft + 40} unstyled applyPositionStyle className="pointer-events-none">
          <TooltipContent data={tooltipData} primaryColor={primaryColor} lineColorClassName={lineColorClassName} />
        </TooltipWithBounds>
      )}
    </div>
  )
}

function TooltipContent({
  data,
  primaryColor,
  lineColorClassName,
}: { data: ChartDataPoint; primaryColor: string; lineColorClassName?: string }) {
  const valueProps = lineColorClassName ? { dotClassName: lineColorClassName } : { dotColor: primaryColor }

  return (
    <ChartTooltipContent>
      <ChartTooltipContent.Date>{formatTooltipDate(data.date)}</ChartTooltipContent.Date>
      <ChartTooltipContent.Value {...valueProps}>
        APY: {formatPercentage(data.apy, { minimumFractionDigits: 0 })}
      </ChartTooltipContent.Value>
    </ChartTooltipContent>
  )
}

function calculateAprDomain(data: ChartDataPoint[]): ContinuousDomain {
  const minApr = min(data, (d) => d.apy.toNumber()) || 0
  const maxApr = max(data, (d) => d.apy.toNumber()) || 0

  return getVerticalDomainWithPadding(minApr, maxApr)
}

const ChartWithTooltip = withTooltip<ChartProps, ChartDataPoint>(Chart)
export { ChartWithTooltip as ApyChart }
