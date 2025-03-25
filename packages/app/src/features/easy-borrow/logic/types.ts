import { TokenWithValue } from '@/domain/common/types'
import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export type PageState = 'form' | 'confirmation' | 'success'
export interface PageStatus {
  actionsEnabled: boolean
  state: PageState
  onProceedToForm: () => void
  goToSuccessScreen: () => void
  submitForm: () => void
}

export interface ExistingPosition {
  tokens: Token[]
  totalValueUSD: NormalizedUnitNumber
}

export interface EasyBorrowFormNormalizedData {
  borrows: TokenWithValue[] // @todo: should it merge value of native base asset with wrapped native asset?
  deposits: TokenWithValue[]
}
