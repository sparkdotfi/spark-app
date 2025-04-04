import { formatPercentage } from '@/domain/common/format'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { Token } from '@/domain/types/Token'
import { InfoTile } from '@/features/market-details/components/info-tile/InfoTile'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Header } from './components/Header'
import { InfoTilesGrid } from './components/InfoTilesGrid'
import { SparkRewardsBadge } from './components/SparkRewardsBadge'
import { SparkRewardsInfoTile } from './components/SparkRewardsInfoTile'
import { StatusPanelGrid } from './components/StatusPanelGrid'
import { StatusIcon } from './components/status-icon/StatusIcon'

interface LendStatusPanelProps {
  status: 'yes' // only for dai
  token: Token
  totalLent: NormalizedNumber
  apy: Percentage | undefined
  sparkRewards: MarketSparkRewards[]
}

export function LendStatusPanel({ status, token, totalLent, apy, sparkRewards }: LendStatusPanelProps) {
  return (
    <StatusPanelGrid>
      <StatusIcon status={status} />
      <Header status={status} variant="lend" />
      <SparkRewardsBadge sparkRewards={sparkRewards} />
      <InfoTilesGrid>
        <InfoTile>
          <InfoTile.Label>Total {token.symbol} lent</InfoTile.Label>
          <InfoTile.Value>
            {token.format(totalLent, { style: 'compact' })} {token.symbol}
          </InfoTile.Value>
          <InfoTile.ComplementaryLine>{token.formatUSD(totalLent, { compact: true })}</InfoTile.ComplementaryLine>
        </InfoTile>
        <InfoTile>
          <InfoTile.Label>Lend APY</InfoTile.Label>
          <InfoTile.Value>{formatPercentage(apy)}</InfoTile.Value>
        </InfoTile>
        <SparkRewardsInfoTile sparkRewards={sparkRewards} />
      </InfoTilesGrid>
    </StatusPanelGrid>
  )
}
