import { ongoingCampaignsQueryOptions } from '@/domain/spark-rewards/ongoingCampaignsQueryOptions'
import { OngoingCampaign } from '@/domain/spark-rewards/ongoingCampaignsQueryOptions'
import { SimplifiedQueryResult } from '@/utils/types'
import { useQuery } from '@tanstack/react-query'
import { useConfig } from 'wagmi'

export type UseOngoingCampaignsResult = SimplifiedQueryResult<(OngoingCampaign & { engage: () => Promise<void> })[]>

export function useOngoingCampaigns(): UseOngoingCampaignsResult {
  const wagmiConfig = useConfig()

  return useQuery({
    ...ongoingCampaignsQueryOptions({ wagmiConfig }),
    select: (data) =>
      data.map((campaign) => ({
        ...campaign,
        // @todo: Rewards: implement functionality to get engage function
        engage: () => Promise.resolve(),
      })),
  })
}
