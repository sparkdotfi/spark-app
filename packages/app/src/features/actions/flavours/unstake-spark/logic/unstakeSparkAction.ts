import { testSparkStakingAddress, testSparkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { toBigInt } from '@marsfoundation/common-universal'
import { UnstakeSparkAction } from '../types'

export function createUnstakeSparkActionConfig(action: UnstakeSparkAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context
  const vault = getContractAddress(testSparkStakingAddress, chainId)

  return {
    getWriteConfig: () => {
      const { spk, amount, accountActiveShares, unstakeAll } = action

      if (unstakeAll) {
        return ensureConfigTypes({
          address: vault,
          abi: testSparkStakingConfig.abi,
          functionName: 'redeem',
          args: [account, toBigInt(accountActiveShares)],
        })
      }

      return ensureConfigTypes({
        address: vault,
        abi: testSparkStakingConfig.abi,
        functionName: 'withdraw',
        args: [account, toBigInt(spk.toBaseUnit(amount))],
      })
    },

    invalidates: () => {
      return [
        // @todo: spark staking - add related query keys after they are implemented
      ]
    },
  }
}
