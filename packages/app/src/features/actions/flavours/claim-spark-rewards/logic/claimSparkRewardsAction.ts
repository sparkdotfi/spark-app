import { testSparkRewardsConfig, testStakingRewardsConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { claimableRewardsQueryKey } from '@/domain/spark-rewards/claimableRewardsQueryOptions'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { toBigInt } from '@marsfoundation/common-universal'
import { ActionConfig, ActionContext } from '../../../logic/types'
import { ClaimSparkRewardsAction } from '../types'

export function createClaimSparkRewardsActionConfig(
  action: ClaimSparkRewardsAction,
  context: ActionContext,
): ActionConfig {
  const { account, chainId } = context
  const testCampaignsRewardsAddress = getContractAddress(testSparkRewardsConfig.address, chainId)
  const testStakingRewardsAddress = getContractAddress(testStakingRewardsConfig.address, chainId)

  const { epoch, token, cumulativeAmount, merkleRoot, merkleProof } = action

  return {
    getWriteConfig: () => {
      return ensureConfigTypes({
        address: action.source === 'campaigns' ? testCampaignsRewardsAddress : testStakingRewardsAddress,
        abi: action.source === 'campaigns' ? testSparkRewardsConfig.abi : testStakingRewardsConfig.abi,
        functionName: 'claim',
        args: [
          BigInt(epoch),
          account,
          token.address,
          toBigInt(token.toBaseUnit(cumulativeAmount)),
          merkleRoot,
          merkleProof,
        ],
      })
    },

    invalidates: () => [getBalancesQueryKeyPrefix({ chainId, account }), claimableRewardsQueryKey({ account })],
  }
}
