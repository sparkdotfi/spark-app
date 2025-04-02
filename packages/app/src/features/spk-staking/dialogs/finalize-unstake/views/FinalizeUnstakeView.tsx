import { Token } from '@/domain/types/Token'
import { Objective } from '@/features/actions/logic/types'
import { DialogActionsPanel } from '@/features/dialogs/common/components/DialogActionsPanel'
import { FormAndOverviewWrapper } from '@/features/dialogs/common/components/FormAndOverviewWrapper'
import { MultiPanelDialog } from '@/features/dialogs/common/components/MultiPanelDialog'
import { PageStatus } from '@/features/dialogs/common/types'
import { DialogTitle } from '@/ui/atoms/dialog/Dialog'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface FinalizeUnstakeViewProps {
  objectives: Objective[]
  pageStatus: PageStatus
  spk: Token
  unstakeAmount: NormalizedNumber
}

export function FinalizeUnstakeView({ objectives, pageStatus, spk, unstakeAmount }: FinalizeUnstakeViewProps) {
  return (
    <MultiPanelDialog>
      <DialogTitle>Finalize SPK unstake</DialogTitle>

      <FormAndOverviewWrapper>
        <TransactionOverview>
          <TransactionOverview.Row>
            <TransactionOverview.Label>Outcome</TransactionOverview.Label>
            <TransactionOverview.TokenAmount token={spk} amount={unstakeAmount} showZeroUsdAmount={false} />
          </TransactionOverview.Row>
        </TransactionOverview>
      </FormAndOverviewWrapper>

      <DialogActionsPanel
        objectives={objectives}
        onFinish={pageStatus.goToSuccessScreen}
        enabled={pageStatus.actionsEnabled}
      />
    </MultiPanelDialog>
  )
}
