import { usePageChainId } from '@/domain/hooks/usePageChainId'
import { useOpenDialog } from '@/domain/state/dialogs'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { sandboxDialogConfig } from '@/features/dialogs/sandbox/SandboxDialog'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useAccount, useConfig } from 'wagmi'
import { MainPanelData, UseGeneralStatsResult } from '../types'
import { useGeneralStats } from './useGeneralStats'
import { useSpkStakingData } from './useSpkStakingData'
export interface UseSpkStakingResult {
  chainId: number
  generalStats: UseGeneralStatsResult
  mainPanelData: MainPanelData
}

export function useSpkStaking(): UseSpkStakingResult {
  const { chainId } = usePageChainId()
  const account = useAccount().address
  const wagmiConfig = useConfig()
  const { openConnectModal = () => {} } = useConnectModal()
  const openDialog = useOpenDialog()
  function openSandboxModal(): void {
    openDialog(sandboxDialogConfig, { mode: 'ephemeral' } as const)
  }

  const { tokenRepository } = useTokenRepositoryForFeature({
    chainId,
    featureGroup: 'sparkToken',
  })
  const generalStats = useGeneralStats()

  const { spkStakingData } = useSpkStakingData({
    chainId,
    account: account && CheckedAddress(account),
    wagmiConfig,
    tokenRepository,
  })

  const mainPanelData: MainPanelData = (() => {
    if (spkStakingData.amountStaked.isZero()) {
      if (!account) {
        return {
          type: 'cta',
          props: {
            type: 'disconnected',
            apy: spkStakingData.apy,
            connectWallet: openConnectModal,
            tryInSandbox: openSandboxModal,
          },
        } satisfies MainPanelData
      }

      return {
        type: 'cta',
        props: {
          type: 'connected',
          stake: () => {},
          spkBalance: spkStakingData.amountStaked,
          apy: spkStakingData.apy,
        },
      } satisfies MainPanelData
    }

    function calculateReward(timestampInMs: number): NormalizedUnitNumber {
      return NormalizedUnitNumber(
        spkStakingData.pendingAmount.plus(
          spkStakingData.pendingAmountRate.multipliedBy(timestampInMs - spkStakingData.pendingAmountTimestamp * 1000),
        ),
      )
    }

    return {
      type: 'active',
      props: {
        apy: spkStakingData.apy,
        stakedAmount: spkStakingData.amountStaked,
        rewardToken: tokenRepository.findOneTokenBySymbol(TokenSymbol('SPK')),
        stakingToken: tokenRepository.findOneTokenBySymbol(TokenSymbol('USDS')),
        claimableRewards: spkStakingData.claimableAmount,
        calculateReward,
        openClaimDialog: () => {},
        openUnstakeDialog: () => {},
        openStakeDialog: () => {},
      },
    } satisfies MainPanelData
  })()

  return {
    chainId,
    generalStats,
    mainPanelData,
  }
}
