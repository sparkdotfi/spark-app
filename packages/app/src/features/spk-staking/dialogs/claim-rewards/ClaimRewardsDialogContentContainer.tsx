import { SuccessView } from '@/features/dialogs/common/views/SuccessView'
import { useClaimRewardsDialog } from './logic/useClaimRewardsDialog'
import { ClaimRewardsView } from './views/ClaimRewardsView'

export interface ClaimRewardsDialogContentContainerProps {
  closeDialog: () => void
}

export function ClaimRewardsDialogContentContainer({ closeDialog }: ClaimRewardsDialogContentContainerProps) {
  const { pageStatus, objectives, rewardToken, rewardAmount } = useClaimRewardsDialog()

  if (pageStatus.state === 'success') {
    return (
      <SuccessView
        objectiveType="claimSparkRewards"
        tokenWithValue={{ token: rewardToken, value: rewardAmount }}
        onProceed={closeDialog}
        proceedText="Back to Staking"
      />
    )
  }

  return (
    <ClaimRewardsView
      pageStatus={pageStatus}
      objectives={objectives}
      rewardToken={rewardToken}
      rewardAmount={rewardAmount}
    />
  )
}
