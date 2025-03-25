import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { TxOverviewRouteItem } from '../../common/types'

export interface TxOverview {
  underlyingToken: Token
  APY: Percentage
  stableEarnRate: NormalizedUnitNumber
  route: TxOverviewRouteItem[]
  skyBadgeToken: Token
  outTokenAmount: NormalizedUnitNumber
}

export type TxOverviewResult<T extends {}> =
  | {
      status: 'no-overview'
    }
  | ({
      status: 'success'
    } & T)

export type SavingsDialogTxOverview = TxOverviewResult<TxOverview>
