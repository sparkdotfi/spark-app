import { TokenWithFormValue } from '@/domain/common/types'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { ComponentType } from 'react'

export interface CommonDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export interface DialogContentContainerProps {
  token: Token
  closeDialog: () => void
}

export interface DialogProps extends CommonDialogProps {
  token: Token
}

export type PageState = 'form' | 'success'

export interface PageStatus {
  state: PageState
  actionsEnabled: boolean
  goToSuccessScreen: () => void
}

export interface FormFieldsForDialog {
  selectedAsset: TokenWithFormValue
  maxValue?: NormalizedUnitNumber
  maxSelectedFieldName?: string // can't be used with maxValue
  changeAsset: (newSymbol: TokenSymbol) => void
}

export interface TxOverviewRouteItem {
  token: Token
  value: NormalizedUnitNumber
  usdValue: NormalizedUnitNumber
}

// types/DialogConfig.ts
export interface DialogConfig<P extends CommonDialogProps> {
  options: {
    closeOnChainChange: boolean
  }
  element: ComponentType<P>
}
