import { CommonDialogProps, DialogConfig } from '@/features/dialogs/common/types'
import { Dialog, DialogContent } from '@/ui/atoms/dialog/Dialog'
import { FinalizeUnstakeDialogContentContainer } from './FinalizeUnstakeDialogContentContainer'

function FinalizeUnstakeDialog({ open, setOpen }: CommonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <FinalizeUnstakeDialogContentContainer closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export const finalizeUnstakeDialogConfig: DialogConfig<CommonDialogProps> = {
  options: {
    closeOnChainChange: true,
  },
  element: FinalizeUnstakeDialog,
}
