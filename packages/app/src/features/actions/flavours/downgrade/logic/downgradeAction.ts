import { migrationActionsConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { toBigInt } from '@sparkdotfi/common-universal'
import { DowngradeAction } from '../types'

export function createDowngradeActionConfig(action: DowngradeAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context

  return {
    getWriteConfig: () => {
      const usdsAmount = toBigInt(action.fromToken.toBaseUnit(action.amount))

      return ensureConfigTypes({
        address: getContractAddress(migrationActionsConfig.address, chainId),
        abi: migrationActionsConfig.abi,
        functionName: 'downgradeUSDSToDAI',
        args: [account, usdsAmount],
      })
    },

    invalidates: () => {
      return [
        allowanceQueryKey({
          token: action.fromToken.address,
          spender: getContractAddress(migrationActionsConfig.address, chainId),
          account,
          chainId,
        }),
        getBalancesQueryKeyPrefix({ chainId, account }),
      ]
    },
  }
}
