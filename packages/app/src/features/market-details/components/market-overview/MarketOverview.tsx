import { Token } from '@/domain/types/Token'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

import { DssAutoline } from '../../types'
import { DaiMarketOverview } from './DaiMarketOverview'
import { DefaultMarketOverview } from './DefaultMarketOverview'

export type MarketOverviewProps = { token: Token } & (
  | {
      type: 'default'
      marketSize: NormalizedNumber
      borrowed: NormalizedNumber
      available: NormalizedNumber
      utilizationRate: Percentage
    }
  | {
      type: 'dai'
      marketSize: NormalizedNumber
      borrowed: NormalizedNumber
      instantlyAvailable: NormalizedNumber
      skyCapacity: NormalizedNumber
      totalAvailable: NormalizedNumber
      utilizationRate: Percentage
      dssAutoline: DssAutoline
    }
)

export function MarketOverview(props: MarketOverviewProps) {
  if (props.type === 'dai') {
    return <DaiMarketOverview {...props} />
  }

  return <DefaultMarketOverview {...props} />
}
