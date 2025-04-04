import { transformSimplifiedQueryResult } from '@/domain/common/query'
import { useClaimableRewardsQuery } from '@/domain/spark-rewards/useClaimableRewardsQuery'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { SparkRewardsSummary } from '../types'

export function useSparkRewardsSummary(): SparkRewardsSummary {
  const claimableRewardsResult = useClaimableRewardsQuery()

  const { data } = transformSimplifiedQueryResult(claimableRewardsResult, (data) => {
    const totalUsdAmount = data.reduce((acc, { rewardToken, cumulativeAmount, preClaimed }) => {
      const amountToClaim = cumulativeAmount.minus(preClaimed)
      return acc.plus(rewardToken.toUSD(amountToClaim))
    }, NormalizedNumber.ZERO)

    return {
      totalUsdAmount,
    }
  })

  return data ?? {}
}
