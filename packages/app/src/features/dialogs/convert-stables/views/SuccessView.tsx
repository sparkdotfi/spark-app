import { SuccessViewPanelTitle } from '@/features/dialogs/common/components/success-view/SuccessPanelTitle'
import { SuccessViewCheckmark } from '@/features/dialogs/common/components/success-view/SuccessViewCheckmark'
import { SuccessViewContent } from '@/features/dialogs/common/components/success-view/SuccessViewContent'
import { SuccessViewProceedButton } from '@/features/dialogs/common/components/success-view/SuccessViewProceedButton'
import { testIds } from '@/ui/utils/testIds'
import { assert } from '@sparkdotfi/common-universal'
import { SuccessViewPanel } from '../../common/components/success-view/SuccessViewPanel'
import { SuccessViewTokenRow } from '../../common/components/success-view/SuccessViewTokenRow'
import { TxOverview } from '../logic/createTxOverview'

export interface SuccessViewProps {
  txOverview: TxOverview
  onProceed: () => void
  proceedText: string
}
export function SuccessView({ txOverview, onProceed, proceedText }: SuccessViewProps) {
  assert(txOverview.status === 'success', 'txOverview should be success when on success view')
  return (
    <SuccessViewContent>
      <SuccessViewCheckmark />
      <SuccessViewPanel data-testid={testIds.dialog.success}>
        <SuccessViewPanelTitle>Converted from</SuccessViewPanelTitle>
        <SuccessViewTokenRow token={txOverview.inToken} amount={txOverview.outcome.value} />
        <SuccessViewPanelTitle>To</SuccessViewPanelTitle>
        <SuccessViewTokenRow token={txOverview.outcome.token} amount={txOverview.outcome.value} />
      </SuccessViewPanel>
      <SuccessViewProceedButton onProceed={onProceed}>{proceedText}</SuccessViewProceedButton>
    </SuccessViewContent>
  )
}
