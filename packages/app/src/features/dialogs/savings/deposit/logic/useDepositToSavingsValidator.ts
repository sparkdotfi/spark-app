import { DynamicValidatorConfig, ensureDynamicValidatorConfigTypes } from '@/domain/common/dynamicValidator'
import { SavingsAccount } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { Token } from '@/domain/types/Token'
import { getTransferFromUserFormValidator } from '@/features/dialogs/common/logic/transfer-from-user/validation'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { QueryKey, useSuspenseQuery } from '@tanstack/react-query'
import { arbitrum, base } from 'viem/chains'
import { Config, useConfig } from 'wagmi'
import { z } from 'zod'
import { psm3Balances } from '../../../common/logic/psm3BalancesQuery'
import { depositValidationIssueToMessage, validateDepositToSavingsWithPsm3 } from './validation'

export type AssetInputValidator = z.ZodSchema<{
  symbol: string
  value: string
  isMaxSelected?: boolean | undefined
}>

export interface UseDepositToSavingsValidatorParams {
  chainId: number
  tokenRepository: TokenRepository
  savingsAccount: SavingsAccount
}

export function useDepositToSavingsValidator({
  chainId,
  tokenRepository,
  savingsAccount,
}: UseDepositToSavingsValidatorParams): AssetInputValidator {
  const wagmiConfig = useConfig()

  const { fetchParamsQueryKey, fetchParamsQueryFn, createValidator } = getValidatorConfig({
    chainId,
    tokenRepository,
    wagmiConfig,
    savingsAccount,
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
  savingsAccount: SavingsAccount
}
export function getValidatorConfig({
  chainId,
  tokenRepository,
  wagmiConfig,
  savingsAccount,
}: GetValidatorConfigParams): DynamicValidatorConfig {
  if (chainId === base.id || chainId === arbitrum.id) {
    const validatorQuery = psm3Balances({ tokenRepository, wagmiConfig, chainId })

    return ensureDynamicValidatorConfigTypes({
      fetchParamsQueryKey: validatorQuery.queryKey,
      fetchParamsQueryFn: validatorQuery.queryFn,
      createValidator: ({ susds: psm3SusdsBalance }) =>
        getTransferFromUserFormValidator(tokenRepository, depositValidationIssueToMessage).superRefine((field, ctx) => {
          const value = NormalizedNumber(field.value === '' ? '0' : field.value)
          const estimatedSusdsReceived = savingsAccount.converter.convertToShares({ assets: value })
          const issue = validateDepositToSavingsWithPsm3({
            psm3SusdsBalance,
            estimatedSusdsReceived,
          })

          if (issue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: depositValidationIssueToMessage[issue],
              path: ['value'],
            })
          }
        }),
    })
  }

  return ensureDynamicValidatorConfigTypes({
    fetchParamsQueryKey: getCreateValidatorConfigQueryKey(savingsAccount.savingsToken, chainId),
    fetchParamsQueryFn: () => Promise.resolve({}),
    createValidator: () => getTransferFromUserFormValidator(tokenRepository, depositValidationIssueToMessage),
  })
}

function getCreateValidatorConfigQueryKey(savingsToken: Token, chainId: number): QueryKey {
  return [chainId, 'dynamic-validator-deposit-to-savings', savingsToken.symbol]
}
