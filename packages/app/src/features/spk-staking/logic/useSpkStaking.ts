import { useGetBlockExplorerAddressLink } from '@/domain/hooks/useGetBlockExplorerAddressLink'
import { usePageChainId } from '@/domain/hooks/usePageChainId'
import { OpenDialogFunction, useOpenDialog } from '@/domain/state/dialogs'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { sandboxDialogConfig } from '@/features/dialogs/sandbox/SandboxDialog'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CheckedAddress, UnixTime } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useAccount, useConfig } from 'wagmi'
import { AvailableToStakeRow } from '../components/available-to-stake-panel/AvailableToStakePanel'
import { WithdrawalsTableRow } from '../components/withdrawals-table/WithdrawalsTablePanel'
import { claimRewardsDialogConfig } from '../dialogs/claim-rewards/ClaimRewardsDialog'
import { finalizeUnstakeDialogConfig } from '../dialogs/finalize-unstake/FinalizeUnstakeDialog'
import { stakeDialogConfig } from '../dialogs/stake/StakeDialog'
import { unstakeDialogConfig } from '../dialogs/unstake/UnstakeDialog'
import { ChartDetails, GeneralStats, MainPanelData } from '../types'
import { useChartDetails } from './useChartDetails'
import { Withdrawal, useSpkStakingData } from './useSpkStakingData'
import { useStakedAmountWatcher } from './useStakedAmountWatcher'

const GROWING_REWARD_REFRESH_INTERVAL_IN_MS = 50

export interface UseSpkStakingResult {
  chainId: number
  generalStats: GeneralStats
  mainPanelData: MainPanelData
  chartDetails: ChartDetails
  withdrawalsTableRows: WithdrawalsTableRow[]
  availableToStakeRow: AvailableToStakeRow
}

export function useSpkStaking(): UseSpkStakingResult {
  const { chainId } = usePageChainId()
  const account = useAccount().address
  const wagmiConfig = useConfig()
  const { openConnectModal = () => {} } = useConnectModal()
  const openDialog = useOpenDialog()
  const getBlockExplorerLink = useGetBlockExplorerAddressLink()

  function openSandboxModal(): void {
    openDialog(sandboxDialogConfig, { mode: 'ephemeral' } as const)
  }

  const chartDetails = useChartDetails()

  const { tokenRepository } = useTokenRepositoryForFeature({
    chainId,
    featureGroup: 'sparkToken',
  })

  const { spkStakingData } = useSpkStakingData({
    chainId,
    account: account && CheckedAddress(account),
    wagmiConfig,
    tokenRepository,
  })

  if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'staging') {
    // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
    useStakedAmountWatcher({ amountStaked: spkStakingData.amountStaked })
  }

  const { token: spk, balance: spkBalance } = tokenRepository.findOneTokenWithBalanceBySymbol(TokenSymbol('SPK'))

  const mainPanelData: MainPanelData = (() => {
    if (!account) {
      return {
        type: 'cta',
        props: {
          type: 'disconnected',
          apy: spkStakingData.generalStats.apr,
          connectWallet: openConnectModal,
          tryInSandbox: openSandboxModal,
        },
      } satisfies MainPanelData
    }

    if (spkStakingData.pendingAmount.isZero() && spkStakingData.amountStaked.isZero()) {
      return {
        type: 'cta',
        props: {
          type: 'connected',
          stake: () => {
            openDialog(stakeDialogConfig, {})
          },
          spkBalance,
          apy: spkStakingData.generalStats.apr,
        },
      } satisfies MainPanelData
    }

    function calculateReward(timestampInMs: number): NormalizedUnitNumber {
      const timestampInSec = timestampInMs / 1000
      const timestamp = Math.max(timestampInSec, spkStakingData.pendingAmountTimestamp)
      return NormalizedUnitNumber(
        spkStakingData.pendingAmount.plus(
          spkStakingData.pendingAmountRate.multipliedBy(timestamp - spkStakingData.pendingAmountTimestamp),
        ),
      )
    }

    const refreshGrowingRewardIntervalInMs =
      spkStakingData.pendingAmountRate.gt(0) || spkStakingData.amountStaked.gt(0)
        ? GROWING_REWARD_REFRESH_INTERVAL_IN_MS
        : undefined

    return {
      type: 'active',
      props: {
        apy: spkStakingData.generalStats.apr,
        stakedAmount: spkStakingData.amountStaked,
        rewardToken: tokenRepository.findOneTokenBySymbol(TokenSymbol('SPK')),
        stakingToken: tokenRepository.findOneTokenBySymbol(TokenSymbol('USDS')),
        claimableRewards: spkStakingData.rewardsClaimableAmount,
        isRewardOutOfSync: spkStakingData.isOutOfSync,
        refreshGrowingRewardIntervalInMs,
        calculateReward,
        openClaimDialog: () => openDialog(claimRewardsDialogConfig, {}),
        openUnstakeDialog: () => openDialog(unstakeDialogConfig, {}),
        openStakeDialog: () => openDialog(stakeDialogConfig, {}),
      },
    } satisfies MainPanelData
  })()

  const withdrawalsTableRows = formatWithdrawals({
    withdrawals: spkStakingData.withdrawals,
    timestamp: spkStakingData.timestamp,
    tokenRepository,
    openDialog,
  })

  const availableToStakeRow: AvailableToStakeRow = {
    token: spk,
    balance: spkBalance,
    blockExplorerLink: getBlockExplorerLink(spk.address) ?? '/',
    openStakeDialog: () => {
      openDialog(stakeDialogConfig, {})
    },
  }

  return {
    chainId,
    generalStats: spkStakingData.generalStats,
    mainPanelData,
    chartDetails,
    withdrawalsTableRows,
    availableToStakeRow,
  }
}

function formatWithdrawals({
  withdrawals,
  timestamp,
  tokenRepository,
  openDialog,
}: {
  withdrawals: Withdrawal[]
  timestamp: UnixTime
  tokenRepository: TokenRepository
  openDialog: OpenDialogFunction
}): WithdrawalsTableRow[] {
  return withdrawals
    .map((withdrawal) => {
      const timeToClaim = Math.max(0, Number(UnixTime.fromDate(withdrawal.claimableAt) - timestamp))
      const isActionEnabled = timeToClaim === 0

      return {
        token: tokenRepository.findOneTokenBySymbol(TokenSymbol('SPK')),
        amount: withdrawal.amount,
        timeToClaim,
        claimableAt: withdrawal.claimableAt,
        action: () => openDialog(finalizeUnstakeDialogConfig, {}),
        actionName: 'Finalize',
        isActionEnabled,
      }
    })
    .sort((a, b) => a.timeToClaim - b.timeToClaim)
}
