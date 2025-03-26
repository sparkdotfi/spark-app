import { CommonDialogProps, DialogConfig } from '@/features/dialogs/common/types'
import { Dialog, DialogContent } from '@/ui/atoms/dialog/Dialog'
import { Percentage } from '@sparkdotfi/common-universal'
import { SpkStakingEpochs } from '../../types'
import { StakeDialogContentContainer } from './StakeDialogContentContainer'

export interface StakeDialogProps extends CommonDialogProps {
  apy: Percentage
  spkStakingEpochs: SpkStakingEpochs
}

function StakeDialog({ open, setOpen, apy, spkStakingEpochs }: StakeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <StakeDialogContentContainer closeDialog={() => setOpen(false)} apy={apy} spkStakingEpochs={spkStakingEpochs} />
      </DialogContent>
    </Dialog>
  )
}

export const stakeDialogConfig: DialogConfig<StakeDialogProps> = {
  options: {
    closeOnChainChange: true,
  },
  element: StakeDialog,
}
