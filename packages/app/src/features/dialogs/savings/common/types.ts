import { Token } from '@/domain/types/Token'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { TxOverviewRouteItem } from '../../common/types'

export interface TxOverview {
  underlyingToken: Token
  APY: Percentage
  stableEarnRate: NormalizedNumber
  route: TxOverviewRouteItem[]
  skyBadgeToken: Token
  outTokenAmount: NormalizedNumber
}

export type TxOverviewResult<T extends {}> =
  | {
      status: 'no-overview'
    }
  | ({
      status: 'success'
    } & T)

export type SavingsDialogTxOverview = TxOverviewResult<TxOverview>
