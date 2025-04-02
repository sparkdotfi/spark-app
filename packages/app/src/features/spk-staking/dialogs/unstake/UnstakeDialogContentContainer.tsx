import { DialogContentSkeleton } from '@/features/dialogs/common/components/skeletons/DialogContentSkeleton'
import { SuccessView } from '@/features/dialogs/common/views/SuccessView'
import { withSuspense } from '@/ui/utils/withSuspense'
import { useUnstakeDialog } from './logic/useUnstakeDialog'
import { UnstakeView } from './views/UnstakeView'

export interface UnstakeContainerProps {
  closeDialog: () => void
}

function UnstakeDialogContentContainer({ closeDialog }: UnstakeContainerProps) {
  const { spk, staked, selectableAssets, assetsFields, form, objectives, pageStatus, txOverview } = useUnstakeDialog()

  if (pageStatus.state === 'success') {
    return (
      <SuccessView
        objectiveType="unstakeSpk"
        tokenWithValue={{ token: spk, value: staked }}
        proceedText="Back to Staking"
        onProceed={closeDialog}
      />
    )
  }

  return (
    <UnstakeView
      form={form}
      selectableAssets={selectableAssets}
      assetsFields={assetsFields}
      objectives={objectives}
      pageStatus={pageStatus}
      txOverview={txOverview}
    />
  )
}

const UnstakeDialogContentContainerWithSuspense = withSuspense(UnstakeDialogContentContainer, DialogContentSkeleton)
export { UnstakeDialogContentContainerWithSuspense as UnstakeDialogContentContainer }
