import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { useDebounce } from '@/utils/useDebounce'
import { zodResolver } from '@hookform/resolvers/zod'
import { assert } from '@sparkdotfi/common-universal'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useChainId } from 'wagmi'
import { ConvertStablesFormFields, NormalizedConvertStablesFormValues } from '../../types'
import { getConvertStablesFormFields } from './getConvertStablesFormFields'
import { getNormalizedFormValuesKey, normalizeFormValues } from './normalizeFormValues'
import { ConvertStablesFormSchema } from './schema'
import { useConvertStablesValidator } from './useConvertStablesValidator'

export interface UseConvertStablesFormParams {
  tokenRepository: TokenRepository
  psmStables: TokenSymbol[] | undefined
}

export interface UseConvertStablesFormResult {
  form: UseFormReturn<ConvertStablesFormSchema>
  formValues: NormalizedConvertStablesFormValues
  isFormValid: boolean
  isDebouncing: boolean
  formFields: ConvertStablesFormFields
}

export function useConvertStablesForm({
  tokenRepository,
  psmStables,
}: UseConvertStablesFormParams): UseConvertStablesFormResult {
  assert(psmStables, 'PSM stables are not defined on this chain')
  assert(psmStables.length > 1, 'PSM stables should have at least 2 stables to be able to convert')
  const chainId = useChainId()
  const validator = useConvertStablesValidator({ chainId, tokenRepository })

  const form = useForm<ConvertStablesFormSchema>({
    resolver: zodResolver(validator),
    defaultValues: {
      isMaxSelected: false,
      inTokenSymbol: psmStables[0],
      outTokenSymbol: psmStables[1],
      amount: '',
    },
  })
  const formFields = getConvertStablesFormFields({
    form,
    tokenRepository,
    psmStables,
  })
  const formValues = normalizeFormValues({
    formValues: form.watch(),
    tokenRepository,
  })

  const isFormValid = form.formState.isValid
  const { debouncedValue, isDebouncing } = useDebounce(
    { formValues, isFormValid },
    getNormalizedFormValuesKey(formValues) + isFormValid.toString(),
  )

  return {
    form,
    formValues: debouncedValue.formValues,
    isFormValid,
    isDebouncing,
    formFields,
  }
}
