import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { useDebounce } from '@/utils/useDebounce'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { UseFormReturn } from 'react-hook-form'
import { FormFieldsForDialog } from '../../types'

export interface TransferFromUserFormNormalizedData {
  token: Token
  value: NormalizedNumber
  isMaxSelected: boolean
}

export function normalizeFormValues(
  asset: AssetInputSchema,
  tokenRepository: TokenRepository,
): TransferFromUserFormNormalizedData {
  const value = NormalizedNumber(asset.value === '' ? '0' : asset.value)
  const token = tokenRepository.findOneTokenBySymbol(asset.symbol)

  return {
    token,
    value,
    isMaxSelected: asset.isMaxSelected,
  }
}

export function isMaxValue(value: string, maxValue: NormalizedNumber): boolean {
  const normalizedValue = NormalizedNumber(value === '' ? '0' : value)
  return normalizedValue.eq(maxValue)
}

function getNormalizedFormValuesKey(values: TransferFromUserFormNormalizedData): string {
  return [values.token.address, values.value.toFixed(), values.isMaxSelected].join('-')
}

export interface UseDebouncedFormValuesArgs {
  form: UseFormReturn<AssetInputSchema>
  tokenRepository: TokenRepository
}
export interface UseDebouncedFormValuesResult {
  debouncedFormValues: TransferFromUserFormNormalizedData
  isFormValid: boolean
  isDebouncing: boolean
}
export function useDebouncedFormValues({
  form,
  tokenRepository,
}: UseDebouncedFormValuesArgs): UseDebouncedFormValuesResult {
  const formValues = normalizeFormValues(form.watch(), tokenRepository)
  const isFormValid = form.formState.isValid
  const { debouncedValue, isDebouncing } = useDebounce(
    { formValues, isFormValid },
    getNormalizedFormValuesKey(formValues) + isFormValid.toString(),
  )

  return {
    debouncedFormValues: debouncedValue.formValues,
    isFormValid: debouncedValue.isFormValid,
    isDebouncing,
  }
}

export interface GetFieldsForTransferFromUserFormParams {
  form: UseFormReturn<AssetInputSchema>
  tokenRepository: TokenRepository
}

// @note: Can be used for dialogs where input is token and max value is token balance
export function getFieldsForTransferFromUserForm({
  form,
  tokenRepository,
}: GetFieldsForTransferFromUserFormParams): FormFieldsForDialog {
  // eslint-disable-next-line func-style
  const changeAsset = (newSymbol: TokenSymbol): void => {
    form.setValue('symbol', newSymbol)
    form.setValue('value', '')
    form.setValue('isMaxSelected', false)
    form.clearErrors()
  }

  const { symbol, value } = form.getValues()
  const { token, balance } = tokenRepository.findOneTokenWithBalanceBySymbol(symbol)

  return {
    selectedAsset: {
      value,
      token,
      balance,
    },
    maxSelectedFieldName: 'isMaxSelected',
    changeAsset,
    maxValue: balance,
  }
}
