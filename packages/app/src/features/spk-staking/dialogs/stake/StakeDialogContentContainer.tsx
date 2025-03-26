import { DialogContentSkeleton } from '@/features/dialogs/common/components/skeletons/DialogContentSkeleton'
import { SuccessView } from '@/features/dialogs/common/views/SuccessView'
import { withSuspense } from '@/ui/utils/withSuspense'
import { Percentage } from '@sparkdotfi/common-universal'
import { SpkStakingEpochs } from '../../types'
import { useStakeDialog } from './logic/useStakeDialog'
import { StakeView } from './views/StakeView'

export interface StakeContainerProps {
  closeDialog: () => void
  apy: Percentage
  spkStakingEpochs: SpkStakingEpochs
}

function StakeDialogContentContainer({ closeDialog, apy, spkStakingEpochs }: StakeContainerProps) {
  const { spk, staked, selectableAssets, assetsFields, form, objectives, pageStatus, txOverview } = useStakeDialog({
    apy,
    spkStakingEpochs,
  })

  if (pageStatus.state === 'success') {
    return (
      <SuccessView
        objectiveType="stakeSpk"
        tokenWithValue={{ token: spk, value: staked }}
        proceedText="Back to Staking"
        onProceed={closeDialog}
      />
    )
  }

  return (
    <StakeView
      form={form}
      selectableAssets={selectableAssets}
      assetsFields={assetsFields}
      objectives={objectives}
      pageStatus={pageStatus}
      txOverview={txOverview}
    />
  )
}

const StakeDialogContentContainerWithSuspense = withSuspense(StakeDialogContentContainer, DialogContentSkeleton)
export { StakeDialogContentContainerWithSuspense as StakeDialogContentContainer }
