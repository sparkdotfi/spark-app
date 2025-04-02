import { useChainConfigEntry } from '@/domain/hooks/useChainConfigEntry'
import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { FinalizeSpkUnstakeObjective } from '@/features/actions/flavours/finalize-spk-unstake/types'
import { PageState, PageStatus } from '@/features/dialogs/common/types'
import { useSpkStakingData } from '@/features/spk-staking/logic/useSpkStakingData'
import { assert, CheckedAddress, NormalizedUnitNumber, UnixTime, raise } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { useAccount, useChainId, useConfig } from 'wagmi'

export interface UseFinishUnstakeDialogResult {
  spk: Token
  unstakeAmount: NormalizedUnitNumber
  objectives: FinalizeSpkUnstakeObjective[]
  pageStatus: PageStatus
}

export function useFinalizeUnstakeDialog(): UseFinishUnstakeDialogResult {
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const chainId = useChainId()
  const account = useAccount().address
  const wagmiConfig = useConfig()

  const { sparkToken: sparkTokenFeatureConfig } = useChainConfigEntry()
  assert(sparkTokenFeatureConfig, 'Spark token config should be defined')
  const { tokenRepository } = useTokenRepositoryForFeature({ featureGroup: 'sparkToken' })
  const spk = tokenRepository.findOneTokenBySymbol(sparkTokenFeatureConfig.spkSymbol)

  const { spkStakingData } = useSpkStakingData({
    chainId,
    account: account && CheckedAddress(account),
    wagmiConfig,
    tokenRepository,
  })

  const claimableWithdrawal =
    useConditionalFreeze(
      spkStakingData.withdrawals.find((w) => UnixTime.fromDate(w.claimableAt) <= spkStakingData.timestamp),
      pageStatus === 'success',
    ) ?? raise('No claimable withdrawal found')

  const objectives: FinalizeSpkUnstakeObjective[] = [
    {
      type: 'finalizeSpkUnstake',
      spk,
      amount: claimableWithdrawal.amount,
      epochs: claimableWithdrawal.epochs.map(Number),
    },
  ]

  return {
    spk,
    unstakeAmount: claimableWithdrawal.amount,
    objectives,
    pageStatus: {
      state: pageStatus,
      actionsEnabled: true,
      goToSuccessScreen: () => setPageStatus('success'),
    },
  }
}
