import { Token } from '@/domain/types/Token'
import { getTokenImage } from '@/ui/assets'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { getFractionalPart, getWholePart } from '@/utils/bigNumber'
import { useTimestamp } from '@/utils/useTimestamp'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { useMemo } from 'react'

const STEP_IN_MS = 50

export interface GrowingRewardProps {
  rewardToken: Token
  calculateReward: (timestampInMs: number) => NormalizedNumber
  refreshIntervalInMs: number | undefined
  wholePartTextBgGradientClass: string
  fractionalPartTextColorClass: string
  isOutOfSync?: boolean
}

export function GrowingReward({
  rewardToken,
  calculateReward,
  refreshIntervalInMs,
  wholePartTextBgGradientClass,
  fractionalPartTextColorClass,
  isOutOfSync,
}: GrowingRewardProps) {
  const { timestampInMs } = useTimestamp({
    refreshIntervalInMs,
    stopRefetching: isOutOfSync,
  })

  const currentReward = calculateReward(timestampInMs)

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  const precision = useMemo(() => {
    const baseTime = isOutOfSync ? timestampInMs : Date.now()
    const currentReward = calculateReward(baseTime)
    const rewardIn1Step = calculateReward(baseTime + STEP_IN_MS)
    return calculatePrecision({ currentReward, rewardIn1Step })
  }, [calculateReward, isOutOfSync])

  return (
    <div className="isolate grid grid-cols-[auto_1fr] items-center gap-x-2 lg:gap-x-4 lg:gap-y-2">
      <img src={getTokenImage(rewardToken.symbol)} className="h-8 shrink-0 lg:h-12 xl:h-14" />
      <div className="flex items-baseline tabular-nums" data-testid={testIds.farmDetails.activeFarmInfoPanel.rewards}>
        <div
          className={cn(
            'typography-heading-3 lg:typography-display-3 xl:typography-display-2 ',
            'relative bg-clip-text text-transparent',
            wholePartTextBgGradientClass,
          )}
        >
          {getWholePart(currentReward)}
        </div>
        {precision > 0 && (
          <div className="relative">
            <div
              className={cn(
                'typography-heading-4 text-feature-farms-primary [text-shadow:_0_1px_4px_rgb(0_0_0)]',
                fractionalPartTextColorClass,
                isOutOfSync && 'animate-pulse-opacity',
              )}
            >
              {getFractionalPart(currentReward, precision)}
            </div>
          </div>
        )}
      </div>
      {rewardToken.unitPriceUsd.gt(0) && !rewardToken.unitPriceUsd.eq(1) && (
        <div className="typography-label-2 col-start-2 ml-1.5 text-primary-inverse">
          &#8776;
          <span data-testid={testIds.farmDetails.activeFarmInfoPanel.rewardsUsd}>
            {rewardToken.formatUSD(currentReward)}
          </span>
        </div>
      )}
    </div>
  )
}

interface CalculatePrecisionParams {
  currentReward: NormalizedNumber
  rewardIn1Step: NormalizedNumber
}
function calculatePrecision({ currentReward, rewardIn1Step }: CalculatePrecisionParams): number {
  const precision = rewardIn1Step.minus(currentReward).lt(1e-12)
    ? 6
    : -Math.floor(Math.log10(rewardIn1Step.minus(currentReward).toNumber()))

  return Math.max(precision, 2)
}
