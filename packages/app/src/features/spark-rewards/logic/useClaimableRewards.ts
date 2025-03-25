import { SimplifiedQueryResult, transformSimplifiedQueryResult } from '@/domain/common/query'
import { useClaimableRewardsQuery } from '@/domain/spark-rewards/useClaimableRewardsQuery'
import { useOpenDialog } from '@/domain/state/dialogs'
import { claimSparkRewardsDialogConfig } from '@/features/dialogs/claim-spark-rewards/ClaimSparkRewardsDialog'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useChainId, useSwitchChain } from 'wagmi'
import { ClaimableReward } from '../types'

export type UseClaimableRewardsResult = SimplifiedQueryResult<ClaimableRewardWithAction[]>
export interface ClaimableRewardWithAction extends ClaimableReward {
  actionName: string
  action: () => void
  isActionEnabled: boolean
}

export function useClaimableRewards(): UseClaimableRewardsResult {
  const openDialog = useOpenDialog()
  const { switchChain } = useSwitchChain()
  const connectedChainId = useChainId()
  const claimableRewardsResult = useClaimableRewardsQuery()

  return transformSimplifiedQueryResult(claimableRewardsResult, (data) =>
    data.map(({ rewardToken, cumulativeAmount, pendingAmount, preClaimed, chainId }) => {
      const isConnectedChainReward = chainId === connectedChainId
      const amountToClaim = NormalizedUnitNumber(cumulativeAmount.minus(preClaimed))
      return {
        token: rewardToken,
        amountPending: pendingAmount,
        amountToClaim,
        chainId,
        actionName: isConnectedChainReward ? 'Claim' : 'Switch',
        isActionEnabled: (isConnectedChainReward && amountToClaim.gt(0)) || !isConnectedChainReward,
        action: isConnectedChainReward
          ? () =>
              openDialog(claimSparkRewardsDialogConfig, {
                tokensToClaim: [rewardToken],
              })
          : () => switchChain({ chainId }),
      }
    }),
  )
}
