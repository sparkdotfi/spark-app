import { transformSimplifiedQueryResult } from '@/domain/common/query'
import { useOngoingCampaignsQuery } from '@/domain/spark-rewards/useOngoingCampaignsQuery'
import { Token } from '@/domain/types/Token'
import { Percentage } from '@sparkdotfi/common-universal'
import { AccountSparkRewardsSummary } from '../types'

export interface UseSparkRewardsSummaryParams {
  chainId: number
  savingsToken: Token
}

export function useSparkRewardsSummary({
  chainId,
  savingsToken,
}: UseSparkRewardsSummaryParams): AccountSparkRewardsSummary {
  const ongoingCampaignsResult = useOngoingCampaignsQuery()

  const { data } = transformSimplifiedQueryResult(ongoingCampaignsResult, (data) => {
    const campaigns = data
      .filter((campaign) => campaign.type === 'savings')
      .filter((campaign) => campaign.chainId === chainId)
      .filter((campaign) => campaign.savingsTokenSymbols.includes(savingsToken.symbol))

    const totalApy = campaigns.reduce(
      (acc, campaign) => Percentage(acc.plus(campaign.apy ?? 0), { allowMoreThan1: true }),
      Percentage(0),
    )

    const rewards = campaigns.map((campaign) => ({
      rewardTokenSymbol: campaign.rewardTokenSymbol,
      longDescription: campaign.longDescription,
    }))

    return { totalApy, rewards }
  })

  return data ?? { totalApy: Percentage(0), rewards: [] }
}
