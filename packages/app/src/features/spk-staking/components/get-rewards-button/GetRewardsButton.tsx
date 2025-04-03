import { testStakingRewardsAddress } from '@/config/contracts-generated'
import { useSandboxState } from '@/domain/sandbox/useSandboxState'
import { setSparkRewards } from '@/domain/spark-rewards/setSparkRewards'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { getEndpointsConfig, updateEndpoints } from '@/features/dialogs/sandbox/logic/setupSpkStaking'
import { getWorker } from '@/features/dialogs/sandbox/logic/worker'
import { getTenderlyClient } from '@/features/dialogs/sandbox/tenderly/TenderlyClient'
import { Button } from '@/ui/atoms/button/Button'
import { CheckedAddress, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { raise } from '@sparkdotfi/common-universal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mainnet } from 'viem/chains'
import { useAccount, useChainId } from 'wagmi'
import { spkStakingDataQueryKey } from '../../logic/useSpkStakingData'

const AMOUNT_TO_TOP_UP = NormalizedUnitNumber(100)

// @todo: remove this button when testing is done
export function GetRewardsButton() {
  const { isInSandbox, sandboxChainId, rpcUrl } = useSandboxState()
  const { address: account } = useAccount()
  const chainId = useChainId()
  const { tokenRepository } = useTokenRepositoryForFeature({
    chainId: sandboxChainId,
    featureGroup: 'sparkToken',
  })
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!sandboxChainId || !rpcUrl || !account) {
        return
      }

      const msw = getWorker()

      if (!msw) {
        return
      }

      const endpointsConfig = getEndpointsConfig()
      const previousPendingAmount = NormalizedUnitNumber(endpointsConfig.walletData.pending_amount_normalized)
      const previousCumulativeAmount = NormalizedUnitNumber(endpointsConfig.walletData.cumulative_amount_normalized)

      const newCumulativeAmount = NormalizedUnitNumber(previousCumulativeAmount.plus(AMOUNT_TO_TOP_UP))
      const newPendingAmount = NormalizedUnitNumber(previousPendingAmount.plus(AMOUNT_TO_TOP_UP))

      const testnetClient = getTenderlyClient({
        rpcUrl,
        originChain: mainnet,
        forkChainId: sandboxChainId,
      })
      const usds = tokenRepository.findOneTokenBySymbol(TokenSymbol('USDS'))

      const { merkleRoot, proofs } = await setSparkRewards({
        testnetClient,
        account: CheckedAddress(account),
        rewardsContract: CheckedAddress(testStakingRewardsAddress[mainnet.id]),
        rewards: [
          {
            token: usds.address,
            cumulativeAmount: usds.toBaseUnit(newCumulativeAmount),
          },
        ],
      })

      updateEndpoints(msw, {
        walletData: {
          pending_amount_normalized: newPendingAmount.toString(),
          cumulative_amount_normalized: newCumulativeAmount.toString(),
          merkle_root: merkleRoot,
          proof: proofs[0]?.proof ?? raise('No proof found'),
        },
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: spkStakingDataQueryKey({ account, chainId }),
      })
    },
  })

  if (!isInSandbox) {
    return null
  }

  return (
    <Button loading={isPending} onClick={() => mutate()} size="s" className="mx-auto mt-48 w-fit">
      Get {AMOUNT_TO_TOP_UP.toFixed()} SPK
    </Button>
  )
}
