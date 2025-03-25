import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { toBigInt } from '@sparkdotfi/common-universal'
import { queryOptions } from '@tanstack/react-query'
import { ApproveAction } from '../types'
import { normalizeErc20AbiForToken } from './normalizeErc20Abi'
import { allowance, allowanceQueryKey } from './query'

export function createApproveActionConfig(action: ApproveAction, context: ActionContext): ActionConfig {
  const { wagmiConfig, account, chainId } = context

  return {
    initialParamsQueryOptions: () => {
      return queryOptions({
        ...allowance({
          token: action.token.address,
          spender: action.spender,
          wagmiConfig,
          account,
          chainId,
        }),
        select: (data) => ({
          canBeSkipped: data >= toBigInt(action.token.toBaseUnit(action.requiredValue ?? action.value)),
        }),
      })
    },

    getWriteConfig: () => {
      const value = toBigInt(action.token.toBaseUnit(action.value))
      const token = action.token.address

      return ensureConfigTypes({
        address: token,
        abi: normalizeErc20AbiForToken(chainId, token),
        functionName: 'approve',
        args: [action.spender, value],
      })
    },

    verifyTransactionQueryOptions: () => {
      return queryOptions({
        ...allowance({
          token: action.token.address,
          spender: action.spender,
          wagmiConfig,
          account,
          chainId,
        }),
        select: (data) => ({ success: data >= toBigInt(action.token.toBaseUnit(action.value)) }),
      })
    },

    invalidates: () => [allowanceQueryKey({ token: action.token.address, spender: action.spender, account, chainId })],
  }
}
