import { testSparkStakingAddress, testSparkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { ClaimUnstakeSparkAction } from '../types'

export function createClaimUnstakeSparkActionConfig(
  action: ClaimUnstakeSparkAction,
  context: ActionContext,
): ActionConfig {
  const { account, chainId } = context
  const vault = getContractAddress(testSparkStakingAddress, chainId)

  return {
    getWriteConfig: () => {
      const { epochs } = action

      return ensureConfigTypes({
        address: vault,
        abi: testSparkStakingConfig.abi,
        functionName: 'claimBatch',
        args: [account, epochs.map(BigInt)],
      })
    },

    invalidates: () => {
      return [
        // @todo: spark staking - add related query keys after they are implemented
      ]
    },
  }
}
