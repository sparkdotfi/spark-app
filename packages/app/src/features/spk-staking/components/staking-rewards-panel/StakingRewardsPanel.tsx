import { formatPercentage } from '@/domain/common/format'
import { Token } from '@/domain/types/Token'
import { assets, getTokenImage } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { Panel } from '@/ui/atoms/panel/Panel'
import { GrowingReward } from '@/ui/molecules/growing-reward/GrowingReward'
import { Info } from '@/ui/molecules/info/Info'
import { cn } from '@/ui/utils/style'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { ReactNode } from 'react'

export interface StakingRewardsPanelProps {
  claimableRewards: NormalizedNumber
  stakedAmount: NormalizedNumber
  rewardToken: Token
  stakingToken: Token
  calculateReward: (timestampInMs: number) => NormalizedNumber
  refreshGrowingRewardIntervalInMs: number | undefined
  isRewardOutOfSync: boolean
  openClaimDialog: () => void
  openUnstakeDialog: () => void
  openStakeDialog: () => void
  apy: Percentage
  className?: string
}

export function StakingRewardsPanel({
  claimableRewards,
  stakedAmount,
  rewardToken,
  stakingToken,
  calculateReward,
  refreshGrowingRewardIntervalInMs,
  isRewardOutOfSync,
  openClaimDialog,
  openUnstakeDialog,
  openStakeDialog,
  apy,
  className,
}: StakingRewardsPanelProps) {
  return (
    <Panel
      spacing="m"
      className={cn(
        'flex flex-col justify-between gap-8 lg:gap-16',
        'bg-cover bg-right bg-no-repeat',
        'bg-[url(/src/ui/assets/spark-staking/staking-rewards-panel-bg.svg)] bg-primary-inverse',
        className,
      )}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="typography-heading-4 flex items-baseline gap-1 text-primary-inverse">
          {/* @todo: spk staking - ask for a tooltip text */}
          My Rewards <Info className="icon-secondary">Staking rewards panel tooltip text</Info>
        </div>
        <div className="grid grid-cols-[80px_80px] gap-1">
          {claimableRewards.gt(0) && (
            <Button onClick={openClaimDialog} variant="primary" size="s">
              Claim
            </Button>
          )}
          {(claimableRewards.eq(0) || stakedAmount.eq(0)) && (
            <Button onClick={openStakeDialog} variant={claimableRewards.eq(0) ? 'primary' : 'secondary'} size="s">
              Stake
            </Button>
          )}
          {stakedAmount.gt(0) && (
            <Button onClick={openUnstakeDialog} variant="secondary" size="s">
              Unstake
            </Button>
          )}
        </div>
      </div>
      <GrowingReward
        rewardToken={rewardToken}
        calculateReward={calculateReward}
        refreshIntervalInMs={refreshGrowingRewardIntervalInMs}
        isOutOfSync={isRewardOutOfSync}
        wholePartTextBgGradientClass={cn(
          'bg-[radial-gradient(160.27%_160.27%_at_50.08%_115.91%,_#FFD232_0%,_#FF6D6D_100%)]',
        )}
        fractionalPartTextColorClass="text-[#FFAD48]"
      />
      <div className="flex divide-x divide-fg-secondary">
        <DetailsItem label="My Stake" tooltip="My stake tooltip text">
          <div className="typography-label-1 flex items-center gap-1.5 text-primary-inverse">
            <img src={getTokenImage(stakingToken.symbol)} className="h-4" alt={stakingToken.symbol} />
            {stakingToken.format(stakedAmount, { style: 'auto' })}
          </div>
        </DetailsItem>
        <DetailsItem label="APY" tooltip="APY tooltip text">
          <div className="typography-label-1 bg-gradient-spark-primary-2 bg-clip-text text-transparent">
            {formatPercentage(apy, { minimumFractionDigits: 0 })}
          </div>
        </DetailsItem>
        <DetailsItem label="Available to claim" tooltip="Available to claim tooltip text">
          <div className="typography-label-1 flex items-center gap-1.5 text-primary-inverse">
            <img src={getTokenImage(rewardToken.symbol)} className="h-4" alt={rewardToken.symbol} />
            {rewardToken.format(claimableRewards, { style: 'auto' })}
          </div>
        </DetailsItem>
        {isRewardOutOfSync && (
          <DetailsItem label="Rewards amount" className="hidden sm:flex">
            <div className="typography-label-1 flex items-center gap-1.5 text-primary-inverse">
              <div className="flex items-center gap-1.5">
                <img src={assets.spkStaking.syncingStatusIcon} className="h-4" alt="syncing SPK staking rewards icon" />
                Updating
              </div>
            </div>
          </DetailsItem>
        )}
      </div>
    </Panel>
  )
}

function DetailsItem({
  label,
  tooltip,
  children,
  className,
}: { label: string; tooltip?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1 px-3 first:pl-0 last:pr-0 xl:px-6', className)}>
      <div className="typography-label-3 flex items-center gap-1 text-tertiary">
        {label}
        {tooltip && <Info className="icon-secondary">{tooltip}</Info>}
      </div>
      <div className="typography-label-1 flex items-center gap-1.5 text-primary-inverse">{children}</div>
    </div>
  )
}
