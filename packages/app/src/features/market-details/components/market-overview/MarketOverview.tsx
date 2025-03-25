import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { DssAutoline } from '../../types'
import { DaiMarketOverview } from './DaiMarketOverview'
import { DefaultMarketOverview } from './DefaultMarketOverview'

export type MarketOverviewProps = { token: Token } & (
  | {
      type: 'default'
      marketSize: NormalizedUnitNumber
      borrowed: NormalizedUnitNumber
      available: NormalizedUnitNumber
      utilizationRate: Percentage
    }
  | {
      type: 'dai'
      marketSize: NormalizedUnitNumber
      borrowed: NormalizedUnitNumber
      instantlyAvailable: NormalizedUnitNumber
      skyCapacity: NormalizedUnitNumber
      totalAvailable: NormalizedUnitNumber
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
