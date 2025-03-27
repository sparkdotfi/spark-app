import { CapAutomatorConfig } from '@/domain/cap-automator/types'
import { formatPercentage } from '@/domain/common/format'
import { SupplyAvailabilityStatus } from '@/domain/market-info/reserve-status'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { Token } from '@/domain/types/Token'
import { InfoTile } from '@/features/market-details/components/info-tile/InfoTile'
import { ApyTooltip } from '@/ui/molecules/apy-tooltip/ApyTooltip'
import { CooldownTimer } from '@/ui/molecules/cooldown-timer/CooldownTimer'
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
  instantlyAvailableToSupply?: NormalizedUnitNumber
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
  instantlyAvailableToSupply,
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

        {supplyCap && <SupplyCapInfoTile token={token} capAutomatorInfo={capAutomatorInfo} supplyCap={supplyCap} />}
        {instantlyAvailableToSupply && (
          <InstantlyAvailableToSupplyInfoTile
            token={token}
            capAutomatorInfo={capAutomatorInfo}
            instantlyAvailableToSupply={instantlyAvailableToSupply}
          />
        )}
      </InfoTilesGrid>

      {hasSparkAirdrop && <SparkAirdropInfoPanel variant="deposit" eligibleToken={token.symbol} />}
    </StatusPanelGrid>
  )
}

interface SupplyCapInfoTileProps {
  token: Token
  capAutomatorInfo?: CapAutomatorConfig
  supplyCap: NormalizedUnitNumber
}

function SupplyCapInfoTile({ token, capAutomatorInfo, supplyCap }: SupplyCapInfoTileProps) {
  const maxCap = capAutomatorInfo?.maxCap ?? supplyCap

  return (
    <InfoTile>
      <InfoTile.Label>Supply cap</InfoTile.Label>
      <InfoTile.Value data-testid={testIds.marketDetails.capAutomator.cap}>
        {token.format(maxCap, { style: 'compact' })} {token.symbol}
      </InfoTile.Value>
      <InfoTile.ComplementaryLine>{token.formatUSD(maxCap, { compact: true })}</InfoTile.ComplementaryLine>
    </InfoTile>
  )
}

interface InstantlyAvailableToSupplyInfoTileProps {
  token: Token
  instantlyAvailableToSupply: NormalizedUnitNumber
  capAutomatorInfo?: CapAutomatorConfig
}

function InstantlyAvailableToSupplyInfoTile({
  token,
  capAutomatorInfo,
  instantlyAvailableToSupply,
}: InstantlyAvailableToSupplyInfoTileProps) {
  return (
    <InfoTile>
      <InfoTile.Label>Instantly available to supply</InfoTile.Label>
      <InfoTile.Value data-testid={testIds.marketDetails.capAutomator.cap}>
        {token.format(instantlyAvailableToSupply, { style: 'compact' })} {token.symbol}
        {capAutomatorInfo && (
          <CooldownTimer
            renewalPeriod={capAutomatorInfo.increaseCooldown}
            latestUpdateTimestamp={capAutomatorInfo.lastIncreaseTimestamp}
            cooldownOverContent={
              <>The available supply is constrained by the instant supply cap, which may be adjusted at any time. </>
            }
            cooldownActiveContent={
              <>
                The supply is constrained by the instant supply cap, which has a renewal time of{' '}
                {secondsToHours(capAutomatorInfo.increaseCooldown)} hours.{' '}
              </>
            }
          />
        )}
      </InfoTile.Value>
      <InfoTile.ComplementaryLine>
        {token.formatUSD(instantlyAvailableToSupply, { compact: true })}
      </InfoTile.ComplementaryLine>
    </InfoTile>
  )
}

function secondsToHours(seconds: number) {
  return Math.floor(seconds / 3600)
}
