import { TokenWithBalance } from '@/domain/common/types'
import { Farm } from '@/domain/farms/types'
import { Token } from '@/domain/types/Token'
import { getTokenImage } from '@/ui/assets'
import { ApyChart } from '@/ui/charts/apy-chart/ApyChart'
import { ChartTabsPanel, createChartTab } from '@/ui/charts/components/ChartTabsPanel'
import { TvlChart } from '@/ui/charts/tvl-chart/TvlChart'
import { PageLayout } from '@/ui/layouts/PageLayout'
import { ConnectOrSandboxCTAPanel } from '@/ui/organisms/connect-or-sandbox-cta-panel/ConnectOrSandboxCTAPanel'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { BackNav } from '../components/back-nav/BackNav'
import { ActiveFarmInfoPanel } from '../components/farm-info-panel/active/ActiveFarmInfoPanel'
import { InactiveFarmInfoPanel } from '../components/farm-info-panel/inactive/InactiveFarmInfoPanel'
import { Header } from '../components/header/Header'
import { TokensToDeposit } from '../components/tokens-to-deposit/TokensToDeposit'
import { ChartDetails } from '../logic/useFarmDetails'
import { RewardPointsSyncStatus } from '../types'

export interface FarmDetailsViewProps {
  chainId: number
  chainMismatch: boolean
  walletConnected: boolean
  farm: Farm
  chartDetails: ChartDetails
  tokensToDeposit: TokenWithBalance[]
  isFarmActive: boolean
  hasTokensToDeposit: boolean
  canClaim: boolean
  showApyChart: boolean
  calculateReward: (timestampInMs: number) => NormalizedUnitNumber
  refreshGrowingRewardIntervalInMs: number | undefined
  openStakeDialog: (token: Token) => void
  openDefaultedStakeDialog: () => void
  openClaimDialog: () => void
  openConnectModal: () => void
  openSandboxModal: () => void
  openUnstakeDialog: () => void
  pointsSyncStatus?: RewardPointsSyncStatus
}

export function FarmDetailsView({
  chainId,
  chainMismatch,
  walletConnected,
  farm,
  chartDetails,
  tokensToDeposit,
  isFarmActive,
  hasTokensToDeposit,
  canClaim,
  showApyChart,
  calculateReward,
  refreshGrowingRewardIntervalInMs,
  openStakeDialog,
  openDefaultedStakeDialog,
  openClaimDialog,
  openConnectModal,
  openSandboxModal,
  openUnstakeDialog,
  pointsSyncStatus,
}: FarmDetailsViewProps) {
  return (
    <PageLayout>
      <BackNav chainId={chainId} />
      <Header token={farm.rewardToken} farmName={farm.name} chainId={chainId} chainMismatch={chainMismatch} />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {isFarmActive ? (
            <ActiveFarmInfoPanel
              farm={farm}
              chainId={chainId}
              canClaim={canClaim}
              calculateReward={calculateReward}
              refreshGrowingRewardIntervalInMs={refreshGrowingRewardIntervalInMs}
              openClaimDialog={openClaimDialog}
              openUnstakeDialog={openUnstakeDialog}
              pointsSyncStatus={pointsSyncStatus}
            />
          ) : (
            <InactiveFarmInfoPanel
              assetsGroupType={farm.entryAssetsGroup.type}
              farm={farm}
              chainId={chainId}
              walletConnected={walletConnected}
              hasTokensToDeposit={hasTokensToDeposit}
              openStakeDialog={openDefaultedStakeDialog}
            />
          )}
          <ChartTabsPanel
            tabs={[
              ...(showApyChart
                ? [
                    createChartTab({
                      id: 'rewards',
                      label: 'Rewards over time',
                      component: ApyChart,
                      isError: chartDetails.farmHistory.isError,
                      isPending: chartDetails.farmHistory.isLoading,
                      props: { data: chartDetails.farmHistory.data ?? [], primaryColor: '#FA43BD' },
                      availableTimeframes: chartDetails.availableTimeframes,
                      selectedTimeframe: chartDetails.timeframe,
                      setSelectedTimeframe: chartDetails.onTimeframeChange,
                    }),
                  ]
                : []),
              createChartTab({
                id: 'tvl',
                label: 'TVL',
                component: TvlChart,
                isError: chartDetails.farmHistory.isError,
                isPending: chartDetails.farmHistory.isLoading,
                props: { data: chartDetails.farmHistory.data ?? [], primaryColor: '#FA43BD' },
                availableTimeframes: chartDetails.availableTimeframes,
                selectedTimeframe: chartDetails.timeframe,
                setSelectedTimeframe: chartDetails.onTimeframeChange,
              }),
            ]}
          />
        </div>
        {walletConnected && <TokensToDeposit assets={tokensToDeposit} openStakeDialog={openStakeDialog} />}
        {!walletConnected && (
          <ConnectOrSandboxCTAPanel
            header="Connect your wallet and start farming!"
            iconPaths={farm.entryAssetsGroup.assets.map((token) => getTokenImage(token))}
            action={openConnectModal}
            buttonText="Connect wallet"
            openSandboxModal={openSandboxModal}
          />
        )}
      </div>
    </PageLayout>
  )
}
