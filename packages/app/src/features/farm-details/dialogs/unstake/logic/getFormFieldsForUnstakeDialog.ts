import { Farm } from '@/domain/farms/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { FormFieldsForDialog } from '@/features/dialogs/common/types'
import { UseFormReturn } from 'react-hook-form'

export interface GetFormFieldsForWithdrawDialogParams {
  form: UseFormReturn<AssetInputSchema>
  tokenRepository: TokenRepository
  farm: Farm
}

export function getFormFieldsForUnstakeDialog({
  form,
  tokenRepository,
  farm,
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

  const usdStakedBalance = farm.stakingToken.toUSD(farm.staked)
  const tokenBalance = usdStakedBalance.div(token.unitPriceUsd)

  return {
    selectedAsset: {
      value,
      token,
      balance: tokenBalance,
    },
    changeAsset,
    maxValue: tokenBalance,
    maxSelectedFieldName: 'isMaxSelected',
  }
}
