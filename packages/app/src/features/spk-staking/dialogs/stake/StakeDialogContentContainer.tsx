import { DialogContentSkeleton } from '@/features/dialogs/common/components/skeletons/DialogContentSkeleton'
import { SuccessView } from '@/features/dialogs/common/views/SuccessView'
import { withSuspense } from '@/ui/utils/withSuspense'
import { useStakeDialog } from './logic/useStakeDialog'
import { StakeView } from './views/StakeView'

export interface StakeContainerProps {
  closeDialog: () => void
}

function StakeDialogContentContainer({ closeDialog }: StakeContainerProps) {
  const { spk, staked, selectableAssets, assetsFields, form, objectives, pageStatus, txOverview } = useStakeDialog()

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
