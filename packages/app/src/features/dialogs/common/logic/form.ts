import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { MarketInfo, Reserve, UserPosition } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { useDebounce } from '@/utils/useDebounce'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export const AssetInputSchema = z.object({
  symbol: z.string().transform(TokenSymbol),
  value: z.string().refine(
    (data) => {
      const value = Number.parseFloat(data)
      return data === '' || !Number.isNaN(value)
    },
    {
      message: 'Value must be a valid number',
    },
  ),
  isMaxSelected: z.boolean().default(false),
})
export type AssetInputSchema = z.infer<typeof AssetInputSchema>

export interface DialogFormNormalizedData {
  position: UserPosition
  reserve: Reserve
  token: Token
  value: NormalizedNumber
  isMaxSelected: boolean
}

export function normalizeDialogFormValues(asset: AssetInputSchema, marketInfo: MarketInfo): DialogFormNormalizedData {
  const token = marketInfo.findOneTokenBySymbol(asset.symbol)
  const position = marketInfo.findOnePositionBySymbol(asset.symbol)
  const value = NormalizedNumber(asset.value === '' ? '0' : asset.value)

  return {
    position,
    reserve: position.reserve,
    token,
    value,
    isMaxSelected: asset.isMaxSelected,
  }
}

export function isMaxValue(value: string, maxValue: NormalizedNumber): boolean {
  const normalizedValue = NormalizedNumber(value === '' ? '0' : value)
  return normalizedValue.eq(maxValue)
}

function getNormalizedDialogFormValuesKey(values: DialogFormNormalizedData): string {
  return [values.token.address, values.value.toFixed(), values.isMaxSelected].join('-')
}

export interface UseDebouncedDialogFormValuesArgs {
  form: UseFormReturn<AssetInputSchema>
  marketInfo: MarketInfo
  capValue?: NormalizedNumber
}
export interface UseDebouncedDialogFormValuesResult {
  debouncedFormValues: DialogFormNormalizedData
  isFormValid: boolean
  isDebouncing: boolean
}
export function useDebouncedDialogFormValues({
  form,
  marketInfo,
}: UseDebouncedDialogFormValuesArgs): UseDebouncedDialogFormValuesResult {
  const formValues = normalizeDialogFormValues(form.watch(), marketInfo)
  const isFormValid = form.formState.isValid
  const { debouncedValue, isDebouncing } = useDebounce(
    { formValues, isFormValid },
    getNormalizedDialogFormValuesKey(formValues) + isFormValid.toString(),
  )

  return {
    debouncedFormValues: debouncedValue.formValues,
    isFormValid: debouncedValue.isFormValid,
    isDebouncing,
  }
}
