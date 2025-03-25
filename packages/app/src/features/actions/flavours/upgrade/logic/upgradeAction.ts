import { migrationActionsConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { toBigInt } from '@sparkdotfi/common-universal'
import { raise } from '@sparkdotfi/common-universal'
import { UpgradeAction } from '../types'

export function createUpgradeActionConfig(action: UpgradeAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context
  const tokenRepository = context.tokenRepository ?? raise('Tokens info is required for upgrade action')
  const upgradeAmount = toBigInt(action.fromToken.toBaseUnit(action.amount))

  return {
    getWriteConfig: () => {
      const { fromToken, toToken } = action

      if (fromToken.symbol === tokenRepository.DAI?.symbol && toToken.symbol === tokenRepository.USDS?.symbol) {
        return ensureConfigTypes({
          address: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateDAIToUSDS',
          args: [account, upgradeAmount],
        })
      }

      if (fromToken.symbol === tokenRepository.sDAI?.symbol && toToken.symbol === tokenRepository.sUSDS?.symbol) {
        return ensureConfigTypes({
          address: getContractAddress(migrationActionsConfig.address, chainId),
          abi: migrationActionsConfig.abi,
          functionName: 'migrateSDAISharesToSUSDS',
          args: [account, upgradeAmount],
        })
      }

      throw new Error('Not implemented kind of upgrade action')
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
