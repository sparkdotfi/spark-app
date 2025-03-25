import { CapAutomatorConfig } from '@/domain/cap-automator/types'
import { formatPercentage } from '@/domain/common/format'
import { SupplyAvailabilityStatus } from '@/domain/market-info/reserve-status'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { Token } from '@/domain/types/Token'
import { InfoTile } from '@/features/market-details/components/info-tile/InfoTile'
import { ApyTooltip } from '@/ui/molecules/apy-tooltip/ApyTooltip'
import { CooldownTimer } from '@/ui/molecules/cooldown-timer/CooldownTimer'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { SparkAirdropInfoPanel } from '../spark-airdrop-info-panel/SparkAirdropInfoPanel'
import { EmptyStatusPanel } from './components/EmptyStatusPanel'
import { Header } from './components/Header'
import { InfoTilesGrid } from './components/InfoTilesGrid'
import { SparkRewardsBadge } from './components/SparkRewardsBadge'
import { SparkRewardsInfoTile } from './components/SparkRewardsInfoTile'
import { StatusPanelGrid } from './components/StatusPanelGrid'
import { Subheader } from './components/Subheader'
import { StatusIcon } from './components/status-icon/StatusIcon'

interface SupplyStatusPanelProps {
  status: SupplyAvailabilityStatus
  token: Token
  totalSupplied: NormalizedUnitNumber
  apy: Percentage | undefined
  hasSparkAirdrop: boolean
  supplyCap?: NormalizedUnitNumber
  capAutomatorInfo?: CapAutomatorConfig
  sparkRewards: MarketSparkRewards[]
}

export function SupplyStatusPanel({
  status,
  token,
  totalSupplied,
  supplyCap,
  apy,
  hasSparkAirdrop,
  capAutomatorInfo,
  sparkRewards,
}: SupplyStatusPanelProps) {
  if (status === 'no') {
    return <EmptyStatusPanel status={status} variant="supply" />
  }

  return (
    <StatusPanelGrid>
      <StatusIcon status={status} />
      <Header status={status} variant="supply" />
      <Subheader status={status} />
      <SparkRewardsBadge sparkRewards={sparkRewards} />
      <InfoTilesGrid>
        <InfoTile>
          <InfoTile.Label>Total supplied</InfoTile.Label>
          <InfoTile.Value>
            {token.format(totalSupplied, { style: 'compact' })} {token.symbol}
          </InfoTile.Value>
          <InfoTile.ComplementaryLine>{token.formatUSD(totalSupplied, { compact: true })}</InfoTile.ComplementaryLine>
        </InfoTile>
        <InfoTile>
          <InfoTile.Label>
            <ApyTooltip variant="supply">Deposit APY</ApyTooltip>
          </InfoTile.Label>
          <InfoTile.Value>{formatPercentage(apy)}</InfoTile.Value>
        </InfoTile>
        <SparkRewardsInfoTile sparkRewards={sparkRewards} />

        {supplyCap && <CapAutomatorInfoTile token={token} capAutomatorInfo={capAutomatorInfo} supplyCap={supplyCap} />}
      </InfoTilesGrid>

      {hasSparkAirdrop && <SparkAirdropInfoPanel variant="deposit" eligibleToken={token.symbol} />}
    </StatusPanelGrid>
  )
}

interface CapAutomatorInfoTileProps {
  token: Token
  capAutomatorInfo?: CapAutomatorConfig
  supplyCap: NormalizedUnitNumber
}

function CapAutomatorInfoTile({ token, capAutomatorInfo, supplyCap }: CapAutomatorInfoTileProps) {
  return (
    <div className={cn('grid grid-cols-subgrid gap-[inherit]', capAutomatorInfo && 'sm:col-span-2')}>
      {capAutomatorInfo && (
        <InfoTile>
          <InfoTile.Label>Supply cap</InfoTile.Label>
          <InfoTile.Value data-testid={testIds.marketDetails.capAutomator.maxCap}>
            {token.format(capAutomatorInfo.maxCap, { style: 'compact' })} {token.symbol}
          </InfoTile.Value>
          <InfoTile.ComplementaryLine>
            {token.formatUSD(capAutomatorInfo.maxCap, { compact: true })}
          </InfoTile.ComplementaryLine>
        </InfoTile>
      )}

      <InfoTile>
        <InfoTile.Label>{capAutomatorInfo ? 'Instantly available supply cap:' : 'Supply cap'}</InfoTile.Label>
        <InfoTile.Value data-testid={testIds.marketDetails.capAutomator.cap}>
          {token.format(supplyCap, { style: 'compact' })} {token.symbol}
          {capAutomatorInfo && (
            <CooldownTimer
              renewalPeriod={capAutomatorInfo.increaseCooldown}
              latestUpdateTimestamp={capAutomatorInfo.lastIncreaseTimestamp}
            />
          )}
        </InfoTile.Value>
        <InfoTile.ComplementaryLine>{token.formatUSD(supplyCap, { compact: true })}</InfoTile.ComplementaryLine>
      </InfoTile>
    </div>
  )
}
