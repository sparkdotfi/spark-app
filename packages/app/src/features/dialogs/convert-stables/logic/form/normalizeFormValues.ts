import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { NormalizedConvertStablesFormValues } from '../../types'
import type { ConvertStablesFormSchema } from './schema'

export interface NormalizeFormValuesParams {
  formValues: ConvertStablesFormSchema
  tokenRepository: TokenRepository
}

export function normalizeFormValues({
  formValues,
  tokenRepository,
}: NormalizeFormValuesParams): NormalizedConvertStablesFormValues {
  const inToken = tokenRepository.findOneTokenBySymbol(formValues.inTokenSymbol)
  const outToken = tokenRepository.findOneTokenBySymbol(formValues.outTokenSymbol)
  const amount = NormalizedUnitNumber(formValues.amount === '' ? '0' : formValues.amount)

  return {
    inToken,
    outToken,
    amount,
  }
}

export function getNormalizedFormValuesKey(values: NormalizedConvertStablesFormValues): string {
  return [values.inToken.address, values.outToken.address, values.amount.toFixed()].join('-')
}
