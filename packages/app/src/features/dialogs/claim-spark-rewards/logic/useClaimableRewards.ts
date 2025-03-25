import { SimplifiedQueryResult, transformSimplifiedQueryResult } from '@/domain/common/query'
import { useClaimableRewardsQuery } from '@/domain/spark-rewards/useClaimableRewardsQuery'
import { Token } from '@/domain/types/Token'
import { Hex, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useChainId } from 'wagmi'

export type UseClaimableRewardsResult = SimplifiedQueryResult<ClaimableReward[]>

export interface ClaimableReward {
  token: Token
  amountToClaim: NormalizedUnitNumber
  cumulativeAmount: NormalizedUnitNumber
  epoch: number
  merkleRoot: Hex
  merkleProof: Hex[]
}

export function useClaimableRewards(): UseClaimableRewardsResult {
  const chainId = useChainId()
  const claimableRewardsResult = useClaimableRewardsQuery()

  return transformSimplifiedQueryResult(claimableRewardsResult, (data) =>
    data
      .filter((reward) => reward.chainId === chainId)
      .map(({ rewardToken, cumulativeAmount, epoch, preClaimed, merkleRoot, merkleProof }) => {
        const amountToClaim = NormalizedUnitNumber(cumulativeAmount.minus(preClaimed))
        return {
          token: rewardToken,
          amountToClaim,
          cumulativeAmount,
          epoch,
          merkleRoot,
          merkleProof,
        }
      }),
  )
}
