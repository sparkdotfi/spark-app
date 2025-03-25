import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Legend } from './components/LegendItem'
import { MarketOverviewChart, colors } from './components/MarketOverviewChart'
import { MarketOverviewContent } from './components/MarketOvierviewContent'

export interface DefaultMarketOverviewProps {
  token: Token
  marketSize: NormalizedUnitNumber
  borrowed: NormalizedUnitNumber
  available: NormalizedUnitNumber
  utilizationRate: Percentage
}

export function DefaultMarketOverview({
  token,
  marketSize,
  borrowed,
  available,
  utilizationRate,
}: DefaultMarketOverviewProps) {
  const chartData = [
    { value: borrowed.toNumber(), color: colors.borrow },
    { value: available.toNumber(), color: colors.available },
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
        <Legend.Item variant="instantly-available">{token.formatUSD(available, { compact: true })}</Legend.Item>
      </Legend>
    </MarketOverviewContent>
  )
}
