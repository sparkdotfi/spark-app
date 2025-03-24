import { PageLayout } from '@/ui/layouts/PageLayout'
import {
  AvailableToStakePanel,
  AvailableToStakeRow,
} from '../components/available-to-stake-panel/AvailableToStakePanel'
import { ChartsPanel } from '../components/charts-panel/ChartsPanel'
import { GeneralStatsBar } from '../components/general-stats-bar/GeneralStatsBar'
import { PageHeader } from '../components/page-header/PageHeader'
import { StakeSpkCTAPanel } from '../components/stake-cta-panel/StakeSpkCTAPanel'
import { StakingRewardsPanel } from '../components/staking-rewards-panel/StakingRewardsPanel'
import { WithdrawalsTablePanel, WithdrawalsTableRow } from '../components/withdrawals-table/WithdrawalsTablePanel'
import { ChartDetails, MainPanelData, UseGeneralStatsResult } from '../types'

export interface SpkStakingViewProps {
  chainId: number
  generalStatsResult: UseGeneralStatsResult
  mainPanelData: MainPanelData
  chartDetails: ChartDetails
  withdrawalsTableRows: WithdrawalsTableRow[]
  availableToStakeRow: AvailableToStakeRow
}

export function SpkStakingView({
  chainId,
  generalStatsResult,
  mainPanelData,
  chartDetails,
  withdrawalsTableRows,
  availableToStakeRow,
}: SpkStakingViewProps) {
  return (
    <PageLayout>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader chainId={chainId} />
        <GeneralStatsBar generalStatsResult={generalStatsResult} />
      </div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
