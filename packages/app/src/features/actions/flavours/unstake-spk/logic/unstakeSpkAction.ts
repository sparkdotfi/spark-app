import { testSpkStakingAddress, testSpkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { spkStakingDataQueryKey } from '@/features/spk-staking/logic/useSpkStakingData'
import { toBigInt } from '@sparkdotfi/common-universal'
import { UnstakeSpkAction } from '../types'

export function createUnstakeSpkActionConfig(action: UnstakeSpkAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context
  const vault = getContractAddress(testSpkStakingAddress, chainId)

  return {
    getWriteConfig: () => {
      const { spk, amount, accountActiveShares, unstakeAll } = action

      if (unstakeAll) {
        return ensureConfigTypes({
          address: vault,
          abi: testSpkStakingConfig.abi,
          functionName: 'redeem',
          args: [account, toBigInt(accountActiveShares)],
        })
      }

      return ensureConfigTypes({
        address: vault,
        abi: testSpkStakingConfig.abi,
        functionName: 'withdraw',
        args: [account, toBigInt(spk.toBaseUnit(amount))],
      })
    },

    invalidates: () => {
      return [spkStakingDataQueryKey({ account, chainId })]
    },
  }
}
