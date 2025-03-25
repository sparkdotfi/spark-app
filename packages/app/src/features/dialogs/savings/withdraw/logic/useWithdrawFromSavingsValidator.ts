import { DynamicValidatorConfig, ensureDynamicValidatorConfigTypes } from '@/domain/common/dynamicValidator'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { QueryKey, useSuspenseQuery } from '@tanstack/react-query'
import { arbitrum, base } from 'viem/chains'
import { Config, useConfig } from 'wagmi'
import { z } from 'zod'
import { psm3Balances } from '../../../common/logic/psm3BalancesQuery'
import {
  getSavingsWithdrawDialogFormValidator,
  validateWithdrawFromSavingsWithPsm3,
  withdrawValidationIssueToMessage,
} from './validation'

export type WithdrawFromSavingsValidator = z.ZodSchema<{
  symbol: string
  value: string
  isMaxSelected?: boolean | undefined
}>

export interface UseWithdrawFromSavingsValidatorParams {
  chainId: number
  tokenRepository: TokenRepository
  savingsToken: Token
  savingsTokenBalance: NormalizedUnitNumber
  savingsConverter: SavingsConverter
}

export function useWithdrawFromSavingsValidator({
  chainId,
  tokenRepository,
  savingsToken,
  savingsTokenBalance,
  savingsConverter,
}: UseWithdrawFromSavingsValidatorParams): WithdrawFromSavingsValidator {
  const wagmiConfig = useConfig()

  const { fetchParamsQueryKey, fetchParamsQueryFn, createValidator } = getValidatorConfig({
    chainId,
    tokenRepository,
    wagmiConfig,
    savingsToken,
    savingsTokenBalance,
    savingsConverter,
  })

  const { data } = useSuspenseQuery({
    queryKey: fetchParamsQueryKey,
    queryFn: fetchParamsQueryFn,
  })

  return createValidator(data)
}

export interface GetValidatorConfigParams {
  chainId: number
  tokenRepository: TokenRepository
  wagmiConfig: Config
  savingsToken: Token
  savingsTokenBalance: NormalizedUnitNumber
  savingsConverter: SavingsConverter
}
export function getValidatorConfig({
  chainId,
  tokenRepository,
  wagmiConfig,
  savingsToken,
  savingsTokenBalance,
  savingsConverter,
}: GetValidatorConfigParams): DynamicValidatorConfig {
  if (chainId === base.id || chainId === arbitrum.id) {
    const usdc = tokenRepository.findOneTokenBySymbol(TokenSymbol('USDC'))
    const validatorQuery = psm3Balances({ tokenRepository, wagmiConfig, chainId })

    return ensureDynamicValidatorConfigTypes({
      fetchParamsQueryKey: validatorQuery.queryKey,
      fetchParamsQueryFn: validatorQuery.queryFn,
      createValidator: ({ usds: usdsBalance, usdc: usdcBalance }) =>
        getSavingsWithdrawDialogFormValidator({ savingsConverter, savingsTokenBalance }).superRefine((field, ctx) => {
          const value = NormalizedUnitNumber(field.value === '' ? '0' : field.value)
          const isUsdcWithdraw = field.symbol === usdc.symbol
          const isMaxSelected = field.isMaxSelected
          const usdBalance = savingsConverter.convertToAssets({ shares: savingsTokenBalance })

          const issue = validateWithdrawFromSavingsWithPsm3({
            value,
            isUsdcWithdraw,
            isMaxSelected,
            user: { balance: usdBalance },
            psm3: {
              usdsBalance,
              usdcBalance,
            },
          })
          if (issue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: withdrawValidationIssueToMessage[issue],
              path: ['value'],
            })
          }
        }),
    })
  }

  return ensureDynamicValidatorConfigTypes({
    fetchParamsQueryKey: getCreateValidatorConfigQueryKey(savingsToken, chainId),
    fetchParamsQueryFn: () => Promise.resolve({}),
    createValidator: () => getSavingsWithdrawDialogFormValidator({ savingsConverter, savingsTokenBalance }),
  })
}

function getCreateValidatorConfigQueryKey(savingsToken: Token, chainId: number): QueryKey {
  return [chainId, 'dynamic-validator-withdraw-from-savings', savingsToken.symbol]
}
