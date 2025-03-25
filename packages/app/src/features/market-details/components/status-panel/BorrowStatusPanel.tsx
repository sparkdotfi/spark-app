import { CapAutomatorConfig } from '@/domain/cap-automator/types'
import { formatPercentage } from '@/domain/common/format'
import { BorrowEligibilityStatus } from '@/domain/market-info/reserve-status'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { Token } from '@/domain/types/Token'
import { InfoTile } from '@/features/market-details/components/info-tile/InfoTile'
import { ApyTooltip } from '@/ui/molecules/apy-tooltip/ApyTooltip'
import { CooldownTimer } from '@/ui/molecules/cooldown-timer/CooldownTimer'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { InterestYieldChart, InterestYieldChartProps } from '../charts/interest-yield/InterestYieldChart'
import { SparkAirdropInfoPanel } from '../spark-airdrop-info-panel/SparkAirdropInfoPanel'
import { EmptyStatusPanel } from './components/EmptyStatusPanel'
import { Header } from './components/Header'
import { InfoTilesGrid } from './components/InfoTilesGrid'
import { SparkRewardsBadge } from './components/SparkRewardsBadge'
import { SparkRewardsInfoTile } from './components/SparkRewardsInfoTile'
import { StatusPanelGrid } from './components/StatusPanelGrid'
import { Subheader } from './components/Subheader'
import { StatusIcon } from './components/status-icon/StatusIcon'

interface BorrowStatusPanelProps {
  status: BorrowEligibilityStatus
  token: Token
  totalBorrowed: NormalizedUnitNumber
  borrowLiquidity: NormalizedUnitNumber
  limitedByBorrowCap: boolean
  borrowCap?: NormalizedUnitNumber
  reserveFactor: Percentage
  apy: Percentage | undefined
  chartProps: InterestYieldChartProps
  showTokenBadge?: boolean
  hasSparkAirdrop: boolean
  capAutomatorInfo?: CapAutomatorConfig
  sparkRewards: MarketSparkRewards[]
}

export function BorrowStatusPanel({
  status,
  token,
  totalBorrowed,
  borrowLiquidity,
  limitedByBorrowCap,
  borrowCap,
  reserveFactor,
  apy,
  chartProps,
  hasSparkAirdrop,
  capAutomatorInfo,
  sparkRewards,
}: BorrowStatusPanelProps) {
  if (status === 'no') {
    return <EmptyStatusPanel status={status} variant="borrow" />
  }

  return (
    <StatusPanelGrid>
      <StatusIcon status={status} />
      <Header status={status} variant="borrow" />
      <Subheader status={status} />
      <SparkRewardsBadge sparkRewards={sparkRewards} />
      <InfoTilesGrid>
        <InfoTile>
          <InfoTile.Label>Total borrowed</InfoTile.Label>
          <InfoTile.Value>
            {token.format(totalBorrowed, { style: 'compact' })} {token.symbol}
          </InfoTile.Value>
          <InfoTile.ComplementaryLine>{token.formatUSD(totalBorrowed, { compact: true })}</InfoTile.ComplementaryLine>
        </InfoTile>
        <InfoTile>
          <InfoTile.Label>
            <ApyTooltip variant="borrow">Borrow APY</ApyTooltip>
          </InfoTile.Label>
          <InfoTile.Value>{formatPercentage(apy)}</InfoTile.Value>
        </InfoTile>
        <SparkRewardsInfoTile sparkRewards={sparkRewards} />

        <InfoTile>
          <InfoTile.Label>Reserve factor</InfoTile.Label>
          <InfoTile.Value>{formatPercentage(reserveFactor)}</InfoTile.Value>
        </InfoTile>

        {borrowCap && <BorrowCapInfoTile token={token} borrowCap={borrowCap} capAutomatorInfo={capAutomatorInfo} />}
        {capAutomatorInfo && (
          <BorrowLiquidityInfoTile
            token={token}
            borrowLiquidity={borrowLiquidity}
            limitedByBorrowCap={limitedByBorrowCap}
            capAutomatorInfo={capAutomatorInfo}
          />
        )}
      </InfoTilesGrid>

      <div className="col-span-3 mt-6 sm:mt-10">
        <InterestYieldChart {...chartProps} />
      </div>
      {hasSparkAirdrop && <SparkAirdropInfoPanel variant="borrow" eligibleToken={token.symbol} />}
    </StatusPanelGrid>
  )
}

interface BorrowCapInfoTileProps {
  token: Token
  borrowCap: NormalizedUnitNumber
  capAutomatorInfo?: CapAutomatorConfig
}

function BorrowCapInfoTile({ token, borrowCap, capAutomatorInfo }: BorrowCapInfoTileProps) {
  const maxCap = capAutomatorInfo?.maxCap ?? borrowCap

  return (
    <InfoTile>
      <InfoTile.Label>Borrow cap</InfoTile.Label>
      <InfoTile.Value data-testid={testIds.marketDetails.capAutomator.cap}>
        {token.format(maxCap, { style: 'compact' })} {token.symbol}
      </InfoTile.Value>
      <InfoTile.ComplementaryLine>{token.formatUSD(maxCap, { compact: true })}</InfoTile.ComplementaryLine>
    </InfoTile>
  )
}

interface BorrowLiquidityInfoTileProps {
  token: Token
  borrowLiquidity: NormalizedUnitNumber
  limitedByBorrowCap: boolean
  capAutomatorInfo: CapAutomatorConfig
}

function BorrowLiquidityInfoTile({
  token,
  capAutomatorInfo,
  borrowLiquidity,
  limitedByBorrowCap,
}: BorrowLiquidityInfoTileProps) {
  const renewalPeriod = capAutomatorInfo.increaseCooldown

  return (
    <InfoTile>
      <InfoTile.Label>Instantly available liquidity</InfoTile.Label>
      <InfoTile.Value data-testid={testIds.marketDetails.capAutomator.borrowLiquidity}>
        {token.format(borrowLiquidity, { style: 'compact' })} {token.symbol}
        {limitedByBorrowCap && (
          <CooldownTimer
            renewalPeriod={capAutomatorInfo.increaseCooldown}
            latestUpdateTimestamp={capAutomatorInfo.lastIncreaseTimestamp}
            cooldownOverContent={
              <>The available liquidity is constrained by the borrow cap, which may be adjusted at any time. </>
            }
            cooldownActiveContent={
              <>
                The liquidity is constrained by the borrow cap, which has a renewal time of{' '}
                {secondsToHours(renewalPeriod)} hours.{' '}
              </>
            }
          />
        )}
      </InfoTile.Value>
      <InfoTile.ComplementaryLine>{token.formatUSD(borrowLiquidity, { compact: true })}</InfoTile.ComplementaryLine>
    </InfoTile>
  )
}

function secondsToHours(seconds: number) {
  return Math.floor(seconds / 3600)
}
