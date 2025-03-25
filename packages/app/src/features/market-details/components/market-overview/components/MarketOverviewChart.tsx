import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { getArcs, getSeparators } from '@/ui/utils/chart-math'
import { cn } from '@/ui/utils/style'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

interface MarketOverviewChartProps {
  data: { value: number; color: string }[]
  token: Token
  marketSize: NormalizedUnitNumber
  borrowed: NormalizedUnitNumber
  utilizationRate: Percentage
  className?: string
}

export function MarketOverviewChart({
  data: _data,
  token,
  marketSize,
  borrowed,
  utilizationRate,
  className,
}: MarketOverviewChartProps) {
  const totalValue = _data.reduce((acc, curr) => acc + curr.value, 0)
  const data = _data.filter(({ value }) => value / totalValue > 0.005) // @note: filter out values that are smaller than 0.5% of total

  const radius = 175
  const strokeWidth = 30
  const arcs = getArcs({ data, cx: 200, cy: 200, radius })
  const separators = getSeparators({
    data,
    unfilteredData: _data,
    cx: 200,
    cy: 200,
    radius,
    mainStrokeWidth: strokeWidth,
  })

  return (
    <div
      className={cn('relative isolate h-fit w-full', className)}
      style={{
        container: 'sidebar / inline-size',
      }}
    >
      <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 400 400">
        {arcs.map((point) => {
          if (point.angle <= 0) {
            return null
          }

          return (
            <path
              d={`M${point.x1} ${point.y1} A${radius} ${radius} 0 ${point.angle > Math.PI ? '1' : '0'} 1 ${point.x2} ${point.y2}`}
              fill="none"
              stroke={point.color}
              strokeWidth={strokeWidth}
              key={`${point.x1}${point.y1}${point.x2}${point.y2}`}
            />
          )
        })}
        {separators.map((separator) => (
          <path
            d={`M${separator.x1} ${separator.y1} L${separator.x2} ${separator.y2}`}
            fill="none"
            stroke="black"
            strokeWidth={2}
            key={`${separator.x1}${separator.y1}${separator.x2}${separator.y2}`}
          />
        ))}
      </svg>
      <div className="-z-10 absolute inset-0">
        <div className="flex h-full w-full flex-col items-center justify-center gap-[2cqw] text-primary-inverse">
          <div className="font-roobert text-[4.5cqw] text-tertiary">Utilization rate</div>
          <div className="text-[14cqw] text-primary-inverse">{formatPercentage(utilizationRate)}</div>
          <div className="font-roobert text-[4.5cqw] text-tertiary">
            {token.formatUSD(borrowed, { compact: true })} of {token.formatUSD(marketSize, { compact: true })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const colors = {
  borrow: '#FD895C',
  available: '#00D9B1',
  sky: '#6A4DFF',
}
