import { formatPercentage } from '@/domain/common/format'
import { ReserveStatus } from '@/domain/market-info/reserve-status'
import { Token } from '@/domain/types/Token'
import { ApyDetails } from '@/features/markets/types'
import { MobileViewOptions } from '@/ui/molecules/data-table/types'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { Percentage } from '@sparkdotfi/common-universal'
import { VariantProps, cva } from 'class-variance-authority'
import { AirdropBadge } from '../../airdrop-badge/AirdropBadge'
import { RewardBadge } from './RewardBadge'
import { SparkRewardPill } from './SparkRewardPill'

interface ApyWithRewardsCellProps extends VariantProps<typeof variants> {
  apyDetails: ApyDetails
  reserveStatus: ReserveStatus
  incentivizedReserve: Token
  mobileViewOptions?: MobileViewOptions
  'data-testid'?: string
}

export function ApyWithRewardsCell({ mobileViewOptions, ...rest }: ApyWithRewardsCellProps) {
  if (mobileViewOptions?.isMobileView) {
    return (
      <div className="flex flex-row items-center justify-between">
        <div className="typography-label-4 text-secondary">{mobileViewOptions.rowTitle}</div>
        <CellContent {...rest} />
      </div>
    )
  }

  return <CellContent {...rest} />
}

type CellContentProps = Omit<ApyWithRewardsCellProps, 'mobileViewOptions'>

function CellContent({ apyDetails, reserveStatus, incentivizedReserve, 'data-testid': dataTestId }: CellContentProps) {
  if (reserveStatus !== 'active') {
    return (
      <div className="flex items-center justify-end gap-1.5" data-testid={dataTestId}>
        <CellValue value={apyDetails.baseApy} dimmed />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center justify-end gap-1 lg:gap-1.5" data-testid={dataTestId}>
        {(apyDetails.airdrops ?? []).map((airdroppedToken) => (
          <AirdropBadge key={airdroppedToken} data-testid={testIds.markets.airdropBadge} />
        ))}
        <CellValue value={apyDetails.baseApy} />
      </div>
      <div className="flex flex-wrap justify-end gap-1">
        {/* In practice it won't be displayed. Left until market incentives will be removed. */}
        {(apyDetails.legacyRewards ?? []).map((reward, index) => (
          <RewardBadge
            key={index}
            rewardToken={reward.token.symbol}
            rewardApr={reward.APR}
            incentivizedReserve={incentivizedReserve.symbol}
            data-testid={testIds.markets.rewardBadge}
          />
        ))}
        {(apyDetails.sparkRewards ?? []).map((sparkReward, index) => (
          <SparkRewardPill key={index} {...sparkReward} />
        ))}
      </div>
    </div>
  )
}

interface CellValueProps extends VariantProps<typeof variants> {
  value: Percentage | undefined
  dimmed?: boolean
}

function CellValue({ value, dimmed }: CellValueProps) {
  return <div className={cn(variants({ dimmed }))}>{formatPercentage(value)}</div>
}

const variants = cva('typography-label-2 text-primary', {
  variants: {
    dimmed: {
      true: 'text-secondary/70',
    },
  },
})
