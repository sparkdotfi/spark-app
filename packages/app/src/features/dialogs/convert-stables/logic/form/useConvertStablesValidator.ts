import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedNumber, Opaque } from '@sparkdotfi/common-universal'
import { QueryKey, useSuspenseQuery } from '@tanstack/react-query'
import { arbitrum, base } from 'viem/chains'
import { Config, useConfig } from 'wagmi'
import { z } from 'zod'
import { psm3Balances } from '../../../common/logic/psm3BalancesQuery'
import { ConvertStablesFormSchema } from './schema'
import {
  convertStablesValidationIssueToMessage,
  getConvertStablesFormValidator,
  validateConvertStablesWithPsm3,
} from './validator'

export type ConvertStablesValidator = z.ZodSchema<{
  inTokenSymbol: string
  outTokenSymbol: string
  amount: string
  isMaxSelected?: boolean | undefined
}>

export interface UseConvertStablesValidatorParams {
  chainId: number
  tokenRepository: TokenRepository
}

export function useConvertStablesValidator({
  chainId,
  tokenRepository,
}: UseConvertStablesValidatorParams): ConvertStablesValidator {
  const wagmiConfig = useConfig()

  const { fetchParamsQueryKey, fetchParamsQueryFn, createValidator } = getValidatorConfig({
    chainId,
    tokenRepository,
    wagmiConfig,
  })

  const { data } = useSuspenseQuery({
    queryKey: fetchParamsQueryKey,
    queryFn: fetchParamsQueryFn,
  })

  return createValidator(data)
}

interface GetValidatorConfigParams {
  chainId: number
  tokenRepository: TokenRepository
  wagmiConfig: Config
}
function getValidatorConfig({
  chainId,
  tokenRepository,
  wagmiConfig,
}: GetValidatorConfigParams): DynamicValidatorConfigOpaque {
  if (chainId === base.id || chainId === arbitrum.id) {
    const usdc = tokenRepository.findOneTokenBySymbol(TokenSymbol('USDC'))
    const validatorQuery = psm3Balances({ tokenRepository, wagmiConfig, chainId })

    return ensureDynamicValidatorConfigTypes({
      fetchParamsQueryKey: validatorQuery.queryKey,
      fetchParamsQueryFn: validatorQuery.queryFn,
      createValidator: ({ usds: usdsBalance, usdc: usdcBalance }) =>
        ConvertStablesFormSchema.superRefine((field, ctx) => {
          const value = NormalizedNumber(field.amount === '' ? '0' : field.amount)
          const isConvertToUsdc = field.outTokenSymbol === usdc.symbol
          const inTokenBalance = tokenRepository.findOneBalanceBySymbol(TokenSymbol(field.inTokenSymbol))

          const issue = validateConvertStablesWithPsm3({
            value,
            isConvertToUsdc,
            user: { balance: inTokenBalance },
            psm3: {
              usdsBalance,
              usdcBalance,
            },
          })
          if (issue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: convertStablesValidationIssueToMessage[issue],
              path: ['amount'],
            })
          }
        }),
    })
  }

  return ensureDynamicValidatorConfigTypes({
    fetchParamsQueryKey: getCreateValidatorConfigQueryKey(chainId),
    fetchParamsQueryFn: () => Promise.resolve({}),
    createValidator: () => getConvertStablesFormValidator(tokenRepository),
  })
}

function getCreateValidatorConfigQueryKey(chainId: number): QueryKey {
  return [chainId, 'dynamic-validator-convert-stables']
}

interface DynamicValidatorConfig<T> {
  fetchParamsQueryKey: QueryKey
  fetchParamsQueryFn: () => Promise<T>
  createValidator: (params: T) => ConvertStablesValidator
}

type DynamicValidatorConfigOpaque = Opaque<DynamicValidatorConfig<any>, 'DynamicValidatorConfig'>

function ensureDynamicValidatorConfigTypes<T extends {}>(
  config: DynamicValidatorConfig<T>,
): DynamicValidatorConfigOpaque {
  return config as DynamicValidatorConfigOpaque
}
