import { debtTokenAbi } from '@/config/abis/debtTokenAbi'
import { wethGatewayConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { toBigInt } from '@sparkdotfi/common-universal'
import { raise } from '@sparkdotfi/common-universal'
import { queryOptions } from '@tanstack/react-query'
import { ApproveDelegationAction } from '../types'
import { borrowAllowance, getBorrowAllowanceQueryKey } from './query'

export function createApproveDelegationActionConfig(
  action: ApproveDelegationAction,
  context: ActionContext,
): ActionConfig {
  const marketInfo = context.marketInfo ?? raise('Market info is required for approve delegation action')
  const { wagmiConfig, account, chainId } = context

  const wethGatewayAddress = getContractAddress(wethGatewayConfig.address, chainId)
  const reserve = marketInfo.findOneReserveByToken(action.token)
  const debtTokenAddress = reserve.variableDebtTokenAddress

  return {
    initialParamsQueryOptions: () => {
      return queryOptions({
        ...borrowAllowance({
          fromUser: account,
          toUser: wethGatewayAddress,
          wagmiConfig,
          debtTokenAddress,
          chainId,
        }),
        select: (data) => ({ canBeSkipped: data >= toBigInt(action.token.toBaseUnit(action.value)) }),
      })
    },

    getWriteConfig: () => {
      const value = toBigInt(action.token.toBaseUnit(action.value))

      return ensureConfigTypes({
        address: debtTokenAddress,
        abi: debtTokenAbi,
        functionName: 'approveDelegation',
        args: [wethGatewayAddress, value],
      })
    },

    verifyTransactionQueryOptions: () => {
      return queryOptions({
        ...borrowAllowance({
          fromUser: account,
          toUser: wethGatewayAddress,
          wagmiConfig,
          debtTokenAddress,
          chainId,
        }),
        select: (data) => ({ success: data >= toBigInt(action.token.toBaseUnit(action.value)) }),
      })
    },

    invalidates: () => [
      getBorrowAllowanceQueryKey({ fromUser: account, toUser: wethGatewayAddress, debtTokenAddress, chainId }),
    ],
  }
}
