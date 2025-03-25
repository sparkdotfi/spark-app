import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { getTokenColor, getTokenImage } from '@/ui/assets'
import { assets } from '@/ui/assets'
import { Info } from '@/ui/molecules/info/Info'
import { Percentage, raise } from '@sparkdotfi/common-universal'

export interface SparkRewardsBadgeProps {
  sparkRewards: MarketSparkRewards[]
}

export function SparkRewardsBadge({ sparkRewards }: SparkRewardsBadgeProps) {
  if (sparkRewards.length === 0) {
    return null
  }

  if (sparkRewards.length > 1) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-gradient-spark-rewards-2 p-2">
        <img src={assets.page.sparkRewardsCircle} alt="Spark Rewards" className="size-4" />
        <div className="flex items-center gap-1">
          <div className="typography-label-4 text-primary">Eligible for rewards</div>
          <Info>Eligble for rewards</Info>
        </div>
      </div>
    )
  }

  const sparkReward = sparkRewards[0] ?? raise('No spark reward')

  const bgColor = getTokenColor(sparkReward.rewardTokenSymbol, { alpha: Percentage(0.1) })
  const rewardIcon = getTokenImage(sparkReward.rewardTokenSymbol)

  return (
    <div className="flex items-center gap-1.5 rounded-full p-2" style={{ backgroundColor: bgColor }}>
      <img src={rewardIcon} alt={sparkReward.rewardTokenSymbol} className="size-4" />
      <div className="flex items-center gap-1">
        <div className="typography-label-4 text-primary">Eligble for {sparkReward.rewardTokenSymbol} rewards</div>
        <Info>{sparkReward.longDescription}</Info>
      </div>
    </div>
  )
}
