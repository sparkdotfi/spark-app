import { DialogContentSkeleton } from '@/features/dialogs/common/components/skeletons/DialogContentSkeleton'
import { SuccessView } from '@/features/dialogs/common/views/SuccessView'
import { withSuspense } from '@/ui/utils/withSuspense'
import { useFinalizeUnstakeDialog } from './logic/useFinalizeUnstakeDialog'
import { FinalizeUnstakeView } from './views/FinalizeUnstakeView'

export interface FinishUnstakeContainerProps {
  closeDialog: () => void
}

function FinalizeUnstakeDialogContentContainer({ closeDialog }: FinishUnstakeContainerProps) {
  const { objectives, pageStatus, spk, unstakeAmount } = useFinalizeUnstakeDialog()

  if (pageStatus.state === 'success') {
    return (
      <SuccessView
        objectiveType="unstakeSpk"
        tokenWithValue={{ token: spk, value: unstakeAmount }}
        proceedText="Back to Staking"
        onProceed={closeDialog}
      />
    )
  }

  return <FinalizeUnstakeView objectives={objectives} pageStatus={pageStatus} spk={spk} unstakeAmount={unstakeAmount} />
}

const FinalizeUnstakeDialogContentContainerWithSuspense = withSuspense(
  FinalizeUnstakeDialogContentContainer,
  DialogContentSkeleton,
)
export { FinalizeUnstakeDialogContentContainerWithSuspense as FinalizeUnstakeDialogContentContainer }
