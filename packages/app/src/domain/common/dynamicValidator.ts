import { Opaque } from '@sparkdotfi/common-universal'
import { QueryKey } from '@tanstack/react-query'
import { z } from 'zod'

export type AssetInputValidator = z.ZodSchema<{
  symbol: string
  value: string
  isMaxSelected?: boolean | undefined
}>

interface DynamicValidatorConfig<T> {
  fetchParamsQueryKey: QueryKey
  fetchParamsQueryFn: () => Promise<T>
  createValidator: (params: T) => z.ZodSchema<{
    symbol: string
    value: string
    isMaxSelected?: boolean | undefined
  }>
}

type DynamicValidatorConfigOpaque = Opaque<DynamicValidatorConfig<any>, 'DynamicValidatorConfig'>

export function ensureDynamicValidatorConfigTypes<T extends {}>(
  config: DynamicValidatorConfig<T>,
): DynamicValidatorConfigOpaque {
  return config as DynamicValidatorConfigOpaque
}

export type { DynamicValidatorConfigOpaque as DynamicValidatorConfig }
