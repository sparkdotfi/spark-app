import { TokenWithBalance } from '@/domain/common/types'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { getTokenColor, getTokenImage } from '@/ui/assets'
import { getArcs, getSeparators } from '@/ui/utils/chart-math'
import { getRandomColor } from '@/ui/utils/get-random-color'
import { cn } from '@/ui/utils/style'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { useState } from 'react'

export interface MyWalletChartProps {
  assets: TokenWithBalance[]
  className?: string
}

export function MyWalletChart({ assets, className }: MyWalletChartProps) {
  const totalUsd = assets.reduce((acc, asset) => acc.plus(asset.token.toUSD(asset.balance)), NormalizedNumber.ZERO)
  const displayedAssets = assets.filter((asset) => asset.token.toUSD(asset.balance).div(totalUsd).gt(0.005)) // @note: filter out values that are smaller than 0.5% of total
  const data = displayedAssets.map((asset) => ({
    value: asset.token.toUSD(asset.balance).toNumber(),
    color: getTokenColor(asset.token.symbol, { fallback: getRandomColor() }),
  }))
  const unfilteredData = assets.map((asset) => ({
    value: asset.token.toUSD(asset.balance).toNumber(),
    color: getTokenColor(asset.token.symbol, { fallback: getRandomColor() }),
  }))

  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined)
  const highlightedAsset = highlightedIndex === undefined ? undefined : displayedAssets[highlightedIndex]

  const radius = 175
  const auxiliaryRadius = radius - 40
  const strokeWidth = 50
  const arcs = getArcs({ data, cx: 200, cy: 200, radius })
  const auxillaryArcs = getArcs({ data, cx: 200, cy: 200, radius: auxiliaryRadius, marginAngle: 1 })
  const separators = getSeparators({
    data,
    unfilteredData,
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
        {arcs.map((point, index) => {
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
              onMouseEnter={() => {
                setHighlightedIndex(index)
              }}
              onMouseLeave={() => {
                setHighlightedIndex(undefined)
              }}
            />
          )
        })}
        {displayedAssets.length > 0 &&
          auxillaryArcs.map((point, index) => {
            if (point.angle <= 0) {
              return null
            }

            return (
              <path
                d={`M${point.x1} ${point.y1} A${auxiliaryRadius} ${auxiliaryRadius} 0 ${point.angle > Math.PI ? '1' : '0'} 1 ${point.x2} ${point.y2}`}
                fill="none"
                stroke={highlightedIndex === index ? '#FFFFFF' : '#58585B'}
                strokeWidth={2}
                key={`${point.x1}${point.y1}${point.x2}${point.y2}`}
              />
            )
          })}
        {separators.length > 1 &&
          separators.map((separator) => (
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
        <div
          className="flex h-full w-full animate-reveal flex-col items-center justify-center text-primary-inverse duration-500 ease-out"
          key={displayedAssets.length > 0 ? highlightedIndex : undefined}
        >
          {highlightedAsset === undefined ? (
            <div className="flex flex-col items-center gap-[1.5cqw]">
              <div className="font-roobert text-[3.5cqw]">TOTAL</div>
              <div className="text-[7cqw]">{USD_MOCK_TOKEN.formatUSD(totalUsd)}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-[1.5cqw] text-primary-inverse">
              <div className="flex items-center gap-[2cqw]">
                <img src={getTokenImage(highlightedAsset.token.symbol)} className="h-[6cqw] w-[6cqw]" />
                <div className="font-roobert text-[3.5cqw]">{highlightedAsset.token.symbol}</div>
              </div>
              <div className="text-[7cqw]">
                {highlightedAsset.token.format(highlightedAsset.balance, { style: 'auto' })}
              </div>
              <div className="font-roobert text-[3.5cqw] text-secondary">
                {highlightedAsset.token.formatUSD(highlightedAsset.balance)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
