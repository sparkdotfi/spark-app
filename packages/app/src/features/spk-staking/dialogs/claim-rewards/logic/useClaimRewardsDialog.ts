import { useChainConfigEntry } from '@/domain/hooks/useChainConfigEntry'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { ClaimSparkRewardsObjective } from '@/features/actions/flavours/claim-spark-rewards/types'
import { Objective } from '@/features/actions/logic/types'
import { PageState, PageStatus } from '@/features/dialogs/common/types'
import { useSpkStakingData } from '@/features/spk-staking/logic/useSpkStakingData'
import { assert, CheckedAddress, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { useAccount, useChainId, useConfig } from 'wagmi'

export interface UseClaimRewardsDialogResult {
  pageStatus: PageStatus
  objectives: Objective[]
  rewardToken: Token
  rewardAmount: NormalizedUnitNumber
}

export function useClaimRewardsDialog(): UseClaimRewardsDialogResult {
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const chainId = useChainId()
  const account = useAccount().address
  const wagmiConfig = useConfig()

  const { sparkToken: sparkTokenFeatureConfig } = useChainConfigEntry()
  assert(sparkTokenFeatureConfig, 'Spark token config should be defined')
  const { tokenRepository } = useTokenRepositoryForFeature({ featureGroup: 'sparkToken' })
  const usds = tokenRepository.findOneTokenBySymbol(sparkTokenFeatureConfig.usdsSymbol)

  const { spkStakingData } = useSpkStakingData({
    chainId,
    account: account && CheckedAddress(account),
    wagmiConfig,
    tokenRepository,
  })

  const objectives: ClaimSparkRewardsObjective[] = [
    {
      type: 'claimSparkRewards',
      source: 'spark-staking',
      token: usds,
      epoch: spkStakingData.rewardsEpoch,
      cumulativeAmount: spkStakingData.rewardsCumulativeAmount,
      merkleRoot: spkStakingData.rewardsRoot,
      merkleProof: spkStakingData.rewardsProof,
    },
  ]

  return {
    pageStatus: {
      state: pageStatus,
      actionsEnabled: true,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    objectives,
    rewardToken: usds,
    rewardAmount: spkStakingData.rewardsClaimableAmount,
  }
}
