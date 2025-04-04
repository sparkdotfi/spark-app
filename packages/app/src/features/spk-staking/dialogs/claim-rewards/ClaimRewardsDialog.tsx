import { CommonDialogProps, DialogConfig } from '@/features/dialogs/common/types'
import { Dialog, DialogContent } from '@/ui/atoms/dialog/Dialog'
import { ClaimRewardsDialogContentContainer } from './ClaimRewardsDialogContentContainer'

function ClaimRewardsDialog({ open, setOpen }: CommonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <ClaimRewardsDialogContentContainer closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export const claimRewardsDialogConfig: DialogConfig<CommonDialogProps> = {
  options: {
    closeOnChainChange: true,
  },
  element: ClaimRewardsDialog,
}
