import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { FormFieldsForDialog } from '@/features/dialogs/common/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { UseFormReturn } from 'react-hook-form'

export interface GetFormFieldsForUnstakeDialogParams {
  form: UseFormReturn<AssetInputSchema>
  tokenRepository: TokenRepository
  stakedAmount: NormalizedNumber
}

export function getFormFieldsForUnstakeDialog({
  form,
  tokenRepository,
  stakedAmount,
}: GetFormFieldsForUnstakeDialogParams): FormFieldsForDialog {
  // eslint-disable-next-line func-style
  const changeAsset = (newSymbol: TokenSymbol): void => {
    form.setValue('symbol', newSymbol)
    form.setValue('value', '')
    form.setValue('isMaxSelected', false)
    form.clearErrors()
  }

  const { symbol, value } = form.getValues()
  const token = tokenRepository.findOneTokenBySymbol(symbol)

  return {
    selectedAsset: {
      value,
      token,
      balance: stakedAmount,
    },
    changeAsset,
    maxValue: stakedAmount,
    maxSelectedFieldName: 'isMaxSelected',
  }
}
