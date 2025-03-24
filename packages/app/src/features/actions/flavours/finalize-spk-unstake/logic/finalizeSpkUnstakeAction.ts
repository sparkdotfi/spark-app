import { testSpkStakingAddress, testSpkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { FinalizeSpkUnstakeAction } from '../types'

export function createFinalizeSpkUnstakeActionConfig(
  action: FinalizeSpkUnstakeAction,
  context: ActionContext,
): ActionConfig {
  const { account, chainId } = context
  const vault = getContractAddress(testSpkStakingAddress, chainId)

  return {
    getWriteConfig: () => {
      const { epochs } = action

      return ensureConfigTypes({
        address: vault,
        abi: testSpkStakingConfig.abi,
        functionName: 'claimBatch',
        args: [account, epochs.map(BigInt)],
      })
    },

    invalidates: () => {
      return [getBalancesQueryKeyPrefix({ account, chainId })]
    },
  }
}
