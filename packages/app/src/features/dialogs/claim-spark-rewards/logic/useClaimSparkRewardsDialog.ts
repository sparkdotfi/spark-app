import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { Token } from '@/domain/types/Token'
import { ClaimSparkRewardsObjective } from '@/features/actions/flavours/claim-spark-rewards/types'
import { Objective } from '@/features/actions/logic/types'
import { useState } from 'react'
import { useChainId } from 'wagmi'
import { PageState, PageStatus } from '../../common/types'
import { SparkReward } from '../types'
import { useClaimableRewards } from './useClaimableRewards'
export interface UseClaimSparkRewardsDialogParams {
  tokensToClaim: Token[]
}

export interface UseClaimSparkRewardsDialogResult {
  pageStatus: PageStatus
  rewardsToClaim: SparkReward[]
  objectives: Objective[]
  chainId: number
}

export function useClaimSparkRewardsDialog({
  tokensToClaim,
}: UseClaimSparkRewardsDialogParams): UseClaimSparkRewardsDialogResult {
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const { data: claimableRewards = [] } = useClaimableRewards()
  const chainId = useChainId()

  const filteredRewards = claimableRewards.filter((reward) =>
    tokensToClaim.some((token) => token.address === reward.token.address),
  )
  const objectives: ClaimSparkRewardsObjective[] = filteredRewards.map((reward) => ({
    type: 'claimSparkRewards',
    source: 'campaigns',
    token: reward.token,
    epoch: reward.epoch,
    cumulativeAmount: reward.cumulativeAmount,
    merkleRoot: reward.merkleRoot,
    merkleProof: reward.merkleProof,
  }))
  const rewardsToClaim = useConditionalFreeze(
    filteredRewards.map((reward) => ({
      token: reward.token,
      amountToClaim: reward.amountToClaim,
    })),
    claimableRewards.length > 0 || pageStatus === 'success',
  )

  return {
    pageStatus: {
      state: pageStatus,
      actionsEnabled: true,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    rewardsToClaim,
    objectives,
    chainId,
  }
}
