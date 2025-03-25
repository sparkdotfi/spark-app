import { RiskAcknowledgementInfo } from '@/domain/liquidation-risk-warning/types'
import { LiquidationDetails } from '@/domain/market-info/getLiquidationDetails'
import { UserPositionSummary } from '@/domain/market-info/marketInfo'
import { InjectedActionsContext, Objective } from '@/features/actions/logic/types'
import { PageLayout } from '@/ui/layouts/PageLayout'
import { Percentage } from '@sparkdotfi/common-universal'
import { UseFormReturn } from 'react-hook-form'
import { EasyBorrowPanel } from '../components/EasyBorrowPanel'
import { EasyBorrowSidePanel } from '../components/side-panel/EasyBorrowSidePanel'
import { FormFieldsForAssetClass } from '../logic/form/form'
import { EasyBorrowFormSchema } from '../logic/form/validation'
import { ExistingPosition, PageStatus } from '../logic/types'
import { BorrowDetails } from '../logic/useEasyBorrow'

export interface EasyBorrowViewProps {
  pageStatus: PageStatus
  borrowDetails: BorrowDetails
  form: UseFormReturn<EasyBorrowFormSchema>
  assetsToBorrowFields: FormFieldsForAssetClass
  assetsToDepositFields: FormFieldsForAssetClass
  alreadyDeposited: ExistingPosition
  alreadyBorrowed: ExistingPosition
  updatedPositionSummary: UserPositionSummary
  liquidationDetails?: LiquidationDetails
  setDesiredLoanToValue: (desiredLtv: Percentage) => void
  riskAcknowledgement: RiskAcknowledgementInfo
  objectives: Objective[]
  guestMode: boolean
  openConnectModal: () => void
  openSandboxModal: () => void
  focusOnActionsPanel: (node: HTMLDivElement | null) => void
  actionsContext: InjectedActionsContext
}

export function EasyBorrowView(props: EasyBorrowViewProps) {
  return (
    <PageLayout>
      <div className="typography-heading-1 text-primary">Easy Borrow</div>
      <div className="xl:grid xl:grid-cols-[67%_calc(33%-18px)] xl:gap-[18px]">
        <EasyBorrowPanel {...props} />
        <div className="sticky top-2 hidden h-fit xl:block">
          <EasyBorrowSidePanel
            {...props.borrowDetails}
            hf={props.pageStatus.state === 'confirmation' ? props.updatedPositionSummary.healthFactor : undefined}
            liquidationDetails={props.liquidationDetails}
          />
        </div>
      </div>
    </PageLayout>
  )
}
