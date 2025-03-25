import { testSpkStakingAddress, testSpkStakingConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { ActionConfig, ActionContext } from '@/features/actions/logic/types'
import { toBigInt } from '@sparkdotfi/common-universal'
import { allowanceQueryKey } from '../../approve/logic/query'
import { StakeSpkAction } from '../types'

export function createStakeSpkActionConfig(action: StakeSpkAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context
  const vault = getContractAddress(testSpkStakingAddress, chainId)

  return {
    getWriteConfig: () => {
      const { spk } = action
      const amount = toBigInt(spk.toBaseUnit(action.amount))

      return ensureConfigTypes({
        address: vault,
        abi: testSpkStakingConfig.abi,
        functionName: 'deposit',
        args: [account, amount],
      })
    },

    invalidates: () => {
      return [
        allowanceQueryKey({ token: action.spk.address, spender: vault, account, chainId }),
        getBalancesQueryKeyPrefix({ account, chainId }),
        // @todo: spk staking - add related query keys after they are implemented
      ]
    },
  }
}
