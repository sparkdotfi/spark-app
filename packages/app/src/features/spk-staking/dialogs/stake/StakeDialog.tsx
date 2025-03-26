import { CommonDialogProps, DialogConfig } from '@/features/dialogs/common/types'
import { Dialog, DialogContent } from '@/ui/atoms/dialog/Dialog'
import { StakeDialogContentContainer } from './StakeDialogContentContainer'

function StakeDialog({ open, setOpen }: CommonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <StakeDialogContentContainer closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export const stakeDialogConfig: DialogConfig<CommonDialogProps> = {
  options: {
    closeOnChainChange: true,
  },
  element: StakeDialog,
}
