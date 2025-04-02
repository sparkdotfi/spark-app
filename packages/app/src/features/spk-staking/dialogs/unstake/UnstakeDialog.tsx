import { CommonDialogProps, DialogConfig } from '@/features/dialogs/common/types'
import { Dialog, DialogContent } from '@/ui/atoms/dialog/Dialog'
import { UnstakeDialogContentContainer } from './UnstakeDialogContentContainer'

function UnstakeDialog({ open, setOpen }: CommonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <UnstakeDialogContentContainer closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export const unstakeDialogConfig: DialogConfig<CommonDialogProps> = {
  options: {
    closeOnChainChange: true,
  },
  element: UnstakeDialog,
}
