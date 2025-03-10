import { TokenWithBalance } from '@/domain/common/types'
import { Token } from '@/domain/types/Token'
import { InjectedActionsContext, Objective } from '@/features/actions/logic/types'
import { DialogActionsPanel } from '@/features/dialogs/common/components/DialogActionsPanel'
import { FormAndOverviewWrapper } from '@/features/dialogs/common/components/FormAndOverviewWrapper'
import { MultiPanelDialog } from '@/features/dialogs/common/components/MultiPanelDialog'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { FormFieldsForDialog, PageStatus } from '@/features/dialogs/common/types'
import { DialogTitle } from '@/ui/atoms/dialog/Dialog'
import { UseFormReturn } from 'react-hook-form'
import { TransactionOverview } from '../../common/components/transaction-overview'
import { SavingsDialogTxOverview } from '../../common/types'
import { SavingsWithdrawDialogForm } from '../components/form/SavingsWithdrawDialogForm'
import { SendModeExtension } from '../types'

export interface SavingsWithdrawViewProps {
  underlyingToken: Token
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  pageStatus: PageStatus
  txOverview: SavingsDialogTxOverview
  actionsContext: InjectedActionsContext
  sendModeExtension?: SendModeExtension
}

export function SavingsWithdrawView({
  underlyingToken,
  selectableAssets,
  assetsFields,
  form,
  objectives,
  pageStatus,
  txOverview,
  actionsContext,
  sendModeExtension,
}: SavingsWithdrawViewProps) {
  return (
    <MultiPanelDialog>
      <DialogTitle>{`${sendModeExtension ? 'Send' : 'Withdraw'} from ${underlyingToken.symbol} Savings`}</DialogTitle>

      <FormAndOverviewWrapper>
        <SavingsWithdrawDialogForm
          form={form}
          sendModeExtension={sendModeExtension}
          assetsFields={assetsFields}
          selectorAssets={selectableAssets}
        />
        <TransactionOverview txOverview={txOverview} selectedToken={assetsFields.selectedAsset.token} />
      </FormAndOverviewWrapper>

      <DialogActionsPanel
        context={actionsContext}
        objectives={objectives}
        onFinish={pageStatus.goToSuccessScreen}
        enabled={pageStatus.actionsEnabled}
      />
    </MultiPanelDialog>
  )
}
