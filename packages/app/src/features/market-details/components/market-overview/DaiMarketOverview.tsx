import { Token } from '@/domain/types/Token'
import { CooldownTimer } from '@/ui/molecules/cooldown-timer/CooldownTimer'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { DssAutoline } from '../../types'
import { Legend } from './components/LegendItem'
import { MarketOverviewChart, colors } from './components/MarketOverviewChart'
import { MarketOverviewContent } from './components/MarketOvierviewContent'

export interface DaiMarketOverviewProps {
  token: Token
  borrowed: NormalizedUnitNumber
  instantlyAvailable: NormalizedUnitNumber
  skyCapacity: NormalizedUnitNumber
  marketSize: NormalizedUnitNumber
  totalAvailable: NormalizedUnitNumber
  utilizationRate: Percentage
  dssAutoline: DssAutoline
}

export function DaiMarketOverview({
  token,
  marketSize,
  borrowed,
  instantlyAvailable,
  skyCapacity,
  utilizationRate,
  dssAutoline,
}: DaiMarketOverviewProps) {
  const chartData = [
    { value: borrowed.toNumber(), color: colors.borrow },
    { value: instantlyAvailable.toNumber(), color: colors.available },
    { value: skyCapacity.toNumber(), color: colors.sky },
  ]

  return (
    <MarketOverviewContent>
      <MarketOverviewChart
        data={chartData}
        token={token}
        marketSize={marketSize}
        borrowed={borrowed}
        utilizationRate={utilizationRate}
        className="max-w-md px-12"
      />
      <Legend>
        <Legend.Item variant="borrowed">{token.formatUSD(borrowed, { compact: true })}</Legend.Item>
        <Legend.Item variant="instantly-available">
          <div className="flex items-center gap-1.5">
            <div>{token.formatUSD(instantlyAvailable, { compact: true })}</div>
            <CooldownTimer
              renewalPeriod={dssAutoline.increaseCooldown}
              latestUpdateTimestamp={dssAutoline.lastIncreaseTimestamp}
            />
          </div>
        </Legend.Item>
        <Legend.Item variant="sky-capacity">{token.formatUSD(skyCapacity, { compact: true })}</Legend.Item>
      </Legend>
    </MarketOverviewContent>
  )
}
