import { Token } from '@/domain/types/Token'
import { Objective } from '@/features/actions/logic/types'
import { DialogActionsPanel } from '@/features/dialogs/common/components/DialogActionsPanel'
import { MultiPanelDialog } from '@/features/dialogs/common/components/MultiPanelDialog'
import { PageStatus } from '@/features/dialogs/common/types'
import { DialogTitle } from '@/ui/atoms/dialog/Dialog'
import { TransactionOverview } from '@/ui/organisms/transaction-overview/TransactionOverview'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface ClaimRewardsViewProps {
  pageStatus: PageStatus
  objectives: Objective[]
  rewardToken: Token
  rewardAmount: NormalizedUnitNumber
}

export function ClaimRewardsView({ rewardToken, rewardAmount, pageStatus, objectives }: ClaimRewardsViewProps) {
  return (
    <MultiPanelDialog>
      <DialogTitle>Claim staking rewards</DialogTitle>

      <TransactionOverview>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Outcome</TransactionOverview.Label>
          <TransactionOverview.TokenAmount token={rewardToken} amount={rewardAmount} />
        </TransactionOverview.Row>
      </TransactionOverview>

      <DialogActionsPanel
        objectives={objectives}
        onFinish={pageStatus.goToSuccessScreen}
        enabled={pageStatus.actionsEnabled}
      />
    </MultiPanelDialog>
  )
}
