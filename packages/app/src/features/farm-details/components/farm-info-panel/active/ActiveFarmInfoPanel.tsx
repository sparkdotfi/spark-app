import { getChainConfigEntry } from '@/config/chain'
import { farmAddresses } from '@/config/chain/constants'
import { formatPercentage } from '@/domain/common/format'
import { Farm } from '@/domain/farms/types'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { RewardPointsSyncStatus } from '@/features/farm-details/types'
import { getTokenImage } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { DelayedComponent } from '@/ui/atoms/delayed-component/DelayedComponent'
import { Panel } from '@/ui/atoms/panel/Panel'
import { GrowingReward } from '@/ui/molecules/growing-reward/GrowingReward'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { assert, NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { mainnet } from 'viem/chains'
import { ApyTooltip } from '../../apy-tooltip/ApyTooltip'
import { ChroniclePointsTooltip } from '../../chronicle-points-tooltip/ChroniclePointsTooltip'
import { DetailsItem } from '../common/DetailsItem'
import { RewardPointsSyncWarning } from './RewardPointsSyncWarning'

export interface ActiveFarmInfoPanelProps {
  farm: Farm
  chainId: number
  canClaim: boolean
  calculateReward: (timestampInMs: number) => NormalizedUnitNumber
  refreshGrowingRewardIntervalInMs: number | undefined
  openClaimDialog: () => void
  openUnstakeDialog: () => void
  pointsSyncStatus?: RewardPointsSyncStatus
}

export function ActiveFarmInfoPanel({
  farm,
  chainId,
  canClaim,
  calculateReward,
  refreshGrowingRewardIntervalInMs,
  openClaimDialog,
  openUnstakeDialog,
  pointsSyncStatus,
}: ActiveFarmInfoPanelProps) {
  if (farm.rewardType === 'points') {
    assert(pointsSyncStatus, 'pointsSyncStatus should be defined')
  }

  const isChroniclePointsFarm =
    farm.address === farmAddresses[mainnet.id].chroniclePoints &&
    getChainConfigEntry(chainId).originChainId === mainnet.id

  return (
    <Panel
      spacing="m"
      className="flex flex-col justify-between gap-8 bg-active-farm-panel bg-right bg-no-repeat md:bg-contain"
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-1">
          <h2 className="typography-heading-4 text-primary-inverse">Overview</h2>
        </div>
        <div className="md:-mt-2 md:-mr-2 flex flex-row gap-1">
          {canClaim && (
            <Button
              size="s"
              variant="tertiary"
              onClick={openClaimDialog}
              data-testid={testIds.farmDetails.activeFarmInfoPanel.claimButton}
            >
              Claim {farm.rewardToken.symbol}
            </Button>
          )}
          {farm.staked.gt(0) && (
            <Button
              size="s"
              variant="tertiary"
              onClick={openUnstakeDialog}
              data-testid={testIds.farmDetails.activeFarmInfoPanel.unstakeButton}
            >
              Withdraw
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 md:items-baseline">
          <GrowingReward
            rewardToken={farm.rewardToken}
            calculateReward={calculateReward}
            refreshIntervalInMs={refreshGrowingRewardIntervalInMs}
            wholePartTextBgGradientClass="bg-gradient-farms-1"
            fractionalPartTextColorClass="text-feature-farms-primary"
          />
          {isChroniclePointsFarm && <ChroniclePointsTooltip className="mt-2 md:mt-0" />}
        </div>
        {pointsSyncStatus && (
          <DelayedComponent>
            <RewardPointsSyncWarning
              status={pointsSyncStatus}
              data-testid={testIds.farmDetails.activeFarmInfoPanel.pointsSyncWarning}
            />
          </DelayedComponent>
        )}
      </div>
      <div className="flex divide-x divide-fg-secondary">
        {farm.depositors && (
          <DetailsItem title="Participants">
            <div className="typography-label-3 lg:typography-label-1 xl:typography-heading-5 text-primary-inverse">
              {farm.depositors}
            </div>
          </DetailsItem>
        )}
        <DetailsItem title="TVL">
          <div className="typography-label-3 lg:typography-label-1 xl:typography-heading-5 text-primary-inverse">
            {USD_MOCK_TOKEN.formatUSD(farm.totalSupply, { compact: true })}
          </div>
        </DetailsItem>
        {farm.apy?.gt(0) && (
          <DetailsItem title="APY" explainer={<ApyTooltip farmAddress={farm.address} />}>
            <div className="typography-label-3 lg:typography-label-1 xl:typography-heading-5 text-feature-farms-primary">
              {formatPercentage(farm.apy, { minimumFractionDigits: 0 })}
            </div>
          </DetailsItem>
        )}
        <DetailsItem title="My Deposit">
          <div
            className={cn(
              'typography-label-3 lg:typography-label-1 xl:typography-heading-5',
              'flex items-center gap-1 text-primary-inverse lg:gap-1.5',
            )}
            data-testid={testIds.farmDetails.activeFarmInfoPanel.staked}
          >
            <img
              src={getTokenImage(farm.stakingToken.symbol)}
              className="h-3 shrink-0 lg:h-4"
              alt={farm.stakingToken.symbol}
            />
            {farm.stakingToken.format(farm.staked, { style: 'auto' })}
          </div>
        </DetailsItem>
      </div>
    </Panel>
  )
}
