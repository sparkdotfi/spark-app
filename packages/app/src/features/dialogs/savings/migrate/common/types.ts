import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { Percentage } from '@sparkdotfi/common-universal'
import { TxOverviewResult } from '../../common/types'

export interface TxOverview {
  apyChange?: { current: Percentage; updated: Percentage }
  route: TxOverviewRouteItem[]
}

export type MigrateDialogTxOverview = TxOverviewResult<TxOverview>
