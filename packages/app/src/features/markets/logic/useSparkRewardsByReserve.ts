import { transformSimplifiedQueryResult } from '@/domain/common/query'
import { Reserve } from '@/domain/market-info/marketInfo'
import { assignMarketSparkRewards } from '@/domain/spark-rewards/assignMarketSparkRewards'
import { useOngoingCampaignsQuery } from '@/domain/spark-rewards/useOngoingCampaignsQuery'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { MarketSparkRewards } from '../../../domain/spark-rewards/types'

export interface UseSparkRewardsByReserveParams {
  chainId: number
  reserves: Reserve[]
}

export type SparkRewardsByReserve = Record<
  CheckedAddress,
  { borrow: MarketSparkRewards[]; supply: MarketSparkRewards[] }
>

export function useSparkRewardsByReserve({ chainId, reserves }: UseSparkRewardsByReserveParams): SparkRewardsByReserve {
  const ongoingCampaignsResult = useOngoingCampaignsQuery()

  const { data } = transformSimplifiedQueryResult(ongoingCampaignsResult, (data) => {
    const campaigns = data
      .filter((campaign) => campaign.type === 'sparklend')
      .filter((campaign) => campaign.chainId === chainId)

    return reserves.reduce<SparkRewardsByReserve>((acc, reserve) => {
      acc[reserve.token.address] = {
        supply: assignMarketSparkRewards({
          campaigns,
          action: 'supply',
          reserveTokenSymbol: reserve.token.symbol,
        }),
        borrow: assignMarketSparkRewards({
          campaigns,
          action: 'borrow',
          reserveTokenSymbol: reserve.token.symbol,
        }),
      }
      return acc
    }, {})
  })

  return data ?? {}
}
