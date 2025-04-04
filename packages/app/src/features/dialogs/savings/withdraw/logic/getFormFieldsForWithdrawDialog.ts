import { SavingsConverter } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { FormFieldsForDialog } from '@/features/dialogs/common/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { UseFormReturn } from 'react-hook-form'

export interface GetFormFieldsForWithdrawDialogParams {
  form: UseFormReturn<AssetInputSchema>
  tokenRepository: TokenRepository
  savingsConverter: SavingsConverter
  savingsTokenBalance: NormalizedNumber
}

export function getFormFieldsForWithdrawDialog({
  form,
  tokenRepository,
  savingsConverter,
  savingsTokenBalance,
}: GetFormFieldsForWithdrawDialogParams): FormFieldsForDialog {
  // eslint-disable-next-line func-style
  const changeAsset = (newSymbol: TokenSymbol): void => {
    form.setValue('symbol', newSymbol)
    form.setValue('value', '')
    form.setValue('isMaxSelected', false)
    form.clearErrors()
  }

  const { symbol, value } = form.getValues()
  const token = tokenRepository.findOneTokenBySymbol(symbol)
  const usdBalance = savingsConverter.convertToAssets({ shares: savingsTokenBalance })

  return {
    selectedAsset: {
      value,
      token,
      balance: usdBalance,
    },
    changeAsset,
    maxValue: usdBalance,
    maxSelectedFieldName: 'isMaxSelected',
  }
}
