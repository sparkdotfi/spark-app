import { assets } from '@/ui/assets'
import { NetworkBadge } from '@/ui/atoms/network-badge/NetworkBadge'
import { PageLayout } from '@/ui/layouts/PageLayout'
import {
  AvailableToStakePanel,
  AvailableToStakeRow,
} from '../components/available-to-stake-panel/AvailableToStakePanel'
import { ChartsPanel } from '../components/charts-panel/ChartsPanel'
import { GeneralStatsBar } from '../components/general-stats-bar/GeneralStatsBar'
import { StakeSpkCTAPanel } from '../components/stake-cta-panel/StakeSpkCTAPanel'
import { StakingRewardsPanel } from '../components/staking-rewards-panel/StakingRewardsPanel'
import { WithdrawalsTablePanel, WithdrawalsTableRow } from '../components/withdrawals-table/WithdrawalsTablePanel'
import { ChartDetails, GeneralStats, MainPanelData } from '../types'

export interface SpkStakingViewProps {
  chainId: number
  generalStats: GeneralStats
  mainPanelData: MainPanelData
  chartDetails: ChartDetails
  withdrawalsTableRows: WithdrawalsTableRow[]
  availableToStakeRow: AvailableToStakeRow
}

export function SpkStakingView({
  chainId,
  generalStats,
  mainPanelData,
  chartDetails,
  withdrawalsTableRows,
  availableToStakeRow,
}: SpkStakingViewProps) {
  return (
    <PageLayout>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-row items-center gap-5">
          <div className="flex flex-row items-center gap-3">
            <img src={assets.token.spk} alt="SPK" className="size-10" />
            <h1 className="typography-heading-3 md:typography-heading-1">SPK Staking</h1>
          </div>
          <NetworkBadge chainId={chainId} />
        </div>
        <GeneralStatsBar generalStats={generalStats} />
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {mainPanelData.type === 'cta' ? (
            <StakeSpkCTAPanel {...mainPanelData.props} />
          ) : (
            <StakingRewardsPanel {...mainPanelData.props} />
          )}
          <ChartsPanel chartDetails={chartDetails} />
        </div>
        {withdrawalsTableRows.length > 0 && <WithdrawalsTablePanel rows={withdrawalsTableRows} />}
        <AvailableToStakePanel {...availableToStakeRow} />
      </div>
    </PageLayout>
  )
}
