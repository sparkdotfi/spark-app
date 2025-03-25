import { Token } from '@/domain/types/Token'
import { TxOverviewRouteItem } from '@/features/dialogs/common/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface CreateTxOverviewParams {
  inToken: Token
  outToken: Token
  amount: NormalizedUnitNumber
}

export type TxOverview =
  | { status: 'no-overview' }
  | { status: 'success'; route: TxOverviewRouteItem[]; inToken: Token; outcome: TxOverviewRouteItem }

export function createTxOverview({ inToken, outToken, amount }: CreateTxOverviewParams): TxOverview {
  if (amount.isZero()) {
    return { status: 'no-overview' }
  }

  const outcome = {
    token: outToken,
    value: amount,
    usdValue: outToken.toUSD(amount),
  }

  const route = [
    {
      token: inToken,
      value: amount,
      usdValue: inToken.toUSD(amount),
    },
    outcome,
  ]

  return {
    status: 'success',
    route,
    inToken,
    outcome,
  }
}
