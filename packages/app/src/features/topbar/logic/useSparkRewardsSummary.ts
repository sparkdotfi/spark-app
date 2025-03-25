import { transformSimplifiedQueryResult } from '@/domain/common/query'
import { useClaimableRewardsQuery } from '@/domain/spark-rewards/useClaimableRewardsQuery'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { SparkRewardsSummary } from '../types'

export function useSparkRewardsSummary(): SparkRewardsSummary {
  const claimableRewardsResult = useClaimableRewardsQuery()

  const { data } = transformSimplifiedQueryResult(claimableRewardsResult, (data) => {
    const totalUsdAmount = data.reduce((acc, { rewardToken, cumulativeAmount, preClaimed }) => {
      const amountToClaim = NormalizedUnitNumber(cumulativeAmount.minus(preClaimed))
      return NormalizedUnitNumber(acc.plus(rewardToken.toUSD(amountToClaim)))
    }, NormalizedUnitNumber(0))

    return {
      totalUsdAmount,
    }
  })

  return data ?? {}
}
