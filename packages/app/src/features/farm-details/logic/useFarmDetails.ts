import { getChainConfigEntry } from '@/config/chain'
import { paths } from '@/config/paths'
import { sortByUsdValueWithUsdsPriority } from '@/domain/common/sorters'
import { TokenWithBalance } from '@/domain/common/types'
import { NotFoundError } from '@/domain/errors/not-found'
import { Farm } from '@/domain/farms/types'
import { useFarmsInfo } from '@/domain/farms/useFarmsInfo'
import { useSandboxPageRedirect } from '@/domain/sandbox/useSandboxPageRedirect'
import { useOpenDialog } from '@/domain/state/dialogs'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { sandboxDialogConfig } from '@/features/dialogs/sandbox/SandboxDialog'
import { Timeframe } from '@/ui/charts/defaults'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { NormalizedUnitNumber, raise } from '@sparkdotfi/common-universal'
import { useAccount, useChainId } from 'wagmi'
import { claimDialogConfig } from '../dialogs/claim/ClaimDialog'
import { stakeDialogConfig } from '../dialogs/stake/StakeDialog'
import { unstakeDialogConfig } from '../dialogs/unstake/UnstakeDialog'
import { RewardPointsSyncStatus } from '../types'
import { calculateReward as _calculateReward } from './calculateReward'
import { getRewardPointsSyncStatus } from './getRewardPointsSyncStatus'
import { FarmHistoryQueryResult, FarmHistoryTimeframe, useFarmHistory } from './historic/useFarmHistory'
import { useFarmDetailsParams } from './useFarmDetailsParams'
import { useRewardPointsData } from './useRewardPointsData'

const GROWING_REWARD_REFRESH_INTERVAL_IN_MS = 50

export interface ChartDetails {
  farmHistory: FarmHistoryQueryResult
  onTimeframeChange: (timeframe: Timeframe) => void
  timeframe: FarmHistoryTimeframe
  availableTimeframes: FarmHistoryTimeframe[]
}

export interface UseFarmDetailsResult {
  chainId: number
  chainMismatch: boolean
  walletConnected: boolean
  farm: Farm
  tokensToDeposit: TokenWithBalance[]
  isFarmActive: boolean
  hasTokensToDeposit: boolean
  canClaim: boolean
  showApyChart: boolean
  chartDetails: ChartDetails
  calculateReward: (timestampInMs: number) => NormalizedUnitNumber
  refreshGrowingRewardIntervalInMs: number | undefined
  openStakeDialog: (initialToken: Token) => void
  openUnstakeDialog: () => void
  openClaimDialog: () => void
  openDefaultedStakeDialog: () => void
  openConnectModal: () => void
  openSandboxModal: () => void
  pointsSyncStatus?: RewardPointsSyncStatus
}

export function useFarmDetails(): UseFarmDetailsResult {
  const { address: account } = useAccount()
  const walletConnected = account !== undefined

  const params = useFarmDetailsParams()
  const { address: farmAddress, chainId } = params

  const connectedChainId = useChainId()
  const chainMismatch = walletConnected && connectedChainId !== chainId
  const { openConnectModal = () => {} } = useConnectModal()
  const openDialog = useOpenDialog()

  const { farms } = getChainConfigEntry(chainId)
  const farmConfig = farms?.configs.find((farm) => farm.address === farmAddress) ?? raise('Farm not configured')

  useSandboxPageRedirect({
    basePath: paths.farmDetails,
    fallbackPath: paths.farms,
    basePathParams: params,
  })

  const { farmsInfo } = useFarmsInfo({ chainId })
  const farm = farmsInfo.findFarmByAddress(farmAddress) ?? raise(new NotFoundError())

  const { farmHistory, onTimeframeChange, timeframe, availableTimeframes } = useFarmHistory({
    chainId,
    farmAddress,
  })
  const { tokenRepository } = useTokenRepositoryForFeature({ chainId, featureGroup: 'farms' })
  const rewardPointsData = useRewardPointsData({
    farm,
    account,
  })

  const tokensToDeposit = farm.entryAssetsGroup.assets.map((symbol) =>
    tokenRepository.findOneTokenWithBalanceBySymbol(symbol),
  )
  const hasTokensToDeposit = tokensToDeposit.some((token) => token.balance.gt(0))
  const mostValuableToken = sortByUsdValueWithUsdsPriority(tokensToDeposit, tokenRepository)[0]
  const canClaim = farm.earned.gt(0) || farm.rewardRate.gt(0)

  function calculateReward(timestampInMs: number): NormalizedUnitNumber {
    if (farmConfig.rewardType === 'points' && rewardPointsData?.data) {
      const {
        data: { rewardBalance, rewardTokensPerSecond, updateTimestamp },
      } = rewardPointsData

      return NormalizedUnitNumber(
        rewardBalance.plus(rewardTokensPerSecond.div(1000).multipliedBy(timestampInMs - updateTimestamp)),
      )
    }

    return _calculateReward({
      earned: farm.earned,
      staked: farm.staked,
      rewardRate: farm.rewardRate,
      earnedTimestamp: farm.earnedTimestamp,
      periodFinish: farm.periodFinish,
      timestampInMs,
      totalSupply: farm.totalSupply,
    })
  }

  const refreshGrowingRewardIntervalInMs =
    rewardPointsData?.data?.rewardTokensPerSecond.gt(0) || (farm.staked.gt(0) && farm.rewardRate.gt(0))
      ? GROWING_REWARD_REFRESH_INTERVAL_IN_MS
      : undefined

  const pointsSyncStatus = getRewardPointsSyncStatus({
    farm,
    rewardPointsData,
  })

  return {
    chainId,
    chainMismatch,
    walletConnected,
    farm,
    tokensToDeposit,
    hasTokensToDeposit,
    canClaim,
    isFarmActive: farm.staked.gt(0) || farm.earned.gt(0) || !!rewardPointsData?.data?.rewardBalance.gt(0),
    showApyChart: farm.rewardType !== 'points',
    chartDetails: {
      farmHistory,
      onTimeframeChange,
      timeframe,
      availableTimeframes,
    },
    calculateReward,
    refreshGrowingRewardIntervalInMs,
    openUnstakeDialog: () => openDialog(unstakeDialogConfig, { farm, initialToken: farm.stakingToken }),
    openStakeDialog: (initialToken: Token) => openDialog(stakeDialogConfig, { farm, initialToken }),
    openDefaultedStakeDialog: () =>
      mostValuableToken ? openDialog(stakeDialogConfig, { farm, initialToken: mostValuableToken.token }) : undefined,
    openClaimDialog: () => openDialog(claimDialogConfig, { farm }),
    openConnectModal,
    openSandboxModal(): void {
      openDialog(sandboxDialogConfig, { mode: 'ephemeral' } as const)
    },
    pointsSyncStatus,
  }
}
