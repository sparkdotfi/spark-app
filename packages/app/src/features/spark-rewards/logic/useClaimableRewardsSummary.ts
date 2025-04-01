import { SimplifiedQueryResult, transformSimplifiedQueryResult } from '@/domain/common/query'
import { useClaimableRewardsQuery } from '@/domain/spark-rewards/useClaimableRewardsQuery'
import { useOpenDialog } from '@/domain/state/dialogs'
import { claimSparkRewardsDialogConfig } from '@/features/dialogs/claim-spark-rewards/ClaimSparkRewardsDialog'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { pipe, sumBy } from 'remeda'
import { useChainId } from 'wagmi'
import { ClaimableReward } from '../types'

export type UseClaimableRewardsSummaryResult = SimplifiedQueryResult<ClaimableRewardsSummary>

export interface ClaimableRewardsSummary {
  usdSum: NormalizedUnitNumber
  isClaimEnabled: boolean
  claimableRewardsWithPrice: ClaimableReward[]
  claimableRewardsWithoutPrice: ClaimableReward[]
  chainId: number
  claimAll: () => void
}

export function useClaimableRewardsSummary(): UseClaimableRewardsSummaryResult {
  const chainId = useChainId()
  const claimableRewardsResult = useClaimableRewardsQuery()
  const openDialog = useOpenDialog()

  return transformSimplifiedQueryResult(claimableRewardsResult, (data) => {
    const claimableRewards = data
      .filter((reward) => reward.chainId === chainId)
      .map(({ rewardToken, cumulativeAmount, pendingAmount, preClaimed, chainId }) => {
        const amountToClaim = NormalizedUnitNumber(cumulativeAmount.minus(preClaimed))
        return {
          token: rewardToken,
          amountPending: pendingAmount,
          amountToClaim,
          chainId,
        }
      })
      .filter(({ amountToClaim }) => amountToClaim.gt(0))

    const claimableRewardsWithPrice = claimableRewards.filter(({ token, amountToClaim }) =>
      token.toUSD(amountToClaim).gt(0),
    )
    const usdSum = pipe(
      claimableRewardsWithPrice,
      sumBy(({ token, amountToClaim }) => token.toUSD(amountToClaim).toNumber()),
      NormalizedUnitNumber,
    )

    const isClaimEnabled = pipe(
      claimableRewards,
      sumBy(({ amountToClaim }) => amountToClaim.toNumber()),
      Boolean,
    )

    const claimableRewardsWithoutPrice = claimableRewards.filter(
      ({ token, amountToClaim }) => amountToClaim.gt(0) && token.toUSD(amountToClaim).eq(0),
    )

    function claimAll(): void {
      openDialog(claimSparkRewardsDialogConfig, {
        tokensToClaim: claimableRewards.map(({ token }) => token),
      })
    }

    return {
      usdSum,
      isClaimEnabled,
      claimableRewardsWithPrice,
      claimableRewardsWithoutPrice,
      chainId,
      claimAll,
    }
  })
}
